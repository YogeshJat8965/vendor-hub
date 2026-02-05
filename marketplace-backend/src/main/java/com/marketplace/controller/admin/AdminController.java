package com.marketplace.controller.admin;

import com.marketplace.repository.UserRepository;
import com.marketplace.repository.VendorRepository;
import com.marketplace.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final ReviewRepository reviewRepository;
    
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
    
    @GetMapping("/vendors")
    public ResponseEntity<?> getAllVendors() {
        return ResponseEntity.ok(vendorRepository.findAll());
    }
    
    @GetMapping("/reviews/flagged")
    public ResponseEntity<?> getFlaggedReviews() {
        return ResponseEntity.ok(reviewRepository.findByFlagged(true));
    }
    
    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable String reviewId) {
        reviewRepository.deleteById(reviewId);
        return ResponseEntity.ok(Map.of("message", "Review deleted"));
    }
}
