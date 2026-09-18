package com.marketplace.config;

import com.marketplace.model.AppliedMigration;
import com.marketplace.model.Plan;
import com.marketplace.repository.AppliedMigrationRepository;
import com.marketplace.service.PlanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Sets sensible defaults for the Analytics/favorites feature flags on the
 * three plans that were seeded before those flags existed.
 *
 * <p>{@link Plan} is a Mongo document with no schema, so a brand-new boolean
 * field on an already-persisted plan silently deserialises to {@code false}
 * for everyone — including Premium — until something sets it explicitly.
 * This runs once, guarded by {@link AppliedMigration} so a later admin edit
 * (including deliberately turning a flag back off) is never overwritten by a
 * restart.
 */
@Slf4j
@Component
@Order(4)
@RequiredArgsConstructor
public class PlanAnalyticsFeatureMigrationRunner implements CommandLineRunner {

    private static final String MIGRATION_ID = "2026-09-plans-seed-analytics-feature-flags";

    private final AppliedMigrationRepository migrationRepository;
    private final PlanService planService;

    @Override
    public void run(String... args) {
        if (migrationRepository.existsById(MIGRATION_ID)) {
            log.info("Migration '{}' already applied — skipping", MIGRATION_ID);
            return;
        }

        int updated = 0;
        for (Plan plan : planService.getAllOrdered()) {
            boolean basicOrAbove = "BASIC".equalsIgnoreCase(plan.getCode()) || "PREMIUM".equalsIgnoreCase(plan.getCode());
            boolean premium = "PREMIUM".equalsIgnoreCase(plan.getCode());

            plan.setAllowsProfileViewsCount(basicOrAbove);
            plan.setAllowsQuoteTrend(basicOrAbove);
            plan.setAllowsViewsTrend(premium);
            plan.setAllowsRatingTrend(premium);
            plan.setAllowsConversionInsights(premium);
            plan.setAllowsFavoritesInsights(premium);

            planService.saveRaw(plan);
            updated++;
        }

        String details = "Set Analytics feature flags on " + updated + " plan(s): Basic+ get views count and the "
                + "quote trend chart; Premium adds the views trend, rating trend, conversion insight and favorites feed/notifications.";
        migrationRepository.save(AppliedMigration.of(MIGRATION_ID, details));
        planService.evictCache();
        log.info("Plan analytics feature migration: {}", details);
    }
}
