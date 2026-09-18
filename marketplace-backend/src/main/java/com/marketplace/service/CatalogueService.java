package com.marketplace.service;

import com.marketplace.model.Catalogue;
import com.marketplace.model.CatalogueItem;
import com.marketplace.model.Plan;
import com.marketplace.model.vendor.Vendor;
import com.marketplace.repository.CatalogueRepository;
import com.marketplace.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CatalogueService {

    private final CatalogueRepository catalogueRepository;
    private final VendorRepository vendorRepository;
    private final SubscriptionService subscriptionService;
    private final PlanService planService;
    private final PlanVisibilityService planVisibilityService;

    public Catalogue createCatalogue(String vendorEmail, Catalogue catalogue) {
        Vendor vendor = vendorRepository.findByEmail(vendorEmail)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        Plan plan = subscriptionService.getEffectivePlan(vendor);
        long existingCount = catalogueRepository.countByVendorId(vendor.getId());

        if (!Plan.withinLimit(existingCount + 1, plan.getMaxCatalogues())) {
            throw new RuntimeException(limitMessage(
                    "You've used all " + plan.getMaxCatalogues() + " catalogue(s)", plan, "more catalogues"));
        }

        catalogue.setVendorId(vendor.getId());
        catalogue.setType(plan.getCode());
        catalogue.setCreatedAt(Instant.now());
        catalogue.setUpdatedAt(Instant.now());

        validateCatalogue(catalogue, plan);

        if (catalogue.getItems() != null) {
            for (CatalogueItem item : catalogue.getItems()) {
                if (item.getId() == null) {
                    item.setId(UUID.randomUUID().toString());
                }
                normalizeItemType(item);
            }
        }

        return catalogueRepository.save(catalogue);
    }

    public Catalogue updateCatalogue(String vendorEmail, String catalogueId, Catalogue updatedData) {
        Vendor vendor = vendorRepository.findByEmail(vendorEmail)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        Catalogue existing = catalogueRepository.findById(catalogueId)
                .orElseThrow(() -> new RuntimeException("Catalogue not found"));

        if (!existing.getVendorId().equals(vendor.getId())) {
            throw new RuntimeException("Unauthorized access to catalogue");
        }

        Plan plan = subscriptionService.getEffectivePlan(vendor);

        existing.setName(updatedData.getName());
        existing.setDescription(updatedData.getDescription());
        existing.setCoverImage(updatedData.getCoverImage());

        if (updatedData.getItems() != null) {
            existing.setItems(updatedData.getItems());
        }

        validateCatalogue(existing, plan);

        if (existing.getItems() != null) {
            for (CatalogueItem item : existing.getItems()) {
                if (item.getId() == null) {
                    item.setId(UUID.randomUUID().toString());
                }
                normalizeItemType(item);
            }
        }

        existing.setUpdatedAt(Instant.now());
        return catalogueRepository.save(existing);
    }

    public void deleteCatalogue(String vendorEmail, String catalogueId) {
        Vendor vendor = vendorRepository.findByEmail(vendorEmail)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        Catalogue existing = catalogueRepository.findById(catalogueId)
                .orElseThrow(() -> new RuntimeException("Catalogue not found"));

        if (!existing.getVendorId().equals(vendor.getId())) {
            throw new RuntimeException("Unauthorized access to catalogue");
        }

        catalogueRepository.deleteById(catalogueId);
    }

    public List<Catalogue> getVendorCatalogues(String vendorId) {
        return catalogueRepository.findByVendorId(vendorId);
    }

    /**
     * The vendor's own catalogues — all of them, including any their plan has
     * locked, each flagged so the dashboard can show it greyed out with an
     * upgrade prompt rather than pretending it no longer exists.
     */
    public List<Catalogue> getCataloguesByEmail(String email) {
        Vendor vendor = vendorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        Plan plan = subscriptionService.getEffectivePlan(vendor);
        List<Catalogue> all = catalogueRepository.findByVendorId(vendor.getId());
        List<Catalogue> visible = planVisibilityService.visibleCatalogues(all, plan);

        all.forEach(catalogue -> catalogue.setLocked(
                visible.stream().noneMatch(v -> v.getId().equals(catalogue.getId()))));
        return all;
    }

    public Catalogue getCatalogueById(String catalogueId) {
        return catalogueRepository.findById(catalogueId)
                .orElseThrow(() -> new RuntimeException("Catalogue not found"));
    }

    // ------------------------------------------------------------ public views

    /**
     * What the public may see of a vendor's catalogues: over-limit catalogues
     * dropped and any field their plan doesn't include stripped. Nothing is
     * deleted — this only shapes the response.
     */
    public List<Catalogue> getPublicCataloguesByVendorId(String vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId).orElse(null);
        Plan plan = subscriptionService.getEffectivePlan(vendor);
        return planVisibilityService.publicViews(catalogueRepository.findByVendorId(vendorId), plan);
    }

    /**
     * A single catalogue as the public sees it, or null when the vendor's plan
     * no longer permits it to be shown.
     */
    public Catalogue getPublicCatalogueById(String catalogueId) {
        Catalogue catalogue = getCatalogueById(catalogueId);
        Vendor vendor = vendorRepository.findById(catalogue.getVendorId()).orElse(null);
        Plan plan = subscriptionService.getEffectivePlan(vendor);

        List<Catalogue> all = catalogueRepository.findByVendorId(catalogue.getVendorId());
        if (planVisibilityService.isCatalogueLocked(catalogue, all, plan)) {
            return null;
        }
        return planVisibilityService.publicView(catalogue, plan);
    }

    // -------------------------------------------------------------- validation

    /**
     * Defaults missing itemType to SERVICE (keeps pre-existing catalogues,
     * saved before this field existed, behaving exactly as before) and
     * clears whichever type-specific fields don't apply, so switching an
     * item between Service and Product doesn't leave stale data behind.
     */
    private void normalizeItemType(CatalogueItem item) {
        String type = item.getItemType();
        if (type == null || type.isBlank()) {
            type = "SERVICE";
        }
        type = type.toUpperCase();
        item.setItemType(type);

        if ("PRODUCT".equals(type)) {
            item.setPriceRange(null);
            item.setMaterialsDetails(null);
            item.setProjectTimeline(null);
            if (item.getStockQuantity() != null && item.getStockQuantity() < 0) {
                throw new RuntimeException("Stock quantity cannot be negative.");
            }
        } else {
            item.setStockStatus(null);
            item.setStockQuantity(null);
        }
    }

    /**
     * Enforces every limit and feature the vendor's plan defines.
     *
     * <p>All values come from the {@link Plan} document, never from literals
     * here — an admin changing a limit takes effect on the next save with no
     * code change.
     */
    private void validateCatalogue(Catalogue catalogue, Plan plan) {
        if (exceeds(catalogue.getDescription(), plan.getMaxDescriptionChars())) {
            throw new RuntimeException(limitMessage(
                    "Catalogue description is limited to " + plan.getMaxDescriptionChars()
                            + " characters (yours is " + catalogue.getDescription().length() + ")",
                    plan, "longer descriptions"));
        }

        List<CatalogueItem> items = catalogue.getItems();
        if (items == null || items.isEmpty()) {
            return;
        }

        if (!Plan.withinLimit(items.size(), plan.getMaxItemsPerCatalogue())) {
            throw new RuntimeException(limitMessage(
                    "This catalogue has " + items.size() + " items but your plan allows "
                            + plan.getMaxItemsPerCatalogue(),
                    plan, "more items per catalogue"));
        }

        for (CatalogueItem item : items) {
            validateItem(item, plan);
        }
    }

    private void validateItem(CatalogueItem item, Plan plan) {
        String label = item.getTitle() == null || item.getTitle().isBlank() ? "An item" : "\"" + item.getTitle() + "\"";

        if (item.getImages() != null && !Plan.withinLimit(item.getImages().size(), plan.getMaxImagesPerItem())) {
            throw new RuntimeException(limitMessage(
                    label + " has " + item.getImages().size() + " images but your plan allows "
                            + plan.getMaxImagesPerItem(),
                    plan, "more images per item"));
        }

        if (exceeds(item.getDescription(), plan.getMaxDescriptionChars())) {
            throw new RuntimeException(limitMessage(
                    label + "'s description is limited to " + plan.getMaxDescriptionChars()
                            + " characters (yours is " + item.getDescription().length() + ")",
                    plan, "longer descriptions"));
        }

        requireFeature(plan.isAllowsPriceRange(), hasText(item.getPriceRange()),
                label + ": a detailed price range", plan);
        requireFeature(plan.isAllowsMaterialsDetails(), hasText(item.getMaterialsDetails()),
                label + ": materials details", plan);
        requireFeature(plan.isAllowsProjectTimeline(), hasText(item.getProjectTimeline()),
                label + ": a project timeline", plan);
        requireFeature(plan.isAllowsVideo(), hasText(item.getVideoUrl()),
                label + ": video", plan);
        requireFeature(plan.isAllowsPdfBrochure(), hasText(item.getPdfBrochureUrl()),
                label + ": a PDF brochure", plan);
        requireFeature(plan.isAllowsBeforeAfterImages(),
                item.getBeforeAfterImages() != null && !item.getBeforeAfterImages().isEmpty(),
                label + ": before/after images", plan);
    }

    private void requireFeature(boolean allowed, boolean used, String what, Plan plan) {
        if (used && !allowed) {
            throw new RuntimeException(limitMessage(
                    what + " isn't included in the " + plan.getName() + " plan", plan, what));
        }
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private boolean exceeds(String value, int limit) {
        return value != null && !Plan.isUnlimited(limit) && value.length() > limit;
    }

    /**
     * Error messages name the limit, the current plan, and point at the
     * cheapest plan that would lift the restriction — so a vendor who hits a
     * wall knows exactly what to do about it.
     */
    private String limitMessage(String problem, Plan plan, String wanted) {
        String upgrade = planService.getPurchasable().stream()
                .filter(candidate -> candidate.getMonthlyPricePaise() > plan.getMonthlyPricePaise())
                .findFirst()
                .map(candidate -> " Upgrade to " + candidate.getName() + " for " + wanted + ".")
                .orElse("");
        return problem + " on the " + plan.getName() + " plan." + upgrade;
    }
}
