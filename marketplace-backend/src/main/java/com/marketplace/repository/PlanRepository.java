package com.marketplace.repository;

import com.marketplace.model.Plan;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface PlanRepository extends MongoRepository<Plan, String> {
    Optional<Plan> findByCode(String code);
    boolean existsByCode(String code);
    List<Plan> findByPurchasableTrue();
    Optional<Plan> findByIsDefaultTrue();
}
