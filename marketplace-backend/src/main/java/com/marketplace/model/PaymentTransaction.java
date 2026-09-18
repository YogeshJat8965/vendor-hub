package com.marketplace.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * The permanent record of what a gateway said happened to one payment
 * attempt — the audit trail behind every subscription activation and every
 * revenue figure the admin panel will show.
 *
 * <p>{@code gatewayPaymentId} carries a unique index specifically so a
 * replayed callback or webhook can never write two rows for one real charge:
 * the second write hits a duplicate-key error and is treated as "already
 * processed" rather than activating a subscription twice.
 */
@Data
@Document(collection = "payment_transactions")
public class PaymentTransaction {

    public static final String STATUS_SUCCESS = "SUCCESS";
    public static final String STATUS_FAILED = "FAILED";
    public static final String STATUS_PENDING = "PENDING";

    @Id
    private String id;

    private String vendorId;
    private String planCode;
    private String billingPeriod;

    private long amountPaise;
    private String currency;

    private String orderId;
    private String gatewayOrderId;

    @Indexed(unique = true)
    private String gatewayPaymentId;

    /** SUCCESS, FAILED or PENDING. */
    private String status;
    private String failureReason;

    /** The subscription this payment activated, once known. */
    private String subscriptionId;

    /** The coupon applied at checkout, if any, kept for audit. */
    private String couponCode;
    /** How much the coupon above took off, in paise — already reflected in {@code amountPaise}. */
    private long couponDiscountPaise;

    private Instant createdAt;
    private Instant updatedAt;
}
