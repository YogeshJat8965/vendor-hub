package com.marketplace.controller.vendor;

import com.marketplace.dto.DashboardMetrics;
import com.marketplace.dto.VendorStats;
import com.marketplace.model.vendor.Vendor;
import com.marketplace.repository.VendorRepository;
import com.marketplace.repository.QuoteRequestRepository;
import com.marketplace.repository.ReviewRepository;
import com.marketplace.repository.PageViewRepository;
import com.marketplace.model.QuoteRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/vendor/dashboard")
@RequiredArgsConstructor
public class VendorDashboardController {
    
    private final VendorRepository vendorRepository;
    private final QuoteRequestRepository quoteRepository;
    private final ReviewRepository reviewRepository;
    private final PageViewRepository pageViewRepository;
    
    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats(@RequestParam String email) {
        Vendor vendor = vendorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        
        VendorStats stats = new VendorStats();
        
        // Calculate views
        LocalDateTime now = LocalDateTime.now();
        stats.setTotalViews(pageViewRepository.findByVendorSlug(vendor.getSlug()).size());
        
        // Calculate quotes
        List<QuoteRequest> allQuotes = quoteRepository.findByVendorSlug(vendor.getSlug());
        stats.setQuoteRequests(allQuotes.size());
        
        long pending = allQuotes.stream()
                .filter(q -> "PENDING".equalsIgnoreCase(q.getStatus()))
                .count();
        stats.setPendingQuotes(pending);
        
        long accepted = allQuotes.stream()
                .filter(q -> "ACCEPTED".equalsIgnoreCase(q.getStatus()))
                .count();
        stats.setAcceptedQuotes(accepted);
        
        long completed = allQuotes.stream()
                .filter(q -> "COMPLETED".equalsIgnoreCase(q.getStatus()))
                .count();
        stats.setCompletedQuotes(completed);
        
        // Reviews
        stats.setTotalReviews(reviewRepository.countByVendorSlug(vendor.getSlug()));
        stats.setAverageRating(vendor.getRating() != null ? vendor.getRating() : 0.0);
        
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/overview")
    public ResponseEntity<?> getDashboardOverview(@RequestParam String slug) {
        Vendor vendor = vendorRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        
        DashboardMetrics metrics = new DashboardMetrics();
        metrics.setVendorName(vendor.getBusinessName() != null ? vendor.getBusinessName() : vendor.getStoreName());
        metrics.setSlug(vendor.getSlug());
        metrics.setSubscriptionPlan(vendor.getSubscriptionPlan());
        
        // Calculate views
        LocalDateTime now = LocalDateTime.now();
        metrics.setTotalViews(pageViewRepository.findByVendorSlug(slug).size());
        metrics.setRecentViews7d(pageViewRepository.countByVendorSlugAndViewedAtAfter(slug, now.minusDays(7)));
        metrics.setRecentViews30d(pageViewRepository.countByVendorSlugAndViewedAtAfter(slug, now.minusDays(30)));
        
        // Calculate leads
        List<QuoteRequest> allQuotes = quoteRepository.findByVendorSlug(slug);
        metrics.setTotalLeads((long) allQuotes.size());
        long recent = allQuotes.stream()
                .filter(q -> q.getCreatedAt().isAfter(now.minusDays(7)))
                .count();
        metrics.setRecentLeads7d(recent);
        
        // Reviews
        metrics.setTotalReviews(reviewRepository.countByVendorSlug(slug));
        metrics.setAverageRating(vendor.getRating() != null ? vendor.getRating() : 0.0);
        
        // Conversion rate
        if (metrics.getTotalViews() > 0) {
            double rate = (metrics.getTotalLeads() * 100.0) / metrics.getTotalViews();
            metrics.setConversionRate(Math.round(rate * 100.0) / 100.0);
        } else {
            metrics.setConversionRate(0.0);
        }
        
        return ResponseEntity.ok(metrics);
    }
}
