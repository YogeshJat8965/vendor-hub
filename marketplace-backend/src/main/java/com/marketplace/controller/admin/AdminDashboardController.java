package com.marketplace.controller.admin;

import com.marketplace.repository.QuoteRequestRepository;
import com.marketplace.repository.ReviewRepository;
import com.marketplace.repository.VendorRepository;
import com.marketplace.service.AdminStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** Platform overview: headline stats, the action queue and the activity feed. */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminStatsService adminStatsService;
    private final VendorRepository vendorRepository;
    private final ReviewRepository reviewRepository;
    private final QuoteRequestRepository quoteRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getAdminDashboard(@RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(adminStatsService.getOverview(clampDays(days)));
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> getAdminAnalytics(@RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(adminStatsService.getTimeSeries(clampDays(days)));
    }

    @GetMapping("/recent-activity")
    public ResponseEntity<?> getRecentActivity(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(adminStatsService.getActivityFeed(Math.min(limit, 50)));
    }

    /**
     * One entry per actionable item — a vendor awaiting approval, a flagged
     * review, or a disputed delivery. The dashboard renders these directly and
     * the sidebar counts them by type, so this has to be a list of individual
     * actions rather than a set of totals.
     */
    @GetMapping("/pending-actions")
    public ResponseEntity<?> getPendingActions() {
        List<Map<String, Object>> actions = new ArrayList<>();

        vendorRepository.findAll().stream()
                .filter(v -> "PENDING".equals(v.getStatus()))
                .forEach(vendor -> {
                    Map<String, Object> action = new HashMap<>();
                    action.put("id", "vendor-" + vendor.getId());
                    action.put("type", "vendor_approval");
                    action.put("title", "Vendor approval pending");
                    action.put("description", AdminStatsService.displayName(vendor) + " is waiting to be approved");
                    action.put("time", vendor.getCreatedAt() != null ? vendor.getCreatedAt().toString() : null);
                    action.put("priority", "medium");
                    action.put("vendorId", vendor.getId());
                    action.put("link", "/dashboard/admin/vendors");
                    actions.add(action);
                });

        reviewRepository.findByFlagged(true).forEach(review -> {
            Map<String, Object> action = new HashMap<>();
            action.put("id", "review-" + review.getId());
            action.put("type", "flagged_review");
            action.put("title", "Review flagged");
            action.put("description", "A review on " + review.getVendorSlug() + "'s profile was flagged"
                    + (review.getFlagReason() != null ? " for " + review.getFlagReason().toLowerCase() : ""));
            action.put("time", review.getFlaggedAt() != null ? review.getFlaggedAt().toString() : null);
            action.put("priority", "high");
            action.put("reviewId", review.getId());
            action.put("link", "/dashboard/admin/reviews");
            actions.add(action);
        });

        // Disputes block the 7-day auto-complete, so an unresolved one stalls
        // the customer's order indefinitely until an admin acts on it.
        quoteRepository.findByStatus("DISPUTED").forEach(quote -> {
            Map<String, Object> action = new HashMap<>();
            action.put("id", "dispute-" + quote.getId());
            action.put("type", "dispute");
            action.put("title", "Delivery disputed");
            action.put("description", (quote.getCustomerName() != null ? quote.getCustomerName() : quote.getCustomerEmail())
                    + " reported an issue with \"" + quote.getServiceRequested() + "\"");
            action.put("time", quote.getDisputedAt() != null ? quote.getDisputedAt().toString() : null);
            action.put("priority", "high");
            action.put("quoteId", quote.getId());
            action.put("link", "/dashboard/admin/disputes");
            actions.add(action);
        });

        return ResponseEntity.ok(actions);
    }

    /** Keeps the comparison window sane: at least a day, at most two years. */
    private int clampDays(int days) {
        return Math.max(1, Math.min(days, 730));
    }
}
