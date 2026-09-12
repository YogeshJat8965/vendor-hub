package com.marketplace.service;

import com.marketplace.dto.ReviewCreateDto;
import com.marketplace.model.QuoteRequest;
import com.marketplace.model.Review;
import com.marketplace.model.User;
import com.marketplace.model.vendor.Vendor;
import com.marketplace.repository.QuoteRequestRepository;
import com.marketplace.repository.ReviewRepository;
import com.marketplace.repository.UserRepository;
import com.marketplace.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final VendorRepository vendorRepository;
    private final QuoteRequestRepository quoteRequestRepository;
    private final UserRepository userRepository;

    /**
     * Can this customer review this vendor right now? Used by the frontend
     * to decide whether to show the review form, an "already reviewed"
     * state, or a "not eligible yet" explanation.
     */
    public Map<String, Object> checkEligibility(String customerUserId, String vendorSlug) {
        // authentication.getName() is the JWT subject — the user's Mongo id,
        // not their email — so it must be resolved the same way createReview
        // resolves it, rather than used directly as an email to match against.
        User customer = userRepository.findById(customerUserId).orElse(null);
        if (customer == null) {
            Map<String, Object> result = new HashMap<>();
            result.put("eligible", false);
            result.put("alreadyReviewed", false);
            result.put("reason", "NOT_A_CUSTOMER");
            return result;
        }
        String customerEmail = customer.getEmail();

        boolean alreadyReviewed = reviewRepository.findByVendorSlugAndCustomerEmail(vendorSlug, customerEmail).isPresent();
        boolean hasAcceptedQuote = findLatestAcceptedQuote(vendorSlug, customerEmail).isPresent();

        String reason = null;
        if (alreadyReviewed) {
            reason = "ALREADY_REVIEWED";
        } else if (!hasAcceptedQuote) {
            reason = "NO_ACCEPTED_QUOTE";
        }

        Map<String, Object> result = new HashMap<>();
        result.put("eligible", !alreadyReviewed && hasAcceptedQuote);
        result.put("alreadyReviewed", alreadyReviewed);
        result.put("reason", reason);
        return result;
    }

    private Optional<QuoteRequest> findLatestAcceptedQuote(String vendorSlug, String customerEmail) {
        return quoteRequestRepository.findByVendorSlugAndCustomerEmail(vendorSlug, customerEmail)
                .stream()
                .filter(q -> "ACCEPTED".equalsIgnoreCase(q.getStatus()))
                .max(Comparator.comparing(QuoteRequest::getUpdatedAt, Comparator.nullsFirst(Comparator.naturalOrder())));
    }

    /**
     * Creates a review on behalf of the authenticated customer. Identity
     * (name/email) is resolved server-side from the JWT subject — never
     * trusted from the request body — so a review can't be posted under
     * someone else's name.
     */
    public Review createReview(String customerUserId, ReviewCreateDto dto) {
        User customer = userRepository.findById(customerUserId)
                .orElseThrow(() -> new RuntimeException("Only customer accounts can submit reviews"));

        Vendor vendor = vendorRepository.findBySlug(dto.getVendorSlug())
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        if (reviewRepository.findByVendorSlugAndCustomerEmail(vendor.getSlug(), customer.getEmail()).isPresent()) {
            throw new RuntimeException("You have already reviewed this vendor");
        }

        QuoteRequest acceptedQuote = findLatestAcceptedQuote(vendor.getSlug(), customer.getEmail())
                .orElseThrow(() -> new RuntimeException(
                        "You can review a vendor only after they have accepted your quote request"));

        Review review = new Review();
        review.setVendorSlug(vendor.getSlug());
        review.setCustomerEmail(customer.getEmail());
        review.setCustomerName(customer.getName());
        review.setQuoteRequestId(acceptedQuote.getId());
        review.setRating(dto.getRating());
        review.setComment(dto.getComment());
        review.setImages(dto.getImages());
        review.setVerifiedPurchase(true);
        review.setFlagged(false);
        review.setCreatedAt(LocalDateTime.now());

        Review saved = reviewRepository.save(review);
        recomputeVendorRating(vendor.getSlug());
        return saved;
    }

    public List<Review> getVendorReviews(String vendorSlug) {
        return reviewRepository.findByVendorSlug(vendorSlug);
    }

    public List<Review> getVendorReviewsByEmail(String email) {
        Vendor vendor = vendorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        return reviewRepository.findByVendorSlug(vendor.getSlug());
    }

    /**
     * Flags a review — restricted to the vendor the review is actually
     * about, verified against the authenticated vendor account rather than
     * any client-supplied id. Excludes the review from the vendor's public
     * rating average immediately (it stays visible, tagged "under review",
     * per the agreed flow — this just stops it from dragging the score down
     * while admin investigates).
     */
    public Review flagReview(String vendorUserId, String reviewId, String reasonCategory, String details) {
        Vendor vendor = vendorRepository.findById(vendorUserId)
                .orElseThrow(() -> new RuntimeException("Only vendor accounts can flag reviews"));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!review.getVendorSlug().equals(vendor.getSlug())) {
            throw new RuntimeException("You can only flag reviews left on your own profile");
        }
        if (review.isFlagged()) {
            throw new RuntimeException("This review is already awaiting admin review");
        }

        review.setFlagged(true);
        review.setFlagReason(reasonCategory);
        review.setFlagDetails(details);
        review.setFlaggedAt(LocalDateTime.now());
        Review saved = reviewRepository.save(review);

        recomputeVendorRating(vendor.getSlug());
        return saved;
    }

    /** Admin dismisses a flag: the review is restored to the public average. */
    public Review unflagReview(String reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        review.setFlagged(false);
        review.setFlagReason(null);
        review.setFlagDetails(null);
        review.setFlaggedAt(null);
        Review saved = reviewRepository.save(review);

        recomputeVendorRating(review.getVendorSlug());
        return saved;
    }

    /** Admin upholds a flag: the review is permanently removed. */
    public void deleteReview(String reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        String vendorSlug = review.getVendorSlug();
        reviewRepository.deleteById(reviewId);
        recomputeVendorRating(vendorSlug);
    }

    /**
     * Recomputes the vendor's public rating/review count from non-flagged
     * reviews only, so a flagged review can't affect the score while it's
     * under dispute.
     */
    private void recomputeVendorRating(String vendorSlug) {
        List<Review> activeReviews = reviewRepository.findByVendorSlug(vendorSlug)
                .stream()
                .filter(r -> !r.isFlagged())
                .toList();

        Vendor vendor = vendorRepository.findBySlug(vendorSlug).orElse(null);
        if (vendor == null) {
            return;
        }

        if (activeReviews.isEmpty()) {
            vendor.setRating(0.0);
            vendor.setReviewCount(0);
        } else {
            double avgRating = activeReviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
            vendor.setRating(Math.round(avgRating * 10.0) / 10.0);
            vendor.setReviewCount(activeReviews.size());
        }
        vendorRepository.save(vendor);
    }
}
