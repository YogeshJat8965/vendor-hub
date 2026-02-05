package com.marketplace.repository;

import com.marketplace.model.Category;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;
import java.util.List;

public interface CategoryRepository extends MongoRepository<Category, String> {
    Optional<Category> findBySlug(String slug);
    List<Category> findByVisibleOrderByDisplayOrder(boolean visible);
}
