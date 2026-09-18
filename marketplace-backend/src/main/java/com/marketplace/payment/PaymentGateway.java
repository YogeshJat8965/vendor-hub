package com.marketplace.payment;

/**
 * What VendorHub needs from any payment gateway.
 *
 * <p>Shaped after how a real hosted-checkout gateway (Razorpay, Stripe)
 * actually works: the server creates an order, the customer pays on the
 * gateway's own checkout UI, and the server verifies what comes back rather
 * than trusting it outright. {@link MockPaymentGateway} implements this
 * without any external account; swapping in a real one later means writing
 * one new class against this same interface — nothing that calls a
 * {@code PaymentGateway} needs to change.
 */
public interface PaymentGateway {

    /** Creates an order for {@code amountPaise}, returning the gateway's own order id. */
    GatewayOrder createOrder(String internalOrderId, long amountPaise, String currency);

    /**
     * Verifies that {@code signature} genuinely came from the gateway for this
     * exact order/payment pair. This is what stops a forged callback from
     * activating a subscription nobody paid for.
     */
    boolean verifySignature(String gatewayOrderId, String gatewayPaymentId, String signature);

    /** The gateway's own record of a payment — the authority on whether it succeeded. */
    GatewayPayment fetchPayment(String gatewayPaymentId);

    record GatewayOrder(String gatewayOrderId, long amountPaise, String currency) {
    }

    record GatewayPayment(String gatewayPaymentId, String gatewayOrderId, long amountPaise,
                          PaymentStatus status, String failureReason) {
    }

    enum PaymentStatus {
        SUCCESS, FAILED, PENDING
    }
}
