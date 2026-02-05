package com.marketplace.controller;

import com.marketplace.model.vendor.Vendor;
import com.marketplace.service.VendorService;
import com.marketplace.util.SlugGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/explore")
@RequiredArgsConstructor
public class ExploreController {
    
    private final VendorService vendorService;
    
    @GetMapping
    public ResponseEntity<?> getAllVendors() {
        return ResponseEntity.ok(vendorService.getAllActiveVendors());
    }
    
    @GetMapping("/{slug}/profile")
    public ResponseEntity<?> getVendorProfile(@PathVariable String slug) {
        try {
            Vendor vendor = vendorService.getVendorBySlug(slug);
            return ResponseEntity.ok(vendor);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/check-slug")
    public ResponseEntity<?> checkSlugAvailability(@RequestParam String storeName) {
        String slug = SlugGenerator.generateSlug(storeName);
        boolean available = vendorService.checkSlugAvailability(storeName);
        return ResponseEntity.ok(Map.of("slug", slug, "available", available));
    }
    
    @GetMapping("/search")
    public ResponseEntity<?> searchVendors(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String vendorType) {
        
        if (city != null) {
            return ResponseEntity.ok(vendorService.getVendorsByCity(city));
        }
        if (vendorType != null) {
            return ResponseEntity.ok(vendorService.getVendorsByType(vendorType));
        }
        return ResponseEntity.ok(vendorService.getAllActiveVendors());
    }
}
