package com.marketplace.service;

import com.marketplace.model.Catalogue;
import com.marketplace.model.CatalogueItem;
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

    public Catalogue createCatalogue(String vendorEmail, Catalogue catalogue) {
        Vendor vendor = vendorRepository.findByEmail(vendorEmail)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        long existingCount = catalogueRepository.countByVendorId(vendor.getId());
        
        String plan = vendor.getSubscriptionPlan() != null ? vendor.getSubscriptionPlan().toUpperCase() : "BASIC";
        int maxCatalogues = "PREMIUM".equals(plan) ? 7 : 5;
        
        if (existingCount >= maxCatalogues) {
            throw new RuntimeException("Catalogue limit reached for " + plan + " plan. Maximum allowed: " + maxCatalogues);
        }

        catalogue.setVendorId(vendor.getId());
        catalogue.setType(plan);
        catalogue.setCreatedAt(Instant.now());
        catalogue.setUpdatedAt(Instant.now());
        
        if (catalogue.getItems() != null) {
            validateItems(catalogue.getItems(), plan);
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

        String plan = vendor.getSubscriptionPlan() != null ? vendor.getSubscriptionPlan().toUpperCase() : "BASIC";

        existing.setName(updatedData.getName());
        existing.setDescription(updatedData.getDescription());
        existing.setCoverImage(updatedData.getCoverImage());
        
        if (updatedData.getItems() != null) {
            validateItems(updatedData.getItems(), plan);
            for (CatalogueItem item : updatedData.getItems()) {
                if (item.getId() == null) {
                    item.setId(UUID.randomUUID().toString());
                }
                normalizeItemType(item);
            }
            existing.setItems(updatedData.getItems());
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
    
    public List<Catalogue> getCataloguesByEmail(String email) {
        Vendor vendor = vendorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        return catalogueRepository.findByVendorId(vendor.getId());
    }

    public Catalogue getCatalogueById(String catalogueId) {
        return catalogueRepository.findById(catalogueId)
                .orElseThrow(() -> new RuntimeException("Catalogue not found"));
    }

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

    private void validateItems(List<CatalogueItem> items, String plan) {
        int maxItems = 3;
        
        if (items.size() > maxItems) {
            throw new RuntimeException("Catalogue items limit reached. Maximum allowed per catalogue is 3 items.");
        }

        for (CatalogueItem item : items) {
            if ("BASIC".equals(plan)) {
                if (item.getImages() != null && item.getImages().size() > 3) {
                    throw new RuntimeException("Basic plan allows max 3 images per catalogue item.");
                }
                if (item.getVideoUrl() != null && !item.getVideoUrl().isEmpty()) {
                    throw new RuntimeException("Video uploads are only available for Premium vendors.");
                }
                if (item.getPdfBrochureUrl() != null && !item.getPdfBrochureUrl().isEmpty()) {
                    throw new RuntimeException("PDF Brochures are only available for Premium vendors.");
                }
                if (item.getBeforeAfterImages() != null && !item.getBeforeAfterImages().isEmpty()) {
                    throw new RuntimeException("Before/After images are only available for Premium vendors.");
                }
            } else if ("PREMIUM".equals(plan)) {
                if (item.getImages() != null && item.getImages().size() > 7) {
                    throw new RuntimeException("Premium plan allows max 7 images per catalogue item.");
                }
            }
        }
    }
}
