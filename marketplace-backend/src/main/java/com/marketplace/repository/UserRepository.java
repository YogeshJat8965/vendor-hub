package com.marketplace.repository;

import com.marketplace.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByGoogleId(String googleId);
    boolean existsByEmail(String email);
    List<User> findByRole(String role);

    // Admin panel: headline counts and the growth deltas on the dashboard,
    // which compare signups in one period against the period before it.
    long countByRole(String role);
    long countByBannedTrue();
    long countByCreatedAtBetween(Instant start, Instant end);
    long countByRoleAndCreatedAtBetween(String role, Instant start, Instant end);
    List<User> findByCreatedAtAfter(Instant after);
    List<User> findTop20ByOrderByCreatedAtDesc();
}
