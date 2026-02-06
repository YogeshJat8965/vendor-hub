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
    public ResponseEntity<?> getProfile(@RequestParam String email) {
        try {
            Vendor vendor = vendorService.getVendorByEmail(email);
            return ResponseEntity.ok(vendor);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Vendor updates) {
        try {
            // Extract email from the updates body (frontend sends email in body)
            String email = updates.getEmail();
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body("Email is required");
            }
            Vendor updated = vendorService.updateVendorByEmail(email, updates);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/analytics")
    public ResponseEntity<?> getVendorAnalytics(
            @RequestParam String email,
            @RequestParam(defaultValue = "30d") String period) {
        try {
            // Return basic analytics for now
            return ResponseEntity.ok(java.util.Map.of(
                "totalViews", 0,
                "totalQuotes", 0,
                "acceptedQuotes", 0,
                "averageRating", 0.0,
                "period", period
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
