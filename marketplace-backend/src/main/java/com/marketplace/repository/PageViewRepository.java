package com.marketplace.repository;

import com.marketplace.model.PageView;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface PageViewRepository extends MongoRepository<PageView, String> {
    List<PageView> findByVendorSlug(String vendorSlug);
    long countByVendorSlugAndViewedAtAfter(String vendorSlug, LocalDateTime after);
}
