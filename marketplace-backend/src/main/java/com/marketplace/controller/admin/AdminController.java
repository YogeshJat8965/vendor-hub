package com.marketplace.controller.admin;

import com.marketplace.dto.FlaggedReviewDto;
import com.marketplace.model.Category;
import com.marketplace.model.QuoteRequest;
import com.marketplace.model.Review;
import com.marketplace.model.vendor.Vendor;
import com.marketplace.repository.CategoryRepository;
import com.marketplace.repository.UserRepository;
import com.marketplace.repository.VendorRepository;
import com.marketplace.repository.ReviewRepository;
import com.marketplace.service.NotificationService;
import com.marketplace.service.QuoteService;
import com.marketplace.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final ReviewRepository reviewRepository;
    private final ReviewService reviewService;
    private final CategoryRepository categoryRepository;
    private final NotificationService notificationService;
    private final QuoteService quoteService;
    
    @GetMapping("/dashboard")
    public ResponseEntity<?> getAdminDashboard() {
        long totalUsers = userRepository.count();
        long totalVendors = vendorRepository.count();
        long totalReviews = reviewRepository.count();
        
        return ResponseEntity.ok(Map.of(
            "totalUsers", totalUsers,
            "totalVendors", totalVendors,
            "totalReviews", totalReviews
        ));
    }
    
    @GetMapping("/analytics")
    public ResponseEntity<?> getAdminAnalytics(@RequestParam(defaultValue = "30d") String period) {
        long totalUsers = userRepository.count();
        long totalVendors = vendorRepository.count();
        long totalReviews = reviewRepository.count();
        
        return ResponseEntity.ok(Map.of(
            "totalUsers", totalUsers,
            "totalVendors", totalVendors,
            "totalReviews", totalReviews,
            "activeUsers", totalUsers,
            "newUsers", 0,
            "period", period
        ));
    }
    
    @GetMapping("/vendors")
    public ResponseEntity<?> getAllVendors() {
        return ResponseEntity.ok(vendorRepository.findAll());
    }
    
    @GetMapping("/reviews/flagged")
    public ResponseEntity<?> getFlaggedReviews() {
        List<FlaggedReviewDto> result = reviewRepository.findByFlagged(true).stream()
            .map(this::toFlaggedReviewDto)
            .toList();
        return ResponseEntity.ok(result);
    }

    private FlaggedReviewDto toFlaggedReviewDto(Review review) {
        FlaggedReviewDto dto = new FlaggedReviewDto();
        dto.setId(review.getId());
        dto.setVendorSlug(review.getVendorSlug());
        dto.setCustomerName(review.getCustomerName());
        dto.setCustomerEmail(review.getCustomerEmail());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setFlagReason(review.getFlagReason());
        dto.setFlagDetails(review.getFlagDetails());
        dto.setFlaggedAt(review.getFlaggedAt());
        dto.setCreatedAt(review.getCreatedAt());

        vendorRepository.findBySlug(review.getVendorSlug())
            .map(Vendor::getBusinessName)
            .ifPresent(dto::setVendorName);
        if (dto.getVendorName() == null) {
            dto.setVendorName(review.getVendorSlug());
        }

        return dto;
    }

    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable String reviewId) {
        try {
            // Fetched before deletion — the review (and the vendor/customer
            // to notify about the outcome) won't exist to look up afterwards.
            Review review = reviewRepository.findById(reviewId).orElse(null);
            reviewService.deleteReview(reviewId);
            notifyFlagResolved(review, "Review removed",
                    "Your flag was upheld — the review was removed.",
                    "A review you wrote was removed by an admin.");
            return ResponseEntity.ok(Map.of("message", "Review deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/reviews/{reviewId}/unflag")
    public ResponseEntity<?> unflagReview(@PathVariable String reviewId) {
        try {
            Review review = reviewRepository.findById(reviewId).orElse(null);
            reviewService.unflagReview(reviewId);
            notifyFlagResolved(review, "Flag dismissed",
                    "Your flag was reviewed and dismissed — the review is back on your profile.",
                    null);
            return ResponseEntity.ok(Map.of("message", "Review unflagged"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Notifies the vendor who flagged the review of the outcome, and — only
     * when the review was actually removed (customerMessage non-null) — the
     * customer who wrote it, if they have an account.
     */
    private void notifyFlagResolved(Review review, String title, String vendorMessage, String customerMessage) {
        if (review == null) {
            return;
        }
        vendorRepository.findBySlug(review.getVendorSlug()).ifPresent(vendor ->
                notificationService.notify(vendor.getId(), "REVIEW_FLAG", title, vendorMessage,
                        "/dashboard/vendor/reviews"));

        if (customerMessage != null) {
            userRepository.findByEmail(review.getCustomerEmail()).ifPresent(customer ->
                    notificationService.notify(customer.getId(), "REVIEW", "Review removed", customerMessage,
                            "/dashboard/customer/quotes"));
        }
    }
    
    @GetMapping("/quotes/disputed")
    public ResponseEntity<?> getDisputedQuotes() {
        return ResponseEntity.ok(quoteService.getDisputedQuotes());
    }

    @PutMapping("/quotes/{quoteId}/resolve-dispute")
    public ResponseEntity<?> resolveDispute(@PathVariable String quoteId, @RequestBody Map<String, String> payload) {
        try {
            QuoteRequest updated = quoteService.resolveDispute(quoteId, payload.get("resolution"));
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }
    
    @PutMapping("/users/{userId}/ban")
    public ResponseEntity<?> banUser(@PathVariable String userId) {
        return userRepository.findById(userId)
            .map(user -> {
                user.setBanned(true);
                userRepository.save(user);
                return ResponseEntity.ok(Map.of("message", "User banned"));
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/users/{userId}/unban")
    public ResponseEntity<?> unbanUser(@PathVariable String userId) {
        return userRepository.findById(userId)
            .map(user -> {
                user.setBanned(false);
                userRepository.save(user);
                return ResponseEntity.ok(Map.of("message", "User unbanned"));
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/vendors/{vendorId}/approve")
    public ResponseEntity<?> approveVendor(@PathVariable String vendorId) {
        return vendorRepository.findById(vendorId)
            .map(vendor -> {
                vendor.setStatus("ACTIVE");
                vendorRepository.save(vendor);
                notificationService.notify(vendor.getId(), "ACCOUNT", "Account approved",
                        "Your vendor account has been approved. You're live on VendorHub.", "/dashboard/vendor");
                return ResponseEntity.ok(Map.of("message", "Vendor approved"));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/vendors/{vendorId}/reject")
    public ResponseEntity<?> rejectVendor(@PathVariable String vendorId, @RequestBody Map<String, String> payload) {
        return vendorRepository.findById(vendorId)
            .map(vendor -> {
                vendor.setStatus("REJECTED");
                vendorRepository.save(vendor);
                notificationService.notify(vendor.getId(), "ACCOUNT", "Account rejected",
                        "Your vendor account application was rejected.", "/dashboard/vendor");
                return ResponseEntity.ok(Map.of("message", "Vendor rejected"));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/vendors/{vendorId}/suspend")
    public ResponseEntity<?> suspendVendor(@PathVariable String vendorId) {
        return vendorRepository.findById(vendorId)
            .map(vendor -> {
                vendor.setStatus("SUSPENDED");
                vendorRepository.save(vendor);
                notificationService.notify(vendor.getId(), "ACCOUNT", "Account suspended",
                        "Your vendor account has been suspended. Contact support for details.", "/dashboard/vendor");
                return ResponseEntity.ok(Map.of("message", "Vendor suspended"));
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/pending-actions")
    public ResponseEntity<?> getPendingActions() {
        long pendingVendors = vendorRepository.findAll().stream()
            .filter(v -> "PENDING".equals(v.getStatus()))
            .count();
        long flaggedReviews = reviewRepository.findByFlagged(true).size();
        
        return ResponseEntity.ok(Map.of(
            "pendingVendors", pendingVendors,
            "flaggedReviews", flaggedReviews,
            "reportedContent", 0
        ));
    }
    
    @GetMapping("/recent-activity")
    public ResponseEntity<?> getRecentActivity(@RequestParam(defaultValue = "10") int limit) {
        // Return empty list for now - can be enhanced later
        return ResponseEntity.ok(java.util.Collections.emptyList());
    }
    
    @GetMapping("/categories")
    public ResponseEntity<?> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }
    
    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(@RequestBody Category category) {
        Category saved = categoryRepository.save(category);
        return ResponseEntity.ok(Map.of("message", "Category created", "category", saved));
    }
    
    @PutMapping("/categories/{categoryId}")
    public ResponseEntity<?> updateCategory(@PathVariable String categoryId, @RequestBody Category updates) {
        return categoryRepository.findById(categoryId)
            .map(category -> {
                if (updates.getName() != null) category.setName(updates.getName());
                if (updates.getSlug() != null) category.setSlug(updates.getSlug());
                if (updates.getDescription() != null) category.setDescription(updates.getDescription());
                if (updates.getIcon() != null) category.setIcon(updates.getIcon());
                categoryRepository.save(category);
                return ResponseEntity.ok(Map.of("message", "Category updated", "category", category));
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/categories/{categoryId}")
    public ResponseEntity<?> deleteCategory(@PathVariable String categoryId) {
        categoryRepository.deleteById(categoryId);
        return ResponseEntity.ok(Map.of("message", "Category deleted"));
    }
}
