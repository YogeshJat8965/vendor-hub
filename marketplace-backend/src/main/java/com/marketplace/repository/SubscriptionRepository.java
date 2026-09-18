package com.marketplace.repository;

import com.marketplace.model.Subscription;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface SubscriptionRepository extends MongoRepository<Subscription, String> {

    List<Subscription> findByVendorId(String vendorId);

    Optional<Subscription> findFirstByVendorIdAndStatusOrderByCurrentPeriodEndDesc(String vendorId, String status);

    List<Subscription> findByStatus(String status);

    List<Subscription> findByPlanCode(String planCode);

    long countByPlanCodeAndStatus(String planCode, String status);

    /** Subscriptions the expiry scheduler needs to close out. */
    List<Subscription> findByStatusAndCurrentPeriodEndBefore(String status, Instant cutoff);
}
