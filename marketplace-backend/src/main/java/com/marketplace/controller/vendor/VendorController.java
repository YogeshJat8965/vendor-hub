package com.marketplace.controller.vendor;

import com.marketplace.model.vendor.Vendor;
import com.marketplace.service.VendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vendor")
@RequiredArgsConstructor
public class VendorController {
    
    private final VendorService vendorService;
    
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication auth, @RequestParam String slug) {
        try {
            Vendor vendor = vendorService.getVendorBySlug(slug);
            return ResponseEntity.ok(vendor);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestParam String slug, @RequestBody Vendor updates) {
        try {
            Vendor updated = vendorService.updateVendor(slug, updates);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
