package com.marketplace.service;

import com.marketplace.model.Coupon;
import com.marketplace.model.Plan;
import com.marketplace.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Validates and applies admin-defined discount coupons at checkout.
 *
 * <p>Redemption counting is a compare-and-set on {@code redemptionCount}
 * against {@code maxRedemptions} ({@link #redeem}), the same pattern
 * {@code PaymentService} uses for idempotent payment settlement — so two
 * concurrent checkouts racing for the last redemption of a capped coupon
 * cannot both win.
 */
@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final MongoTemplate mongoTemplate;

    /**
     * Resolves a coupon for use against a specific plan, throwing a
     * user-facing message for every way it could be invalid. Does not
     * redeem it — call {@link #redeem} only once the payment actually
     * succeeds, so an abandoned checkout never consumes a limited coupon.
     */
    public Coupon validateForPlan(String code, Plan plan) {
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("Enter a coupon code");
        }
        Coupon coupon = couponRepository.findByCode(code.trim().toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("That coupon code doesn't exist"));

        if (!coupon.isActive()) {
            throw new IllegalArgumentException("That coupon is no longer active");
        }
        if (coupon.isExpired()) {
            throw new IllegalArgumentException("That coupon has expired");
        }
        if (coupon.isExhausted()) {
            throw new IllegalArgumentException("That coupon has reached its redemption limit");
        }
        if (!coupon.appliesToPlan(plan.getCode())) {
            throw new IllegalArgumentException("That coupon doesn't apply to the " + plan.getName() + " plan");
        }
        return coupon;
    }

    /** How much a valid coupon takes off a given amount, in paise — never more than the amount itself. */
    public long computeDiscount(Coupon coupon, long amountPaise) {
        long discount = Coupon.TYPE_PERCENTAGE.equals(coupon.getDiscountType())
                ? Math.round(amountPaise * (coupon.getDiscountValue() / 100.0))
                : coupon.getDiscountValue();
        return Math.max(0, Math.min(discount, amountPaise));
    }

    /**
     * Atomically records one redemption. Only called after a payment has
     * actually settled successfully. Returns false (rather than throwing) if
     * the coupon was exhausted in the meantime by a concurrent checkout — the
     * caller has already charged the vendor at the discounted price by then,
     * so this can only ever be a rare, harmless race, not a correctness bug.
     */
    public boolean redeem(String code) {
        if (code == null) return false;
        String normalizedCode = code.trim().toUpperCase();
        Coupon existing = couponRepository.findByCode(normalizedCode).orElse(null);
        if (existing == null) return false;

        Criteria criteria = Criteria.where("code").is(normalizedCode);
        if (existing.getMaxRedemptions() != null) {
            criteria = criteria.and("redemptionCount").lt(existing.getMaxRedemptions());
        }
        Query query = Query.query(criteria);
        Update update = new Update().inc("redemptionCount", 1).set("updatedAt", Instant.now());

        Coupon result = mongoTemplate.findAndModify(query, update,
                FindAndModifyOptions.options().returnNew(true), Coupon.class);
        return result != null;
    }

    public List<Coupon> getAll() {
        return couponRepository.findAll();
    }

    public Coupon create(Coupon incoming, String createdBy) {
        Coupon coupon = new Coupon();
        applyFields(coupon, incoming);
        coupon.setRedemptionCount(0);
        coupon.setCreatedAt(Instant.now());
        coupon.setUpdatedAt(Instant.now());
        coupon.setCreatedBy(createdBy);
        return couponRepository.save(coupon);
    }

    public Coupon update(String id, Coupon incoming) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found"));
        applyFields(coupon, incoming);
        coupon.setUpdatedAt(Instant.now());
        return couponRepository.save(coupon);
    }

    public void setActive(String id, boolean active) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found"));
        coupon.setActive(active);
        coupon.setUpdatedAt(Instant.now());
        couponRepository.save(coupon);
    }

    public void delete(String id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found"));
        if (coupon.getRedemptionCount() > 0) {
            throw new IllegalArgumentException(
                    coupon.getRedemptionCount() + " vendor(s) have already used this coupon — deactivate it instead of deleting it, so past redemptions keep their history.");
        }
        couponRepository.deleteById(id);
    }

    private void applyFields(Coupon coupon, Coupon incoming) {
        if (incoming.getCode() == null || incoming.getCode().isBlank()) {
            throw new IllegalArgumentException("Coupon code is required");
        }
        String normalizedCode = incoming.getCode().trim().toUpperCase();
        Optional<Coupon> clash = couponRepository.findByCode(normalizedCode);
        if (clash.isPresent() && !clash.get().getId().equals(coupon.getId())) {
            throw new IllegalArgumentException("Coupon code \"" + normalizedCode + "\" is already in use");
        }

        if (!Coupon.TYPE_PERCENTAGE.equals(incoming.getDiscountType()) && !Coupon.TYPE_FLAT.equals(incoming.getDiscountType())) {
            throw new IllegalArgumentException("discountType must be PERCENTAGE or FLAT");
        }
        if (Coupon.TYPE_PERCENTAGE.equals(incoming.getDiscountType())) {
            if (incoming.getDiscountValue() < 1 || incoming.getDiscountValue() > 100) {
                throw new IllegalArgumentException("A percentage coupon must be between 1 and 100");
            }
        } else if (incoming.getDiscountValue() < 1) {
            throw new IllegalArgumentException("A flat-amount coupon must be worth more than ₹0");
        }
        if (incoming.getMaxRedemptions() != null && incoming.getMaxRedemptions() < 1) {
            throw new IllegalArgumentException("maxRedemptions must be at least 1, or left empty for unlimited");
        }

        coupon.setCode(normalizedCode);
        coupon.setDescription(incoming.getDescription() != null ? incoming.getDescription().trim() : null);
        coupon.setDiscountType(incoming.getDiscountType());
        coupon.setDiscountValue(incoming.getDiscountValue());
        coupon.setApplicablePlanCodes(incoming.getApplicablePlanCodes());
        coupon.setExpiresAt(incoming.getExpiresAt());
        coupon.setMaxRedemptions(incoming.getMaxRedemptions());
        coupon.setActive(incoming.isActive());
    }
}
