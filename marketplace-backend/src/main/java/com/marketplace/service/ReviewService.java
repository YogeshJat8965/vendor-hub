package com.marketplace.service;

import com.marketplace.model.Review;
import com.marketplace.model.vendor.Vendor;
import com.marketplace.repository.ReviewRepository;
import com.marketplace.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {
    
    private final ReviewRepository reviewRepository;
    private final VendorRepository vendorRepository;
    
    public Review createReview(Review review) {
        review.setCreatedAt(LocalDateTime.now());
        Review saved = reviewRepository.save(review);
        
        // Update vendor rating
        updateVendorRating(review.getVendorSlug());
        
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
    
    public Review flagReview(String reviewId, String reason) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setFlagged(true);
        review.setFlagReason(reason);
        return reviewRepository.save(review);
    }
    
    private void updateVendorRating(String vendorSlug) {
        List<Review> reviews = reviewRepository.findByVendorSlug(vendorSlug);
        if (reviews.isEmpty()) return;
        
        double avgRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
        
        Vendor vendor = vendorRepository.findBySlug(vendorSlug).orElse(null);
        if (vendor != null) {
            vendor.setRating(Math.round(avgRating * 10.0) / 10.0);
            vendor.setReviewCount(reviews.size());
            vendorRepository.save(vendor);
        }
    }
}
