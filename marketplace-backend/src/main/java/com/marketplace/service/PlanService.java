package com.marketplace.service;

import com.marketplace.model.Plan;
import com.marketplace.repository.PlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * The single source of truth for what each subscription tier allows.
 *
 * <p>Every enforcement point in the app — catalogue limits, premium fields,
 * featured badges, listing order, checkout pricing — resolves through here, so
 * an admin edit takes effect everywhere at once with no restart.
 *
 * <p>Reads are cached because they sit on hot paths (every catalogue save,
 * every storefront render). The cache is cleared on any write, so an admin
 * change is visible on the very next request rather than after a TTL.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PlanService {

    private final PlanRepository planRepository;

    private final Map<String, Plan> cacheByCode = new ConcurrentHashMap<>();

    /**
     * The plan for a code, falling back to the default tier when the code is
     * unknown or absent. Never returns null: callers treat a plan as always
     * available, the same way {@code PlatformSettingsService.get()} behaves.
     */
    public Plan getByCode(String code) {
        if (code == null || code.isBlank()) {
            return getDefaultPlan();
        }
        String normalized = code.trim().toUpperCase();

        Plan cached = cacheByCode.get(normalized);
        if (cached != null) {
            return cached;
        }

        return planRepository.findByCode(normalized)
                .map(plan -> {
                    cacheByCode.put(normalized, plan);
                    return plan;
                })
                // A subscription referencing a deleted plan must not break the
                // vendor's account — they fall back to the default tier.
                .orElseGet(this::getDefaultPlan);
    }

    /** The fallback tier every vendor without an active subscription sits on. */
    public Plan getDefaultPlan() {
        Plan cached = cacheByCode.get("__default__");
        if (cached != null) {
            return cached;
        }

        Plan plan = planRepository.findByIsDefaultTrue()
                .orElseThrow(() -> new IllegalStateException(
                        "No default plan configured — PlanSeeder should have created one"));
        cacheByCode.put("__default__", plan);
        return plan;
    }

    public List<Plan> getAllOrdered() {
        return planRepository.findAll().stream()
                .sorted(Comparator.comparing(Plan::getDisplayOrder,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

    /** Plans a vendor can actually buy right now — what the pricing page shows. */
    public List<Plan> getPurchasable() {
        return getAllOrdered().stream().filter(Plan::isPurchasable).toList();
    }

    public Optional<Plan> findByCode(String code) {
        return code == null ? Optional.empty() : planRepository.findByCode(code.trim().toUpperCase());
    }

    // ------------------------------------------------------------------ writes

    public Plan create(Plan incoming, String updatedBy) {
        if (incoming.getCode() == null || incoming.getCode().isBlank()) {
            throw new IllegalArgumentException("Plan code is required");
        }
        String code = incoming.getCode().trim().toUpperCase();
        if (planRepository.existsByCode(code)) {
            throw new IllegalArgumentException("A plan with code " + code + " already exists");
        }

        incoming.setId(null);
        incoming.setCode(code);
        // A second default would make "which plan is the fallback" ambiguous.
        incoming.setDefault(false);
        if (incoming.getDisplayOrder() == null) {
            incoming.setDisplayOrder(nextDisplayOrder());
        }
        validate(incoming);

        incoming.setCreatedAt(Instant.now());
        incoming.setUpdatedAt(Instant.now());
        incoming.setUpdatedBy(updatedBy);

        Plan saved = planRepository.save(incoming);
        evictCache();
        return saved;
    }

    /**
     * Applies an admin edit. Fields are copied explicitly rather than saving
     * the incoming object wholesale, so a partial payload cannot blank the
     * audit fields, flip the default flag, or rewrite the immutable code.
     */
    public Plan update(String code, Plan updates, String updatedBy) {
        Plan plan = planRepository.findByCode(code.trim().toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Plan not found: " + code));

        // A blank name is rejected rather than ignored: the admin form sends
        // the whole object, so silently keeping the old name would show
        // "saved" and then reappear unchanged on reload.
        if (updates.getName() != null) {
            if (updates.getName().isBlank()) {
                throw new IllegalArgumentException("Plan name cannot be empty");
            }
            plan.setName(updates.getName().trim());
        }
        if (updates.getTagline() != null) plan.setTagline(updates.getTagline().trim());
        if (updates.getDescription() != null) plan.setDescription(updates.getDescription().trim());
        if (updates.getDisplayOrder() != null) plan.setDisplayOrder(updates.getDisplayOrder());
        if (updates.getBadgeColor() != null && !updates.getBadgeColor().isBlank()) {
            plan.setBadgeColor(updates.getBadgeColor().trim());
        }
        plan.setHighlighted(updates.isHighlighted());

        plan.setMonthlyPricePaise(updates.getMonthlyPricePaise());
        plan.setYearlyPricePaise(updates.getYearlyPricePaise());
        plan.setPurchasable(updates.isPurchasable());

        plan.setMaxCatalogues(updates.getMaxCatalogues());
        plan.setMaxItemsPerCatalogue(updates.getMaxItemsPerCatalogue());
        plan.setMaxImagesPerItem(updates.getMaxImagesPerItem());
        plan.setMaxCoverImages(updates.getMaxCoverImages());
        plan.setMaxDescriptionChars(updates.getMaxDescriptionChars());

        plan.setAllowsGetQuote(updates.isAllowsGetQuote());
        plan.setAllowsPriceRange(updates.isAllowsPriceRange());
        plan.setAllowsMaterialsDetails(updates.isAllowsMaterialsDetails());
        plan.setAllowsProjectTimeline(updates.isAllowsProjectTimeline());
        plan.setAllowsBeforeAfterImages(updates.isAllowsBeforeAfterImages());
        plan.setAllowsVideo(updates.isAllowsVideo());
        plan.setAllowsPdfBrochure(updates.isAllowsPdfBrochure());
        plan.setFeaturedBadge(updates.isFeaturedBadge());
        plan.setPriorityVisibility(updates.isPriorityVisibility());
        plan.setAllowsExtraCta(updates.isAllowsExtraCta());

        plan.setAllowsProfileViewsCount(updates.isAllowsProfileViewsCount());
        plan.setAllowsQuoteTrend(updates.isAllowsQuoteTrend());
        plan.setAllowsViewsTrend(updates.isAllowsViewsTrend());
        plan.setAllowsRatingTrend(updates.isAllowsRatingTrend());
        plan.setAllowsConversionInsights(updates.isAllowsConversionInsights());
        plan.setAllowsFavoritesInsights(updates.isAllowsFavoritesInsights());

        validate(plan);

        plan.setUpdatedAt(Instant.now());
        plan.setUpdatedBy(updatedBy);

        Plan saved = planRepository.save(plan);
        evictCache();
        return saved;
    }

    public void delete(String code, long subscriberCount) {
        Plan plan = planRepository.findByCode(code.trim().toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Plan not found: " + code));

        if (plan.isDefault()) {
            throw new IllegalArgumentException(
                    "The default plan cannot be deleted — every vendor without a subscription falls back to it");
        }
        if (subscriberCount > 0) {
            throw new IllegalArgumentException(
                    subscriberCount + " vendor(s) are on this plan. Move them off it first, "
                            + "or mark the plan unpurchasable to retire it without affecting them.");
        }

        planRepository.delete(plan);
        evictCache();
    }

    /** Persists a new pricing-page column order in one call. */
    public int reorder(List<String> orderedCodes) {
        int order = 1;
        int updated = 0;
        for (String code : orderedCodes) {
            Optional<Plan> found = planRepository.findByCode(code.trim().toUpperCase());
            if (found.isPresent()) {
                Plan plan = found.get();
                plan.setDisplayOrder(order);
                plan.setUpdatedAt(Instant.now());
                planRepository.save(plan);
                updated++;
            }
            order++;
        }
        evictCache();
        return updated;
    }

    /** Called by the seeder, which manages its own audit fields. */
    public Plan saveRaw(Plan plan) {
        Plan saved = planRepository.save(plan);
        evictCache();
        return saved;
    }

    public void evictCache() {
        cacheByCode.clear();
    }

    // -------------------------------------------------------------- validation

    private void validate(Plan plan) {
        if (plan.getName() == null || plan.getName().isBlank()) {
            throw new IllegalArgumentException("Plan name is required");
        }
        if (plan.getMonthlyPricePaise() < 0) {
            throw new IllegalArgumentException("Price cannot be negative");
        }
        if (plan.getYearlyPricePaise() != null && plan.getYearlyPricePaise() < 0) {
            throw new IllegalArgumentException("Yearly price cannot be negative");
        }

        requireValidLimit("Catalogues", plan.getMaxCatalogues());
        requireValidLimit("Items per catalogue", plan.getMaxItemsPerCatalogue());
        requireValidLimit("Images per item", plan.getMaxImagesPerItem());
        requireValidLimit("Cover images", plan.getMaxCoverImages());
        requireValidLimit("Description length", plan.getMaxDescriptionChars());

        if (plan.isDefault()) {
            // Every vendor falls back to this tier, so it has to remain
            // reachable and free — otherwise a vendor with no subscription
            // would be sitting on a plan they never bought.
            if (plan.getMonthlyPricePaise() != 0) {
                throw new IllegalArgumentException("The default plan must be free");
            }
            if (!plan.isPurchasable()) {
                throw new IllegalArgumentException("The default plan cannot be made unpurchasable");
            }
        }
    }

    /**
     * 0 is allowed and means "none permitted" — a deliberately restrictive
     * tier (say a free plan that grants a storefront but no catalogues) is a
     * legitimate configuration, so only values below the unlimited sentinel
     * are rejected.
     */
    private void requireValidLimit(String label, int value) {
        if (value < Plan.UNLIMITED) {
            throw new IllegalArgumentException(
                    label + " must be 0 or more, or -1 for unlimited (got " + value + ")");
        }
    }

    private int nextDisplayOrder() {
        return planRepository.findAll().stream()
                .map(Plan::getDisplayOrder)
                .filter(java.util.Objects::nonNull)
                .max(Integer::compareTo)
                .orElse(0) + 1;
    }
}
