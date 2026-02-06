package com.marketplace.repository;

import com.marketplace.model.CustomerProfile;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface CustomerProfileRepository extends MongoRepository<CustomerProfile, String> {
    Optional<CustomerProfile> findByEmail(String email);
    Optional<CustomerProfile> findByUserId(String userId);
}
