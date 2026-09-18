package com.marketplace.payment;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * A self-contained payment gateway that needs no external account or keys —
 * built so a checkout can be developed and tested completely offline, with
 * every step of a real gateway integration (order creation, signature
 * verification, payment lookup) genuinely exercised rather than stubbed out.
 *
 * <p>Signatures are real HMAC-SHA256 over {@code orderId|paymentId}, so
 * {@link #verifySignature} actually rejects a forged value instead of always
 * returning {@code true} — the one shortcut that would make this mock
 * dishonest about what it tests.
 *
 * <p>Outcomes are deterministic by card number, mirroring the well-known test
 * cards real gateways publish for their own sandboxes:
 * <ul>
 *   <li>{@code 4111 1111 1111 1111} — succeeds</li>
 *   <li>{@code 4000 0000 0000 0002} — declined</li>
 *   <li>{@code 4000 0000 0000 0119} — pending, then succeeds once the caller
 *       checks again (simulating an async method like UPI or netbanking)</li>
 * </ul>
 */
@Slf4j
@Component
public class MockPaymentGateway implements PaymentGateway {

    public static final String CARD_SUCCESS = "4111111111111111";
    public static final String CARD_DECLINED = "4000000000000002";
    public static final String CARD_PENDING_THEN_SUCCESS = "4000000000000119";

    @Value("${payments.mock.secret:mock-gateway-shared-secret-do-not-use-in-production}")
    private String secret;

    /** In-memory ledger of orders this mock has created — this gateway has no external state. */
    private final Map<String, GatewayOrder> orders = new ConcurrentHashMap<>();

    /** Payments, keyed by gatewayPaymentId. */
    private final Map<String, MutablePayment> payments = new ConcurrentHashMap<>();

    @Override
    public GatewayOrder createOrder(String internalOrderId, long amountPaise, String currency) {
        String gatewayOrderId = "order_mock_" + shortId(internalOrderId);
        GatewayOrder order = new GatewayOrder(gatewayOrderId, amountPaise, currency);
        orders.put(gatewayOrderId, order);
        return order;
    }

    /**
     * Simulates the customer completing checkout on the gateway's own page.
     * Not part of {@link PaymentGateway} — a real integration has no such
     * method, because a real gateway's hosted checkout runs on the gateway's
     * own domain, not ours. This exists purely so the mock has something to
     * stand in for that page.
     */
    public ChargeResult simulateCharge(String gatewayOrderId, String cardNumber) {
        GatewayOrder order = orders.get(gatewayOrderId);
        if (order == null) {
            throw new IllegalArgumentException("Unknown order: " + gatewayOrderId);
        }

        String digits = cardNumber == null ? "" : cardNumber.replaceAll("\\s+", "");
        String gatewayPaymentId = "pay_mock_" + UUID.randomUUID().toString().replace("-", "").substring(0, 18);

        PaymentStatus initialStatus;
        String failureReason;
        switch (digits) {
            case CARD_SUCCESS -> { initialStatus = PaymentStatus.SUCCESS; failureReason = null; }
            case CARD_PENDING_THEN_SUCCESS -> { initialStatus = PaymentStatus.PENDING; failureReason = null; }
            case CARD_DECLINED -> { initialStatus = PaymentStatus.FAILED; failureReason = "Card declined by issuing bank"; }
            default -> { initialStatus = PaymentStatus.FAILED; failureReason = "Unrecognised card number"; }
        }

        MutablePayment payment = new MutablePayment(gatewayOrderId, order.amountPaise(), initialStatus, failureReason);
        payments.put(gatewayPaymentId, payment);

        String signature = sign(gatewayOrderId, gatewayPaymentId);
        log.info("Mock gateway charge: order={} payment={} status={}", gatewayOrderId, gatewayPaymentId, initialStatus);
        return new ChargeResult(gatewayPaymentId, initialStatus, signature);
    }

    @Override
    public boolean verifySignature(String gatewayOrderId, String gatewayPaymentId, String signature) {
        String expected = sign(gatewayOrderId, gatewayPaymentId);
        // Constant-time comparison, matching how a real gateway SDK verifies —
        // a naive .equals() would leak timing information about the secret.
        return signature != null
                && MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8), signature.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public GatewayPayment fetchPayment(String gatewayPaymentId) {
        MutablePayment payment = payments.get(gatewayPaymentId);
        if (payment == null) {
            return new GatewayPayment(gatewayPaymentId, null, 0, PaymentStatus.FAILED, "Payment not found");
        }

        // The pending test card settles the moment anyone checks again — this
        // is what stands in for "the gateway confirmed it asynchronously" in a
        // system with no real background settlement to wait on.
        if (payment.status == PaymentStatus.PENDING && payment.checkedOnce) {
            payment.status = PaymentStatus.SUCCESS;
        }
        payment.checkedOnce = true;

        return new GatewayPayment(gatewayPaymentId, payment.gatewayOrderId, payment.amountPaise,
                payment.status, payment.failureReason);
    }

    private String sign(String gatewayOrderId, String gatewayPaymentId) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] raw = mac.doFinal((gatewayOrderId + "|" + gatewayPaymentId).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(raw);
        } catch (Exception e) {
            throw new IllegalStateException("Could not sign mock gateway payload", e);
        }
    }

    private String shortId(String internalOrderId) {
        return internalOrderId == null
                ? UUID.randomUUID().toString().replace("-", "").substring(0, 14)
                : internalOrderId.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
    }

    public record ChargeResult(String gatewayPaymentId, PaymentStatus status, String signature) {
    }

    private static final class MutablePayment {
        final String gatewayOrderId;
        final long amountPaise;
        PaymentStatus status;
        final String failureReason;
        boolean checkedOnce;

        MutablePayment(String gatewayOrderId, long amountPaise, PaymentStatus status, String failureReason) {
            this.gatewayOrderId = gatewayOrderId;
            this.amountPaise = amountPaise;
            this.status = status;
            this.failureReason = failureReason;
        }
    }
}
