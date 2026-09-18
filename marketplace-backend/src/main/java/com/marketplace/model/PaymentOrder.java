package com.marketplace.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * A checkout attempt, created the moment a vendor picks a plan and before any
 * money moves.
 *
 * <p>{@code amountPaise} is fixed here, computed server-side from the
 * {@link Plan} document at creation time — the client only ever sends a plan
 * code and billing period, never an amount, so there is nothing for a
 * tampered request to overwrite.
 */
@Data
@Document(collection = "payment_orders")
public class PaymentOrder {

    public static final String STATUS_CREATED = "CREATED";
    public static final String STATUS_PAID = "PAID";
    public static final String STATUS_FAILED = "FAILED";
    public static final String STATUS_PENDING = "PENDING";

    @Id
    private String id;

    private String vendorId;
    private String planCode;
    /** MONTHLY or YEARLY. */
    private String billingPeriod;

    private long amountPaise;
    private String currency;

    /** The coupon applied at checkout, if any. */
    private String couponCode;
    /** How much the coupon above took off, in paise — already reflected in {@code amountPaise}. */
    private long couponDiscountPaise;
    /** The prorated credit from an active subscription's unused time, if this order is an upgrade. */
    private long creditAppliedPaise;

    private String gatewayOrderId;

    /** CREATED, PAID, FAILED or PENDING. */
    private String status;

    private Instant createdAt;
    private Instant updatedAt;
}
