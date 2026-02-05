package com.marketplace.repository;

import com.marketplace.model.Collaboration;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface CollaborationRepository extends MongoRepository<Collaboration, String> {
    List<Collaboration> findByStatus(String status);
    List<Collaboration> findByPostedByVendorSlug(String vendorSlug);
}
