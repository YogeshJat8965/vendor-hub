package com.marketplace.service;

import com.marketplace.model.Plan;
import com.marketplace.model.Subscription;
import com.marketplace.model.vendor.Vendor;
import com.marketplace.repository.SubscriptionRepository;
import com.marketplace.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

/**
 * Resolves which plan a vendor is actually on.
 *
 * <p>{@link #getEffectivePlan} is the single answer to that question for the
 * whole application. Reading {@code Vendor.subscriptionPlan} directly is not
 * equivalent: that field is a denormalised mirror kept for fast listing and
 * filtering, and it cannot express "their subscription lapsed yesterday". A
 * vendor with an expired subscription must fall back to the default tier
 * immediately, whatever the mirror still says.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final VendorRepository vendorRepository;
    private final PlanService planService;

    /** The vendor's live subscription, if they have one that hasn't lapsed. */
    public Optional<Subscription> getActiveSubscription(String vendorId) {
        return subscriptionRepository
                .findFirstByVendorIdAndStatusOrderByCurrentPeriodEndDesc(vendorId, Subscription.STATUS_ACTIVE)
                .filter(Subscription::isCurrentlyActive);
    }

    /**
     * The plan whose limits and features apply to this vendor right now.
     * Never null — an absent, lapsed or cancelled subscription resolves to the
     * default tier.
     */
    public Plan getEffectivePlan(Vendor vendor) {
        if (vendor == null) {
            return planService.getDefaultPlan();
        }
        return getActiveSubscription(vendor.getId())
                .map(sub -> planService.getByCode(sub.getPlanCode()))
                .orElseGet(planService::getDefaultPlan);
    }

    public Plan getEffectivePlanBySlug(String vendorSlug) {
        return vendorRepository.findBySlug(vendorSlug)
                .map(this::getEffectivePlan)
                .orElseGet(planService::getDefaultPlan);
    }

    /**
     * Ends a subscription right now, at the admin's discretion — there is no
     * refund and no vendor-initiated equivalent; access is revoked
     * immediately rather than at period end.
     */
    public Subscription endImmediately(String subscriptionId, String reason, String adminActor) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found"));
        if (!Subscription.STATUS_ACTIVE.equals(subscription.getStatus())) {
            throw new IllegalArgumentException("Only an active subscription can be ended");
        }

        subscription.setStatus(Subscription.STATUS_CANCELLED);
        subscription.setCancelledAt(Instant.now());
        subscription.setAdminNote(joinNote(subscription.getAdminNote(),
                "Ended by admin " + adminActor + (reason != null && !reason.isBlank() ? ": " + reason : "")));
        subscription.setUpdatedAt(Instant.now());
        Subscription saved = subscriptionRepository.save(subscription);

        vendorRepository.findById(saved.getVendorId()).ifPresent(this::syncPlanMirror);
        return saved;
    }

    private String joinNote(String existing, String addition) {
        return (existing == null || existing.isBlank()) ? addition : existing + " | " + addition;
    }

    /**
     * Brings {@code Vendor.subscriptionPlan} back in line with the vendor's
     * real entitlement. Called whenever a subscription starts, ends or is
     * cancelled, so admin listings and filters never show a stale plan.
     */
    public Vendor syncPlanMirror(Vendor vendor) {
        Plan effective = getEffectivePlan(vendor);
        if (!effective.getCode().equalsIgnoreCase(vendor.getSubscriptionPlan())) {
            log.info("Vendor {} plan mirror {} -> {}", vendor.getId(), vendor.getSubscriptionPlan(), effective.getCode());
            vendor.setSubscriptionPlan(effective.getCode());
            vendor.setUpdatedAt(Instant.now());
            return vendorRepository.save(vendor);
        }
        return vendor;
    }
}
