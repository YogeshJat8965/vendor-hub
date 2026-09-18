package com.marketplace.controller;

import com.marketplace.model.PaymentOrder;
import com.marketplace.payment.MockPaymentGateway;
import com.marketplace.repository.PaymentOrderRepository;
import com.marketplace.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * The two entry points a real payment gateway would own, not VendorHub:
 * the hosted checkout page where a card is actually entered, and the
 * server-to-server webhook that confirms a payment independently of whatever
 * the browser reports.
 *
 * <p>Both are intentionally unauthenticated — a real gateway's checkout runs
 * on the gateway's own domain, and a real webhook has no user session either.
 * Both are still safe because {@link PaymentService#verifyAndActivate}
 * insists on a valid signature and never trusts a client-supplied amount.
 */
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentGatewayController {

    private final MockPaymentGateway mockGateway;
    private final PaymentOrderRepository orderRepository;
    private final PaymentService paymentService;

    /**
     * Stands in for the gateway's own checkout UI: a card number goes in, a
     * payment id and signature come out — the same shape the real checkout.js
     * success handler would hand back to the browser. See
     * {@link MockPaymentGateway} for the test card numbers and what each does.
     */
    @PostMapping("/mock/charge")
    public ResponseEntity<?> charge(@RequestBody Map<String, String> payload) {
        String gatewayOrderId = payload.get("gatewayOrderId");
        String cardNumber = payload.get("cardNumber");

        try {
            MockPaymentGateway.ChargeResult result = mockGateway.simulateCharge(gatewayOrderId, cardNumber);

            PaymentOrder order = orderRepository.findByGatewayOrderId(gatewayOrderId).orElse(null);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("orderId", order != null ? order.getId() : null);
            response.put("gatewayOrderId", gatewayOrderId);
            response.put("gatewayPaymentId", result.gatewayPaymentId());
            response.put("status", result.status());
            response.put("signature", result.signature());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * What a real gateway calls when a payment's status changes — the
     * authoritative path. In production this is the source of truth even when
     * the browser never comes back (the tab closed, the network dropped);
     * here it exercises the exact same idempotent activation as the vendor's
     * own post-checkout callback.
     */
    @PostMapping("/webhook")
    public ResponseEntity<?> webhook(@RequestBody Map<String, String> payload) {
        String gatewayOrderId = payload.get("gatewayOrderId");
        String gatewayPaymentId = payload.get("gatewayPaymentId");
        String signature = payload.get("signature");

        PaymentOrder order = orderRepository.findByGatewayOrderId(gatewayOrderId).orElse(null);
        if (order == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Unknown order"));
        }

        try {
            Map<String, Object> result = paymentService.verifyAndActivate(order.getId(), gatewayPaymentId, signature);
            return ResponseEntity.ok(result);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
