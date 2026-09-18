package com.marketplace.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

/**
 * A vendor's subscription to a {@link Plan}.
 *
 * <p>Keyed on {@code vendorId} rather than the slug the previous version used:
 * {@code VendorService.updateVendorByEmail} regenerates a vendor's slug
 * whenever they change their business name, so a slug-keyed subscription would
 * quietly detach from its owner the first time a vendor renamed themselves.
 *
 * <p>{@code amountPaidPaise} records what the vendor actually paid rather than
 * the plan's current price. If an admin later raises the price, everyone
 * already subscribed keeps their rate until the period ends.
 *
 * <p>There is no auto-renewal and no downgrade: a purchase is fixed-term.
 * When {@code currentPeriodEnd} passes, {@code SubscriptionLifecycleService}
 * expires it and the vendor falls back to the default plan — nothing is
 * charged automatically, and a vendor who upgraded can never move back to a
 * cheaper plan while this one is still active. To continue on a paid tier,
 * the vendor buys again.
 */
@Data
@Document(collection = "subscriptions")
public class Subscription {

    public static final String STATUS_ACTIVE = "ACTIVE";
    public static final String STATUS_EXPIRED = "EXPIRED";
    public static final String STATUS_CANCELLED = "CANCELLED";
    public static final String STATUS_PENDING = "PENDING";

    public static final String PERIOD_MONTHLY = "MONTHLY";
    public static final String PERIOD_YEARLY = "YEARLY";

    /** A real purchase, as opposed to a plan an admin granted for free. */
    public static final String SOURCE_PURCHASE = "PURCHASE";
    public static final String SOURCE_ADMIN_GRANT = "ADMIN_GRANT";

    @Id
    private String id;

    @Indexed
    private String vendorId;
    /** Denormalised for admin listings; never used as the lookup key. */
    private String vendorSlug;

    private String planCode;

    /** ACTIVE, EXPIRED, CANCELLED or PENDING. */
    private String status;

    /** What was actually charged, in paise. Zero for an admin-granted plan or a coupon covering the full price. */
    private long amountPaidPaise;

    /** MONTHLY or YEARLY. */
    private String billingPeriod;

    private Instant currentPeriodStart;
    private Instant currentPeriodEnd;

    /**
     * Set when an admin force-ends this subscription early (there is no
     * vendor-initiated cancellation — nothing is refunded, so ending early
     * only ever happens at the admin's discretion). Null for a subscription
     * that ran its full course and simply expired.
     */
    private Instant cancelledAt;

    /** What they were on before, so an upgrade can be described accurately. */
    private String previousPlanCode;

    /** PURCHASE or ADMIN_GRANT — grants are excluded from revenue reporting. */
    private String source;

    /** Why an admin granted or force-ended this, when they did. */
    private String adminNote;

    /** The coupon applied at purchase, if any — kept for audit even though the coupon itself may later change or be deleted. */
    private String couponCode;

    /** How much the coupon above took off, in paise. */
    private long couponDiscountPaise;

    /**
     * Which of the admin-configured "days before expiry" reminder thresholds
     * have already fired for the *current* period, so each one sends exactly
     * once. Cleared whenever the period changes (a fresh purchase gets a
     * fresh reminder cycle).
     */
    private Set<Integer> remindersSent = new HashSet<>();

    private Instant createdAt;
    private Instant updatedAt;

    /** ACTIVE and still inside its paid period. */
    public boolean isCurrentlyActive() {
        return STATUS_ACTIVE.equals(status)
                && currentPeriodEnd != null
                && currentPeriodEnd.isAfter(Instant.now());
    }
}
