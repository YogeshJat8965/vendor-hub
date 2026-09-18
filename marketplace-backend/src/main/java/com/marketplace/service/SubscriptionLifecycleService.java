package com.marketplace.service;

import com.marketplace.model.Plan;
import com.marketplace.model.PlatformSettings;
import com.marketplace.model.Subscription;
import com.marketplace.model.vendor.Vendor;
import com.marketplace.repository.SubscriptionRepository;
import com.marketplace.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Keeps subscriptions honest over time without anyone touching them.
 *
 * <p>There is no auto-renewal and no downgrade: a purchase is fixed-term.
 * When a subscription's period ends it simply expires — the vendor falls
 * back to the default plan and must buy again to continue on a paid tier.
 * The only thing this scheduler does before that point is send the
 * admin-configured "days before expiry" reminders, each exactly once.
 *
 * <p>Runs once a day via {@link #runDailyLifecycle()}. That same method is
 * also reachable from an admin endpoint
 * ({@code POST /api/admin/subscriptions/run-lifecycle-check}) so it can be
 * exercised on demand — there is no other practical way to test a scheduler
 * without waiting real days for a period to end.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionLifecycleService {

    private final SubscriptionRepository subscriptionRepository;
    private final VendorRepository vendorRepository;
    private final PlanService planService;
    private final SubscriptionService subscriptionService;
    private final PlatformSettingsService platformSettingsService;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 0 0 * * *")
    public void runScheduled() {
        runDailyLifecycle();
    }

    /** Processes every ACTIVE subscription once: expire it if its period has passed, otherwise remind if due. Returns a summary for the admin trigger endpoint. */
    public Map<String, Object> runDailyLifecycle() {
        Instant now = Instant.now();
        int expired = 0, remindersSent = 0;
        List<Integer> reminderThresholds = platformSettingsService.get().getRenewalReminderDaysBeforeExpiry();

        List<Subscription> actives = subscriptionRepository.findByStatus(Subscription.STATUS_ACTIVE);
        for (Subscription sub : actives) {
            if (sub.getCurrentPeriodEnd() == null) {
                continue;
            }
            if (sub.getCurrentPeriodEnd().isAfter(now)) {
                if (sendReminderIfDue(sub, now, reminderThresholds)) {
                    remindersSent++;
                }
            } else {
                expireSubscription(sub, "Period ended");
                expired++;
            }
        }

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("checked", actives.size());
        summary.put("expired", expired);
        summary.put("remindersSent", remindersSent);
        summary.put("ranAt", now.toString());
        log.info("Subscription lifecycle run: {}", summary);
        return summary;
    }

    private void expireSubscription(Subscription sub, String reason) {
        sub.setStatus(Subscription.STATUS_EXPIRED);
        sub.setUpdatedAt(Instant.now());
        subscriptionRepository.save(sub);

        vendorRepository.findById(sub.getVendorId()).ifPresent(vendor -> {
            subscriptionService.syncPlanMirror(vendor);
            Plan defaultPlan = planService.getDefaultPlan();
            Plan endedPlan = planService.findByCode(sub.getPlanCode()).orElse(null);
            notificationService.notify(vendor.getId(), "SUBSCRIPTION", "Subscription ended",
                    "Your " + (endedPlan != null ? endedPlan.getName() : sub.getPlanCode()) + " plan has ended (" + reason
                            + "). You're now on the " + defaultPlan.getName() + " plan — buy again anytime from Billing to continue on a paid tier.",
                    "/dashboard/vendor/billing");
        });
        log.info("Expired subscription {} for vendor {}: {}", sub.getId(), sub.getVendorId(), reason);
    }

    /** Sends the one admin-configured reminder that's due, if any, marking it sent so it never fires twice for the same period. */
    private boolean sendReminderIfDue(Subscription sub, Instant now, List<Integer> thresholds) {
        if (!Subscription.SOURCE_PURCHASE.equals(sub.getSource()) || thresholds.isEmpty()) {
            return false;
        }
        ZoneId zone = ZoneId.systemDefault();
        LocalDate today = LocalDate.ofInstant(now, zone);
        LocalDate periodEndDate = LocalDate.ofInstant(sub.getCurrentPeriodEnd(), zone);
        long daysLeft = ChronoUnit.DAYS.between(today, periodEndDate);

        if (!thresholds.contains((int) daysLeft) || sub.getRemindersSent().contains((int) daysLeft)) {
            return false;
        }

        Vendor vendor = vendorRepository.findById(sub.getVendorId()).orElse(null);
        if (vendor == null) {
            return false;
        }
        Plan plan = planService.getByCode(sub.getPlanCode());
        String dayWord = daysLeft == 1 ? "day" : "days";
        String message = "Your " + plan.getName() + " plan ends in " + daysLeft + " " + dayWord
                + ". There's no auto-renewal — buy again from Billing before then to keep it, "
                + "or you'll move to " + planService.getDefaultPlan().getName() + " automatically.";

        notificationService.notify(vendor.getId(), "SUBSCRIPTION", "Plan ending soon", message, "/dashboard/vendor/billing");

        sub.getRemindersSent().add((int) daysLeft);
        sub.setUpdatedAt(now);
        subscriptionRepository.save(sub);
        return true;
    }
}
