package com.marketplace.service;

import com.marketplace.model.vendor.Vendor;
import com.marketplace.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VendorService {
    
    private final VendorRepository vendorRepository;
    
    public List<Vendor> getAllActiveVendors() {
        return vendorRepository.findByStatus("ACTIVE");
    }
    
    public Vendor getVendorBySlug(String slug) {
        return vendorRepository.findBySlug(slug)
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
}
