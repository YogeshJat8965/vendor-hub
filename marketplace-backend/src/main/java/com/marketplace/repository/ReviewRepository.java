package com.marketplace.repository;

import com.marketplace.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByVendorSlug(String vendorSlug);
    List<Review> findByFlagged(boolean flagged);
    long countByVendorSlug(String vendorSlug);
    Optional<Review> findByQuoteRequestId(String quoteRequestId);

    List<Review> findByCustomerEmail(String customerEmail);
    List<Review> findByVendorSlugAndCreatedAtAfter(String vendorSlug, LocalDateTime after);

    // Admin panel: moderation queue counts and the review-volume time series.
    long countByFlagged(boolean flagged);
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    List<Review> findByCreatedAtAfter(LocalDateTime after);
    List<Review> findTop20ByOrderByCreatedAtDesc();
}
