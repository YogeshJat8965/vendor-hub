package com.marketplace.repository;

import com.marketplace.model.Subscription;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface SubscriptionRepository extends MongoRepository<Subscription, String> {
    Optional<Subscription> findByVendorSlug(String vendorSlug);
}
