package com.marketplace.service;

import com.marketplace.model.Catalogue;
import com.marketplace.model.Plan;
import com.marketplace.model.vendor.Vendor;
import com.marketplace.repository.CatalogueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Describes what a vendor's plan allows and how much of it they have used.
 *
 * <p>This is what the vendor dashboard reads instead of holding its own copy
 * of the limits. Before this existed the catalogue editor hardcoded
 * {@code maxAllowed = 5} images while the backend enforced 3 or 7 — a vendor
 * could add five and only discover the mismatch when saving failed. With one
 * server-side source there is no second copy to drift.
 */
@Service
@RequiredArgsConstructor
public class VendorEntitlementService {

    private final CatalogueRepository catalogueRepository;
    private final SubscriptionService subscriptionService;
    private final PlanVisibilityService planVisibilityService;

    /**
     * The vendor's current plan, resolved through their subscription so a
     * lapsed one correctly falls back to the default tier rather than trusting
     * the denormalised mirror on the vendor record.
     */
    public Plan resolvePlan(Vendor vendor) {
        return subscriptionService.getEffectivePlan(vendor);
    }

    /** Plan, limits, feature flags and live usage, as the vendor UI consumes it. */
    public Map<String, Object> describe(Vendor vendor) {
        Plan plan = resolvePlan(vendor);
        List<Catalogue> catalogues = catalogueRepository.findByVendorId(vendor.getId());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("plan", planSummary(plan));
        result.put("limits", limits(plan));
        result.put("features", features(plan));
        result.put("usage", usage(plan, catalogues));
        return result;
    }

    private Map<String, Object> planSummary(Plan plan) {
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("code", plan.getCode());
        summary.put("name", plan.getName());
        summary.put("tagline", plan.getTagline());
        summary.put("badgeColor", plan.getBadgeColor());
        summary.put("monthlyPricePaise", plan.getMonthlyPricePaise());
        summary.put("yearlyPricePaise", plan.getYearlyPricePaise());
        summary.put("currency", plan.getCurrency());
        summary.put("isDefault", plan.isDefault());
        return summary;
    }

    private Map<String, Object> limits(Plan plan) {
        Map<String, Object> limits = new LinkedHashMap<>();
        limits.put("maxCatalogues", plan.getMaxCatalogues());
        limits.put("maxItemsPerCatalogue", plan.getMaxItemsPerCatalogue());
        limits.put("maxImagesPerItem", plan.getMaxImagesPerItem());
        limits.put("maxCoverImages", plan.getMaxCoverImages());
        limits.put("maxDescriptionChars", plan.getMaxDescriptionChars());
        return limits;
    }

    private Map<String, Object> features(Plan plan) {
        Map<String, Object> features = new LinkedHashMap<>();
        features.put("allowsGetQuote", plan.isAllowsGetQuote());
        features.put("allowsPriceRange", plan.isAllowsPriceRange());
        features.put("allowsMaterialsDetails", plan.isAllowsMaterialsDetails());
        features.put("allowsProjectTimeline", plan.isAllowsProjectTimeline());
        features.put("allowsBeforeAfterImages", plan.isAllowsBeforeAfterImages());
        features.put("allowsVideo", plan.isAllowsVideo());
        features.put("allowsPdfBrochure", plan.isAllowsPdfBrochure());
        features.put("featuredBadge", plan.isFeaturedBadge());
        features.put("priorityVisibility", plan.isPriorityVisibility());
        features.put("allowsExtraCta", plan.isAllowsExtraCta());
        return features;
    }

    private Map<String, Object> usage(Plan plan, List<Catalogue> catalogues) {
        List<Catalogue> visible = planVisibilityService.visibleCatalogues(catalogues, plan);

        Map<String, Object> usage = new LinkedHashMap<>();
        usage.put("cataloguesUsed", catalogues.size());
        usage.put("cataloguesRemaining", remaining(catalogues.size(), plan.getMaxCatalogues()));
        // True once a vendor holds more than their plan permits — which happens
        // on a downgrade, or when an admin lowers a limit. Their content is
        // never deleted, only hidden from the public site.
        usage.put("overCatalogueLimit", !Plan.withinLimit(catalogues.size(), plan.getMaxCatalogues()));
        usage.put("cataloguesVisible", visible.size());
        usage.put("cataloguesLocked", catalogues.size() - visible.size());
        return usage;
    }

    /** Null when the plan is unlimited — there is no meaningful "remaining" count. */
    private Integer remaining(int used, int limit) {
        if (Plan.isUnlimited(limit)) {
            return null;
        }
        return Math.max(0, limit - used);
    }
}
