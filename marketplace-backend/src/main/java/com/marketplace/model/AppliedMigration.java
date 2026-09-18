package com.marketplace.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * A record that a one-time data migration has already run.
 *
 * <p>Needed for migrations that cannot detect their own completion from the
 * data alone. Moving every vendor to the free tier is the motivating case: on
 * first run no vendor has ever paid, so demoting them all is correct — but
 * once payments exist, vendors legitimately sit on paid plans, and a runner
 * that re-ran on each restart would demote paying customers.
 */
@Data
@Document(collection = "applied_migrations")
public class AppliedMigration {

    /** The migration's stable id, e.g. {@code 2026-09-plans-move-vendors-to-free}. */
    @Id
    private String id;

    private Instant appliedAt;
    private String details;

    public static AppliedMigration of(String id, String details) {
        AppliedMigration migration = new AppliedMigration();
        migration.setId(id);
        migration.setAppliedAt(Instant.now());
        migration.setDetails(details);
        return migration;
    }
}
