package com.marketplace.config;

import com.marketplace.model.AppliedMigration;
import com.marketplace.model.Plan;
import com.marketplace.model.vendor.Vendor;
import com.marketplace.repository.AppliedMigrationRepository;
import com.marketplace.repository.VendorRepository;
import com.marketplace.service.PlanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

/**
 * Moves every existing vendor onto the free tier, once.
 *
 * <p>Before plans existed, {@code AuthService.vendorSignup} stamped every new
 * vendor with the literal string {@code "BASIC"} and nothing ever changed it.
 * BASIC is now a paid tier, and since there was no payment system, not one of
 * those vendors ever bought it — leaving them there would hand out a paid plan
 * for free.
 *
 * <p>This cannot detect its own completion from the data: after it runs, a
 * vendor on BASIC is indistinguishable from one who later pays for BASIC. It
 * is therefore guarded by an {@link AppliedMigration} record, so a restart
 * after payments go live can never demote a paying customer.
 */
@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
public class PlanMigrationRunner implements CommandLineRunner {

    private static final String MIGRATION_ID = "2026-09-plans-move-existing-vendors-to-default";

    private final VendorRepository vendorRepository;
    private final AppliedMigrationRepository migrationRepository;
    private final PlanService planService;

    @Override
    public void run(String... args) {
        if (migrationRepository.existsById(MIGRATION_ID)) {
            log.info("Plan migration '{}' already applied — skipping", MIGRATION_ID);
            return;
        }

        Plan defaultPlan = planService.getDefaultPlan();
        List<Vendor> vendors = vendorRepository.findAll();
        int migrated = 0;

        for (Vendor vendor : vendors) {
            if (!defaultPlan.getCode().equalsIgnoreCase(vendor.getSubscriptionPlan())) {
                vendor.setSubscriptionPlan(defaultPlan.getCode());
                vendor.setUpdatedAt(Instant.now());
                vendorRepository.save(vendor);
                migrated++;
            }
        }

        String details = String.format("Moved %d of %d vendor(s) to %s (no payment system existed, "
                + "so none of them had purchased a paid plan)", migrated, vendors.size(), defaultPlan.getCode());
        migrationRepository.save(AppliedMigration.of(MIGRATION_ID, details));

        log.info("Plan migration: {}", details);
    }
}
