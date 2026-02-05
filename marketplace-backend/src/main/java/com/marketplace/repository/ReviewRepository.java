package com.marketplace.repository;

import com.marketplace.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByVendorSlug(String vendorSlug);
    List<Review> findByFlagged(boolean flagged);
    long countByVendorSlug(String vendorSlug);
}
