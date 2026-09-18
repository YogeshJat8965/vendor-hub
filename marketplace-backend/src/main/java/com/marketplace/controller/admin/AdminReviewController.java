package com.marketplace.controller.admin;

import com.marketplace.dto.admin.AdminReviewDto;
import com.marketplace.model.QuoteRequest;
import com.marketplace.model.Review;
import com.marketplace.model.vendor.Vendor;
import com.marketplace.repository.QuoteRequestRepository;
import com.marketplace.repository.ReviewRepository;
import com.marketplace.repository.UserRepository;
import com.marketplace.repository.VendorRepository;
import com.marketplace.service.NotificationService;
import com.marketplace.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

/** Review moderation: every review on the platform, not only flagged ones. */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminReviewController {

    private final ReviewRepository reviewRepository;
    private final ReviewService reviewService;
    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;
    private final QuoteRequestRepository quoteRequestRepository;
    private final NotificationService notificationService;

    /**
     * Every review on the platform, newest first. The moderation page filters
     * by flag / rating / vendor / date client-side over this list — at the
     * platform's current review volume that is simpler and just as correct as
     * a server-side query, and it's the same approach already used for the
     * Users and Vendors directories.
     */
    @GetMapping("/reviews")
    public ResponseEntity<?> getAllReviews() {
        List<AdminReviewDto> result = reviewRepository.findAll().stream()
                .sorted(Comparator.comparing(Review::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toAdminReviewDto)
                .toList();
        return ResponseEntity.ok(result);
    }

    /** Kept for the moderation queue's "Flagged" tab and the dashboard badge count. */
    @GetMapping("/reviews/flagged")
    public ResponseEntity<?> getFlaggedReviews() {
        List<AdminReviewDto> result = reviewRepository.findByFlagged(true).stream()
                .sorted(Comparator.comparing(Review::getFlaggedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toAdminReviewDto)
                .toList();
        return ResponseEntity.ok(result);
    }

    /**
     * Removes a review outright. Works whether or not it was flagged — an
     * admin can act on any review from the "All" tab, not only ones a vendor
     * happened to flag first.
     */
    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable String reviewId,
                                          @RequestBody(required = false) Map<String, String> payload) {
        String reason = payload != null ? payload.get("reason") : null;
        try {
            // Fetched before deletion — the review (and the vendor/customer
            // to notify about the outcome) won't exist to look up afterwards.
            Review review = reviewRepository.findById(reviewId).orElse(null);
            boolean wasFlaggedByVendor = review != null && review.isFlagged();
            reviewService.deleteReview(reviewId);
            notifyRemoval(review, wasFlaggedByVendor, reason);
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
            notifyFlagDismissed(review);
            return ResponseEntity.ok(Map.of("message", "Review unflagged"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private AdminReviewDto toAdminReviewDto(Review review) {
        AdminReviewDto dto = new AdminReviewDto();
        dto.setId(review.getId());
        dto.setVendorSlug(review.getVendorSlug());
        dto.setCustomerName(review.getCustomerName());
        dto.setCustomerEmail(review.getCustomerEmail());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setImages(review.getImages());
        dto.setVerifiedPurchase(review.isVerifiedPurchase());
        dto.setFlagged(review.isFlagged());
        dto.setFlagReason(review.getFlagReason());
        dto.setFlagDetails(review.getFlagDetails());
        dto.setFlaggedAt(review.getFlaggedAt());
        dto.setCreatedAt(review.getCreatedAt());
        dto.setQuoteRequestId(review.getQuoteRequestId());

        vendorRepository.findBySlug(review.getVendorSlug())
                .map(Vendor::getBusinessName)
                .ifPresent(dto::setVendorName);
        if (dto.getVendorName() == null) {
            dto.setVendorName(review.getVendorSlug());
        }

        if (review.getQuoteRequestId() != null) {
            quoteRequestRepository.findById(review.getQuoteRequestId()).ifPresent(quote -> {
                AdminReviewDto.LinkedQuote linked = new AdminReviewDto.LinkedQuote();
                linked.setId(quote.getId());
                linked.setService(quote.getServiceRequested());
                linked.setStatus(quote.getStatus());
                dto.setLinkedQuote(linked);
            });
        }

        return dto;
    }

    /**
     * Notifies the vendor and, if the review was actually removed, the
     * customer who wrote it. The vendor's message differs depending on
     * whether this closes out their own flag or is an admin-initiated
     * removal they never asked for.
     */
    private void notifyRemoval(Review review, boolean wasFlaggedByVendor, String reason) {
        if (review == null) {
            return;
        }
        String vendorMessage = wasFlaggedByVendor
                ? "Your flag was upheld — the review was removed."
                : withReason("A review on your profile was removed by an admin.", reason);
        vendorRepository.findBySlug(review.getVendorSlug()).ifPresent(vendor ->
                notificationService.notify(vendor.getId(), "REVIEW_FLAG", "Review removed", vendorMessage,
                        "/dashboard/vendor/reviews"));

        userRepository.findByEmail(review.getCustomerEmail()).ifPresent(customer ->
                notificationService.notify(customer.getId(), "REVIEW", "Review removed",
                        withReason("A review you wrote was removed by an admin.", reason),
                        "/dashboard/customer/quotes"));
    }

    private void notifyFlagDismissed(Review review) {
        if (review == null) {
            return;
        }
        vendorRepository.findBySlug(review.getVendorSlug()).ifPresent(vendor ->
                notificationService.notify(vendor.getId(), "REVIEW_FLAG", "Flag dismissed",
                        "Your flag was reviewed and dismissed — the review is back on your profile.",
                        "/dashboard/vendor/reviews"));
    }

    private String withReason(String base, String reason) {
        return (reason == null || reason.isBlank()) ? base : base + " Reason: " + reason;
    }
}
