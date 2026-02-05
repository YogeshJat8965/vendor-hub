package com.marketplace.repository;

import com.marketplace.model.QuoteRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface QuoteRequestRepository extends MongoRepository<QuoteRequest, String> {
    List<QuoteRequest> findByVendorSlug(String vendorSlug);
    List<QuoteRequest> findByCustomerEmail(String customerEmail);
    List<QuoteRequest> findByStatus(String status);
}
