package com.marketplace.controller;

import com.marketplace.dto.ReviewCreateDto;
import com.marketplace.dto.ReviewFlagDto;
import com.marketplace.model.Review;
import com.marketplace.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    /**
     * Whether the logged-in customer can review this vendor right now
     * (drives the "Write a Review" button's state on the frontend).
     */
    @GetMapping("/eligibility")
    public ResponseEntity<?> checkEligibility(
            @RequestParam String vendorSlug,
            @RequestParam(required = false) String quoteId,
            Authentication authentication) {
        try {
            // authentication.getName() is the JWT subject, i.e. the user's
            // Mongo id — resolved to an email inside the service, same as createReview.
            return ResponseEntity.ok(reviewService.checkEligibility(authentication.getName(), vendorSlug, quoteId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createReview(@Valid @RequestBody ReviewCreateDto dto, Authentication authentication) {
        try {
            // authentication.getName() is the JWT subject, i.e. the user's
            // Mongo id — never the client-supplied email/name from the body.
            Review created = reviewService.createReview(authentication.getName(), dto);
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
            @Valid @RequestBody ReviewFlagDto dto,
            Authentication authentication) {
        try {
            Review flagged = reviewService.flagReview(authentication.getName(), reviewId, dto.getReason(), dto.getDetails());
            return ResponseEntity.ok(flagged);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
