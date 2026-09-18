package com.marketplace.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

/**
 * An admin-defined discount code a vendor can apply at checkout.
 *
 * <p>Every rule that governs whether a coupon works — which plans it applies
 * to, when it expires, how many times it can be used — is a field here the
 * admin controls, the same governing principle the {@link Plan} document
 * follows: nothing about pricing is hardcoded.
 */
@Data
@Document(collection = "coupons")
public class Coupon {

    public static final String TYPE_PERCENTAGE = "PERCENTAGE";
    public static final String TYPE_FLAT = "FLAT";

    @Id
    private String id;

    /** Always stored upper-cased — what the vendor types in at checkout. */
    @Indexed(unique = true)
    private String code;

    private String description;

    /** PERCENTAGE or FLAT. */
    private String discountType;

    /**
     * For PERCENTAGE: whole number 1–100. For FLAT: paise off, never more
     * than the order total — a coupon can discount an order to zero but never
     * make it negative.
     */
    private long discountValue;

    /** Plan codes this coupon applies to. Null or empty means every plan. */
    private List<String> applicablePlanCodes;

    /** Null means the coupon never expires on its own. */
    private Instant expiresAt;

    /** Null means unlimited uses. */
    private Integer maxRedemptions;

    /** How many times this coupon has actually been redeemed by a successful payment. */
    private int redemptionCount;

    /** Admin on/off switch, independent of expiry or redemption limit. */
    private boolean active = true;

    private Instant createdAt;
    private Instant updatedAt;
    private String createdBy;

    public boolean appliesToPlan(String planCode) {
        return applicablePlanCodes == null || applicablePlanCodes.isEmpty()
                || applicablePlanCodes.contains(planCode);
    }

    public boolean isExpired() {
        return expiresAt != null && expiresAt.isBefore(Instant.now());
    }

    public boolean isExhausted() {
        return maxRedemptions != null && redemptionCount >= maxRedemptions;
    }
}
