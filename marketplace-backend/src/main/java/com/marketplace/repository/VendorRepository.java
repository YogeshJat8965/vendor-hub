package com.marketplace.repository;

import com.marketplace.model.vendor.Vendor;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.Instant;
import java.util.Optional;
import java.util.List;

public interface VendorRepository extends MongoRepository<Vendor, String> {
    Optional<Vendor> findBySlug(String slug);
    Optional<Vendor> findByEmail(String email);
    boolean existsBySlug(String slug);
    boolean existsByStoreName(String storeName);
    boolean existsByEmail(String email);
    List<Vendor> findByCity(String city);
    List<Vendor> findByVendorType(String vendorType);
    List<Vendor> findByStatus(String status);

    // Admin panel: status tiles, the approval queue and signup growth.
    long countByStatus(String status);
    long countByVendorType(String vendorType);
    long countByCreatedAtBetween(Instant start, Instant end);
    List<Vendor> findByCreatedAtAfter(Instant after);
    List<Vendor> findTop20ByOrderByCreatedAtDesc();
}
