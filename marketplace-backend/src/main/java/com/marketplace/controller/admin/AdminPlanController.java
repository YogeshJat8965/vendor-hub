package com.marketplace.controller.admin;

import com.marketplace.model.Plan;
import com.marketplace.repository.VendorRepository;
import com.marketplace.service.PlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Admin control over subscription tiers — prices, limits and features.
 *
 * <p>This is the only way plan values change. Nothing in the app hardcodes a
 * limit or a price, so whatever is saved here is what every enforcement point
 * uses on the next request.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminPlanController {

    private final PlanService planService;
    private final VendorRepository vendorRepository;

    /** Every plan, each with the number of vendors currently on it. */
    @GetMapping("/plans")
    public ResponseEntity<?> getPlans() {
        Map<String, Long> subscribers = subscriberCounts();

        List<Map<String, Object>> result = planService.getAllOrdered().stream()
                .map(plan -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("plan", plan);
                    row.put("subscriberCount", subscribers.getOrDefault(plan.getCode(), 0L));
                    return row;
                })
                .toList();

        return ResponseEntity.ok(result);
    }

    @PutMapping("/plans/{code}")
    public ResponseEntity<?> updatePlan(@PathVariable String code,
                                        @RequestBody Plan updates,
                                        Authentication authentication) {
        try {
            Plan saved = planService.update(code, updates, actor(authentication));
            return ResponseEntity.ok(Map.of("message", "Plan updated", "plan", saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/plans")
    public ResponseEntity<?> createPlan(@RequestBody Plan plan, Authentication authentication) {
        try {
            Plan saved = planService.create(plan, actor(authentication));
            return ResponseEntity.ok(Map.of("message", "Plan created", "plan", saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/plans/{code}")
    public ResponseEntity<?> deletePlan(@PathVariable String code) {
        try {
            long subscribers = subscriberCounts().getOrDefault(code.toUpperCase(), 0L);
            planService.delete(code, subscribers);
            return ResponseEntity.ok(Map.of("message", "Plan deleted"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Sets the pricing-page column order in one call. */
    @PutMapping("/plans/reorder")
    public ResponseEntity<?> reorderPlans(@RequestBody List<String> orderedCodes) {
        if (orderedCodes == null || orderedCodes.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No plans supplied"));
        }
        int updated = planService.reorder(orderedCodes);
        return ResponseEntity.ok(Map.of("message", "Order updated", "updated", updated));
    }

    /**
     * How many vendors sit on each plan, counted from the denormalised
     * {@code Vendor.subscriptionPlan} mirror — the same field the admin
     * directory filters on, so the numbers agree across screens.
     */
    private Map<String, Long> subscriberCounts() {
        Map<String, Long> counts = new LinkedHashMap<>();
        vendorRepository.findAll().forEach(vendor -> {
            String plan = vendor.getSubscriptionPlan();
            if (plan != null && !plan.isBlank()) {
                counts.merge(plan.toUpperCase(), 1L, Long::sum);
            }
        });
        return counts;
    }

    private String actor(Authentication authentication) {
        return authentication != null ? authentication.getName() : null;
    }
}
