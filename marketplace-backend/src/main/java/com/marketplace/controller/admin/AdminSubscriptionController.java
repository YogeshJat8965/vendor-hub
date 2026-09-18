package com.marketplace.controller.admin;

import com.marketplace.model.PaymentTransaction;
import com.marketplace.model.Plan;
import com.marketplace.model.Subscription;
import com.marketplace.model.vendor.Vendor;
import com.marketplace.repository.SubscriptionRepository;
import com.marketplace.repository.VendorRepository;
import com.marketplace.service.AdminStatsService;
import com.marketplace.service.NotificationService;
import com.marketplace.service.PlanService;
import com.marketplace.service.SubscriptionLifecycleService;
import com.marketplace.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Admin oversight of subscriptions: the full list, and the manual actions a
 * support case needs — granting a plan without payment, and force-ending one
 * early. There are no refunds: once a vendor pays, that payment is final, so
 * "end" only revokes access going forward, never reverses the charge.
 *
 * <p>There is no separate audit-log collection. Every manual action is
 * recorded directly on the {@link Subscription} it acted on ({@code source},
 * {@code adminNote}, {@code cancelledAt}), which is enough to answer "who
 * changed this and why" without introducing a whole audit subsystem the rest
 * of the app doesn't otherwise have.
 */
@RestController
@RequestMapping("/api/admin/subscriptions")
@RequiredArgsConstructor
public class AdminSubscriptionController {

    private final SubscriptionRepository subscriptionRepository;
    private final VendorRepository vendorRepository;
    private final PlanService planService;
    private final SubscriptionService subscriptionService;
    private final SubscriptionLifecycleService subscriptionLifecycleService;
    private final NotificationService notificationService;

    /**
     * Runs the daily expiry/reminder sweep right now instead of waiting for
     * the nightly schedule — the only practical way to exercise it in
     * testing, and a legitimate ops "process subscriptions now" button.
     */
    @PostMapping("/run-lifecycle-check")
    public ResponseEntity<?> runLifecycleCheck() {
        return ResponseEntity.ok(subscriptionLifecycleService.runDailyLifecycle());
    }

    /** Every subscription, newest first, enriched with the vendor's real name. */
    @GetMapping
    public ResponseEntity<?> getAllSubscriptions() {
        List<Map<String, Object>> result = subscriptionRepository.findAll().stream()
                .sorted(Comparator.comparing(Subscription::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toRow)
                .toList();
        return ResponseEntity.ok(result);
    }

    private Map<String, Object> toRow(Subscription sub) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("subscription", sub);
        vendorRepository.findById(sub.getVendorId()).ifPresentOrElse(
                vendor -> {
                    row.put("vendorName", AdminStatsService.displayName(vendor));
                    row.put("vendorEmail", vendor.getEmail());
                    row.put("vendorSlug", vendor.getSlug());
                },
                () -> {
                    row.put("vendorName", "(vendor deleted)");
                    row.put("vendorEmail", null);
                    row.put("vendorSlug", null);
                });
        return row;
    }

    /**
     * Grants a plan without a payment — comping a vendor. Deliberately
     * creates no {@link PaymentTransaction}, which is what keeps a comped
     * plan out of revenue: {@code AdminStatsService.getRevenue} only ever
     * sums real transactions.
     */
    @PostMapping("/grant")
    public ResponseEntity<?> grant(@RequestBody Map<String, Object> payload, Authentication authentication) {
        String vendorId = (String) payload.get("vendorId");
        String planCode = (String) payload.get("planCode");
        String reason = (String) payload.get("reason");
        Object daysRaw = payload.get("durationDays");
        int durationDays = daysRaw == null ? 30 : ((Number) daysRaw).intValue();

        if (vendorId == null || planCode == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "vendorId and planCode are required"));
        }
        if (reason == null || reason.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "A reason is required for a manual grant"));
        }
        if (durationDays < 1 || durationDays > 365) {
            return ResponseEntity.badRequest().body(Map.of("error", "durationDays must be between 1 and 365"));
        }

        Vendor vendor = vendorRepository.findById(vendorId).orElse(null);
        if (vendor == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Vendor not found"));
        }
        Plan plan = planService.findByCode(planCode).orElse(null);
        if (plan == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Unknown plan: " + planCode));
        }

        Instant now = Instant.now();
        Subscription sub = new Subscription();
        sub.setVendorId(vendor.getId());
        sub.setVendorSlug(vendor.getSlug());
        sub.setPlanCode(plan.getCode());
        sub.setStatus(Subscription.STATUS_ACTIVE);
        sub.setAmountPaidPaise(0);
        sub.setBillingPeriod(Subscription.PERIOD_MONTHLY);
        sub.setCurrentPeriodStart(now);
        sub.setCurrentPeriodEnd(now.plus(durationDays, ChronoUnit.DAYS));
        sub.setSource(Subscription.SOURCE_ADMIN_GRANT);
        sub.setAdminNote(reason + " (granted by " + actor(authentication) + ")");
        sub.setCreatedAt(now);
        sub.setUpdatedAt(now);
        Subscription saved = subscriptionRepository.save(sub);

        subscriptionService.syncPlanMirror(vendor);
        notificationService.notify(vendor.getId(), "SUBSCRIPTION", "You're now on " + plan.getName(),
                "An admin has granted you the " + plan.getName() + " plan for " + durationDays + " days.",
                "/dashboard/vendor/billing");

        return ResponseEntity.ok(toRow(saved));
    }

    /**
     * Ends a subscription immediately, at the admin's discretion — access is
     * revoked right now, not at period end. There is no refund: this is for
     * fraud, policy violations, or correcting a mistake, not a customer
     * service convenience.
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(@PathVariable String id, @RequestBody(required = false) Map<String, String> payload,
                                    Authentication authentication) {
        String reason = payload != null ? payload.get("reason") : null;

        try {
            Subscription saved = subscriptionService.endImmediately(id, reason, actor(authentication));
            vendorRepository.findById(saved.getVendorId()).ifPresent(vendor ->
                    notificationService.notify(vendor.getId(), "SUBSCRIPTION", "Subscription ended",
                            "An admin ended your subscription early." + (reason != null && !reason.isBlank() ? " Reason: " + reason : ""),
                            "/dashboard/vendor/billing"));
            return ResponseEntity.ok(toRow(saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private String actor(Authentication authentication) {
        return authentication != null ? authentication.getName() : "unknown";
    }
}
