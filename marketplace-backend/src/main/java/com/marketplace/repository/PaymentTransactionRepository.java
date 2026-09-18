package com.marketplace.repository;

import com.marketplace.model.PaymentTransaction;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface PaymentTransactionRepository extends MongoRepository<PaymentTransaction, String> {
    Optional<PaymentTransaction> findByGatewayPaymentId(String gatewayPaymentId);
    List<PaymentTransaction> findByVendorId(String vendorId);
    List<PaymentTransaction> findByStatus(String status);
    List<PaymentTransaction> findByStatusAndCreatedAtBetween(String status, Instant start, Instant end);
    List<PaymentTransaction> findBySubscriptionId(String subscriptionId);
}
