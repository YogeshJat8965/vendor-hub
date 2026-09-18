package com.marketplace.repository;

import com.marketplace.model.Favorite;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends MongoRepository<Favorite, String> {
    List<Favorite> findByCustomerIdOrderByCreatedAtDesc(String customerId);
    Optional<Favorite> findByCustomerIdAndVendorId(String customerId, String vendorId);
    List<Favorite> findByVendorIdOrderByCreatedAtDesc(String vendorId);
    long countByVendorId(String vendorId);
    void deleteByCustomerIdAndVendorId(String customerId, String vendorId);
}
