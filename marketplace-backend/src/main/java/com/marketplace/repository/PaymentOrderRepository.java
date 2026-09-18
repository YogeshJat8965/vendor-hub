package com.marketplace.repository;

import com.marketplace.model.PaymentOrder;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentOrderRepository extends MongoRepository<PaymentOrder, String> {
    Optional<PaymentOrder> findByGatewayOrderId(String gatewayOrderId);
    List<PaymentOrder> findByVendorId(String vendorId);
}
