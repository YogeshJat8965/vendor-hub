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
    private final NotificationService notificationService;

    /**
     * Can this customer review this vendor right now? Used by the frontend
     * to decide whether to show the review form, an "already reviewed"
     * state, or a "not eligible yet" explanation.
     *
     * Eligibility is per COMPLETED ENGAGEMENT (quote), not per vendor: a
     * customer who has already reviewed one completed job with a vendor can
     * still review a *different* completed job with that same vendor later
     * — only re-reviewing the *same* delivered quote is blocked.
     *
     * @param quoteId the specific engagement to check, when known (the
     *                customer's own Quotes page always knows this). Null
     *                when checking generically from the vendor's public
     *                profile, in which case the latest completed-but-not-yet
     *                -reviewed quote with this vendor is used, if any.
     */
    public Map<String, Object> checkEligibility(String customerUserId, String vendorSlug, String quoteId) {
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

        Optional<QuoteRequest> targetOpt = resolveTargetQuote(vendorSlug, customerEmail, quoteId);

        Map<String, Object> result = new HashMap<>();
        if (targetOpt.isEmpty()) {
            // Generic (no quoteId) case: distinguish "nothing completed yet"
            // from "every completed job with this vendor is already
            // reviewed" — both end up with no reviewable candidate, but the
            // frontend shows a different message for each.
            boolean allCompletedAlreadyReviewed = quoteId == null
                    && quoteRequestRepository.findByVendorSlugAndCustomerEmail(vendorSlug, customerEmail).stream()
                            .anyMatch(q -> "COMPLETED".equalsIgnoreCase(q.getStatus()));
            result.put("eligible", false);
            result.put("alreadyReviewed", allCompletedAlreadyReviewed);
            result.put("reason", allCompletedAlreadyReviewed ? "ALREADY_REVIEWED" : "NO_COMPLETED_QUOTE");
            return result;
        }

        QuoteRequest target = targetOpt.get();
        boolean completed = "COMPLETED".equalsIgnoreCase(target.getStatus());
        boolean alreadyReviewed = reviewRepository.findByQuoteRequestId(target.getId()).isPresent();

        String reason = null;
        if (alreadyReviewed) {
            reason = "ALREADY_REVIEWED";
        } else if (!completed) {
            reason = "NO_COMPLETED_QUOTE";
        }

        result.put("eligible", completed && !alreadyReviewed);
        result.put("alreadyReviewed", alreadyReviewed);
        result.put("reason", reason);
        return result;
    }

    /**
     * Resolves which quote a review is "about". With an explicit quoteId
     * (the customer's own Quotes page always supplies one), that exact
     * quote is looked up and ownership-checked — its completion/review
     * status is left for the caller to interpret. Without one (the generic
     * "Write a Review" button on a vendor's public profile), the latest
     * completed-and-not-yet-reviewed quote with this vendor is picked
     * automatically.
     */
    private Optional<QuoteRequest> resolveTargetQuote(String vendorSlug, String customerEmail, String quoteId) {
        if (quoteId != null && !quoteId.isBlank()) {
            return quoteRequestRepository.findById(quoteId)
                    .filter(q -> q.getCustomerEmail().equalsIgnoreCase(customerEmail))
                    .filter(q -> q.getVendorSlug().equals(vendorSlug));
        }
        return quoteRequestRepository.findByVendorSlugAndCustomerEmail(vendorSlug, customerEmail)
                .stream()
                .filter(q -> "COMPLETED".equalsIgnoreCase(q.getStatus()))
                .filter(q -> reviewRepository.findByQuoteRequestId(q.getId()).isEmpty())
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

        QuoteRequest targetQuote = resolveTargetQuote(vendor.getSlug(), customer.getEmail(), dto.getQuoteId())
                .orElseThrow(() -> new RuntimeException(
                        "You can review a vendor only after your project with them is completed"));

        if (!"COMPLETED".equalsIgnoreCase(targetQuote.getStatus())) {
            throw new RuntimeException("You can review a vendor only after your project with them is completed");
        }
        if (reviewRepository.findByQuoteRequestId(targetQuote.getId()).isPresent()) {
            throw new RuntimeException("You have already reviewed this project");
        }

        Review review = new Review();
        review.setVendorSlug(vendor.getSlug());
        review.setCustomerEmail(customer.getEmail());
        review.setCustomerName(customer.getName());
        review.setQuoteRequestId(targetQuote.getId());
        review.setRating(dto.getRating());
        review.setComment(dto.getComment());
        review.setImages(dto.getImages());
        review.setVerifiedPurchase(true);
        review.setFlagged(false);
        review.setCreatedAt(LocalDateTime.now());

        Review saved = reviewRepository.save(review);
        recomputeVendorRating(vendor.getSlug());

        notificationService.notify(vendor.getId(), "REVIEW", "New review",
                customer.getName() + " left a " + dto.getRating() + "-star review",
                "/dashboard/vendor/reviews");

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

        notificationService.notifyAdmins("REVIEW_FLAG", "Review flagged",
                vendor.getStoreName() + " flagged a review for " + reasonCategory,
                "/dashboard/admin/reviews");

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
