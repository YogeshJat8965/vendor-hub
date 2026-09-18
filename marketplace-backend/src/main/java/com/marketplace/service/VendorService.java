package com.marketplace.service;

import com.marketplace.model.Plan;
import com.marketplace.model.vendor.Vendor;
import com.marketplace.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VendorService {

    private final VendorRepository vendorRepository;
    private final SubscriptionService subscriptionService;

    /**
     * Every active vendor, ordered for the public listing: vendors on a plan
     * with {@code priorityVisibility} first, then by how good a plan they're
     * on (a paid tier outranks a free one even without the priority flag),
     * and each vendor's public-facing fields shaped by their plan on the way
     * out — the featured badge and the extra CTA fields (see
     * {@link #applyPlanPresentation}).
     *
     * <p>This is the base order "Recommended" on the explore page relies on;
     * an explicit sort chosen there (Highest Rated, Newest) is applied
     * client-side afterward and overrides it, as intended.
     */
    public List<Vendor> getAllActiveVendors() {
        List<Vendor> vendors = vendorRepository.findByStatus("ACTIVE");

        // Resolved once per vendor and reused for both the sort key and the
        // presentation pass below, rather than resolving the plan twice.
        return vendors.stream()
                .map(vendor -> new RankedVendor(vendor, subscriptionService.getEffectivePlan(vendor)))
                .sorted(Comparator
                        .comparingInt(RankedVendor::priorityRank)
                        .thenComparing(RankedVendor::displayOrder, Comparator.reverseOrder()))
                .map(ranked -> applyPlanPresentation(ranked.vendor(), ranked.plan()))
                .toList();
    }

    /**
     * Pairs a vendor with its resolved plan just long enough to sort by it.
     * {@code priorityRank}: plans with {@code priorityVisibility} sort first
     * (0), everyone else after (1). {@code displayOrder} (descending) is the
     * secondary key, so within either group a better-ranked plan (e.g. Basic
     * over Free) still outranks a lesser one even without the priority flag.
     */
    private record RankedVendor(Vendor vendor, Plan plan) {
        int priorityRank() {
            return plan.isPriorityVisibility() ? 0 : 1;
        }
        int displayOrder() {
            return plan.getDisplayOrder() == null ? 0 : plan.getDisplayOrder();
        }
    }

    public Vendor getVendorBySlug(String slug) {
        Vendor vendor = vendorRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        return applyPlanPresentation(vendor, subscriptionService.getEffectivePlan(vendor));
    }

    public Vendor getVendorById(String id) {
        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        return applyPlanPresentation(vendor, subscriptionService.getEffectivePlan(vendor));
    }

    public Vendor getVendorByEmail(String email) {
        return vendorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
    }

    public List<Vendor> getVendorsByCity(String city) {
        return vendorRepository.findByCity(city);
    }

    public List<Vendor> getVendorsByType(String vendorType) {
        return vendorRepository.findByVendorType(vendorType);
    }

    public boolean checkSlugAvailability(String storeName) {
        String slug = com.marketplace.util.SlugGenerator.generateSlug(storeName);
        return !vendorRepository.existsBySlug(slug);
    }

    public Vendor updateVendor(String slug, Vendor updates) {
        Vendor vendor = getVendorBySlug(slug);

        if (updates.getBusinessName() != null) vendor.setBusinessName(updates.getBusinessName());
        if (updates.getOwnerName() != null) vendor.setOwnerName(updates.getOwnerName());
        if (updates.getMobile() != null) vendor.setMobile(updates.getMobile());
        if (updates.getCity() != null) vendor.setCity(updates.getCity());
        if (updates.getPincode() != null) vendor.setPincode(updates.getPincode());
        if (updates.getLogoUrl() != null) vendor.setLogoUrl(updates.getLogoUrl());
        if (updates.getBannerUrl() != null) vendor.setBannerUrl(updates.getBannerUrl());
        if (updates.getThemeColor() != null) vendor.setThemeColor(updates.getThemeColor());

        vendor.setUpdatedAt(java.time.Instant.now());
        return vendorRepository.save(vendor);
    }

    public Vendor updateVendorByEmail(String email, Vendor updates) {
        Vendor vendor = getVendorByEmail(email);

        if (updates.getBusinessName() != null && !updates.getBusinessName().equals(vendor.getBusinessName())) {
            vendor.setBusinessName(updates.getBusinessName());

            // Generate unique slug based on new business name
            String baseSlug = com.marketplace.util.SlugGenerator.generateSlug(updates.getBusinessName());
            String newSlug = baseSlug;
            int counter = 1;
            while (vendorRepository.existsBySlug(newSlug)) {
                newSlug = baseSlug + "-" + counter;
                counter++;
            }
            vendor.setSlug(newSlug);
        }
        if (updates.getOwnerName() != null) vendor.setOwnerName(updates.getOwnerName());
        if (updates.getMobile() != null) vendor.setMobile(updates.getMobile());
        if (updates.getCity() != null) vendor.setCity(updates.getCity());
        if (updates.getPincode() != null) vendor.setPincode(updates.getPincode());
        if (updates.getLogoUrl() != null) vendor.setLogoUrl(updates.getLogoUrl());
        if (updates.getBannerUrl() != null) vendor.setBannerUrl(updates.getBannerUrl());
        if (updates.getThemeColor() != null) vendor.setThemeColor(updates.getThemeColor());
        if (updates.getServices() != null) vendor.setServices(updates.getServices());
        if (updates.getGallery() != null) vendor.setGallery(updates.getGallery());
        if (updates.getDescription() != null) vendor.setDescription(updates.getDescription());
        if (updates.getLongDescription() != null) vendor.setLongDescription(updates.getLongDescription());
        if (updates.getPhone() != null) vendor.setPhone(updates.getPhone());
        if (updates.getWebsite() != null) vendor.setWebsite(updates.getWebsite());
        if (updates.getAddress() != null) vendor.setAddress(updates.getAddress());
        if (updates.getState() != null) vendor.setState(updates.getState());
        if (updates.getYearsInBusiness() != null) vendor.setYearsInBusiness(updates.getYearsInBusiness());
        if (updates.getVendorType() != null) vendor.setVendorType(updates.getVendorType());

        applyCtaUpdates(vendor, updates);

        vendor.setUpdatedAt(java.time.Instant.now());
        return vendorRepository.save(vendor);
    }

    /**
     * The extra CTA fields are refused outright for a plan that doesn't
     * include them — not merely hidden — matching how Premium-only catalogue
     * fields are enforced in {@code CatalogueService}. A vendor cannot end up
     * with WhatsApp/Call/custom-CTA data saved on a Free account by sending
     * it directly to the API, only to have it silently reappear on upgrade;
     * they have to actually be entitled at the moment they set it.
     */
    private void applyCtaUpdates(Vendor vendor, Vendor updates) {
        boolean touchesCta = updates.getWhatsappNumber() != null || updates.getCallNumber() != null
                || updates.getCustomCtaLabel() != null || updates.getCustomCtaUrl() != null;
        if (!touchesCta) {
            return;
        }

        Plan plan = subscriptionService.getEffectivePlan(vendor);
        if (!plan.isAllowsExtraCta()) {
            throw new RuntimeException("Call, WhatsApp and custom contact buttons aren't included in the "
                    + plan.getName() + " plan. Upgrade to a plan with priority contact options to add them.");
        }

        if (updates.getWhatsappNumber() != null) vendor.setWhatsappNumber(blankToNull(updates.getWhatsappNumber()));
        if (updates.getCallNumber() != null) vendor.setCallNumber(blankToNull(updates.getCallNumber()));
        if (updates.getCustomCtaLabel() != null) vendor.setCustomCtaLabel(blankToNull(updates.getCustomCtaLabel()));
        if (updates.getCustomCtaUrl() != null) vendor.setCustomCtaUrl(blankToNull(updates.getCustomCtaUrl()));
    }

    private String blankToNull(String value) {
        return value.isBlank() ? null : value;
    }

    /**
     * Shapes a vendor for a reader outside the vendor's own dashboard: sets
     * the featured/priority flags from their real plan, and strips the extra
     * CTA fields when the plan no longer includes them — so a vendor who
     * downgraded after being Premium doesn't keep showing WhatsApp/Call
     * buttons the public storefront and explore page shouldn't offer anymore.
     *
     * <p>Mutates the vendor instance that was just loaded for this request
     * rather than copying it, the same pattern {@code CatalogueService}
     * already uses for the {@code locked} marker — safe here because every
     * caller only reads the result and never saves it back.
     */
    private Vendor applyPlanPresentation(Vendor vendor, Plan plan) {
        vendor.setFeaturedBadge(plan.isFeaturedBadge());
        vendor.setPriorityVisibility(plan.isPriorityVisibility());

        if (!plan.isAllowsExtraCta()) {
            vendor.setWhatsappNumber(null);
            vendor.setCallNumber(null);
            vendor.setCustomCtaLabel(null);
            vendor.setCustomCtaUrl(null);
        }

        return vendor;
    }
}
