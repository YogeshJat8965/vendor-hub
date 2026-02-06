package com.marketplace.controller;

import com.marketplace.model.Review;
import com.marketplace.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    
    private final ReviewService reviewService;
    
    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody Review review) {
        try {
            Review created = reviewService.createReview(review);
            return ResponseEntity.ok(Map.of("review", created, "message", "Review submitted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/{vendorSlug}")
    public ResponseEntity<?> getVendorReviews(@PathVariable String vendorSlug) {
        return ResponseEntity.ok(reviewService.getVendorReviews(vendorSlug));
    }
    
    @GetMapping("/vendor")
    public ResponseEntity<?> getVendorReviewsByEmail(@RequestParam String email) {
        return ResponseEntity.ok(reviewService.getVendorReviewsByEmail(email));
    }
    
    @PutMapping("/{reviewId}/flag")
    public ResponseEntity<?> flagReview(
            @PathVariable String reviewId,
            @RequestBody Map<String, String> payload) {
        try {
            String reason = payload.get("reason");
            Review flagged = reviewService.flagReview(reviewId, reason);
            return ResponseEntity.ok(flagged);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
