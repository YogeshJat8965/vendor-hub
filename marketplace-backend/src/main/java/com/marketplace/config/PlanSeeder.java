package com.marketplace.config;

import com.marketplace.model.Plan;
import com.marketplace.repository.PlanRepository;
import com.marketplace.service.PlanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.Instant;

/**
 * Creates the three starting tiers the first time the app runs.
 *
 * <p>These are seed values, not constants: the moment they exist an admin owns
 * them. The seeder therefore only ever writes to an <em>empty</em> collection —
 * it must never "correct" a plan back to these numbers on restart, or an admin
 * lowering Premium's price would silently find it reset on the next deploy.
 */
@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class PlanSeeder implements CommandLineRunner {

    private final PlanRepository planRepository;
    private final PlanService planService;

    @Override
    public void run(String... args) {
        if (planRepository.count() > 0) {
            log.info("Plans already configured ({} found) — leaving admin's values untouched",
                    planRepository.count());
            return;
        }

        log.info("No plans found — seeding the three starting tiers");

        planService.saveRaw(free());
        planService.saveRaw(basic());
        planService.saveRaw(premium());

        log.info("Seeded plans: FREE, BASIC, PREMIUM");
    }

    private Plan free() {
        Plan plan = base("FREE", "Free", 1, 0L);
        plan.setDefault(true);
        plan.setTagline("Get listed and start receiving quotes");
        plan.setDescription("Everything you need to appear on VendorHub and win your first customers.");
        plan.setBadgeColor("#9C8E82");

        plan.setMaxCatalogues(1);
        plan.setMaxItemsPerCatalogue(2);
        plan.setMaxImagesPerItem(1);
        plan.setMaxCoverImages(1);
        plan.setMaxDescriptionChars(150);

        // Quotes are the core of the marketplace — every tier can receive them,
        // otherwise a free vendor has no reason to be listed at all.
        plan.setAllowsGetQuote(true);
        return plan;
    }

    private Plan basic() {
        Plan plan = base("BASIC", "Basic", 2, 19900L);
        plan.setTagline("More room to show your work");
        plan.setDescription("Five catalogues and richer listings for a growing business.");
        plan.setBadgeColor("#6B8CAE");

        plan.setMaxCatalogues(5);
        plan.setMaxItemsPerCatalogue(5);
        plan.setMaxImagesPerItem(3);
        plan.setMaxCoverImages(1);
        plan.setMaxDescriptionChars(300);

        plan.setAllowsGetQuote(true);
        return plan;
    }

    private Plan premium() {
        Plan plan = base("PREMIUM", "Premium", 3, 29900L);
        plan.setHighlighted(true);
        plan.setTagline("Stand out and get found first");
        plan.setDescription("Priority placement, rich media, and direct contact options.");
        plan.setBadgeColor("#C4975A");

        plan.setMaxCatalogues(7);
        plan.setMaxItemsPerCatalogue(10);
        plan.setMaxImagesPerItem(7);
        plan.setMaxCoverImages(1);
        plan.setMaxDescriptionChars(2000);

        plan.setAllowsGetQuote(true);
        plan.setAllowsPriceRange(true);
        plan.setAllowsMaterialsDetails(true);
        plan.setAllowsProjectTimeline(true);
        plan.setAllowsBeforeAfterImages(true);
        plan.setAllowsVideo(true);
        plan.setAllowsPdfBrochure(true);
        plan.setFeaturedBadge(true);
        plan.setPriorityVisibility(true);
        plan.setAllowsExtraCta(true);
        return plan;
    }

    private Plan base(String code, String name, int order, long monthlyPaise) {
        Plan plan = new Plan();
        plan.setCode(code);
        plan.setName(name);
        plan.setDisplayOrder(order);
        plan.setMonthlyPricePaise(monthlyPaise);
        plan.setCurrency("INR");
        plan.setPurchasable(true);
        plan.setCreatedAt(Instant.now());
        plan.setUpdatedAt(Instant.now());
        plan.setUpdatedBy("system:seeder");
        return plan;
    }
}
