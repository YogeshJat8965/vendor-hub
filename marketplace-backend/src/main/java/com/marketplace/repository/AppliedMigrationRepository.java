package com.marketplace.repository;

import com.marketplace.model.AppliedMigration;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AppliedMigrationRepository extends MongoRepository<AppliedMigration, String> {
}
