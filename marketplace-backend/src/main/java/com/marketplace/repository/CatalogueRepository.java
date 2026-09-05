package com.marketplace.repository;

import com.marketplace.model.Catalogue;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CatalogueRepository extends MongoRepository<Catalogue, String> {
    List<Catalogue> findByVendorId(String vendorId);
    
    long countByVendorId(String vendorId);
}
