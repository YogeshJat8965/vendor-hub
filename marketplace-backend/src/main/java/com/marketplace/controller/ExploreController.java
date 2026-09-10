package com.marketplace.controller;

import com.marketplace.model.QuoteRequest;
import com.marketplace.model.vendor.Vendor;
import com.marketplace.repository.QuoteRequestRepository;
import com.marketplace.service.VendorService;
import com.marketplace.util.SlugGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/explore")
@RequiredArgsConstructor
public class ExploreController {

    private final VendorService vendorService;
    private final QuoteRequestRepository quoteRequestRepository;

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
    
    @GetMapping("/id/{id}/profile")
    public ResponseEntity<?> getVendorProfileById(@PathVariable String id) {
        try {
            Vendor vendor = vendorService.getVendorById(id);
            return ResponseEntity.ok(vendor);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Public quote-activity summary for a vendor's storefront (counts only —
     * no customer names, contact details, or project descriptions).
     */
    @GetMapping("/{slug}/stats")
    public ResponseEntity<?> getVendorPublicStats(@PathVariable String slug) {
        try {
            // Confirms the vendor exists so an unknown slug returns 404, not zeros.
            vendorService.getVendorBySlug(slug);

            List<QuoteRequest> quotes = quoteRequestRepository.findByVendorSlug(slug);

            long pending = quotes.stream().filter(q -> "NEW".equalsIgnoreCase(q.getStatus())).count();
            long active = quotes.stream().filter(q -> "QUOTED".equalsIgnoreCase(q.getStatus())).count();
            long completed = quotes.stream().filter(q -> "ACCEPTED".equalsIgnoreCase(q.getStatus())).count();

            return ResponseEntity.ok(Map.of(
                "pendingQuotes", pending,
                "activeQuotes", active,
                "completedQuotes", completed,
                "totalQuotes", quotes.size()
            ));
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
