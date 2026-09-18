package com.marketplace.controller;

import com.marketplace.model.PaymentTransaction;
import com.marketplace.model.vendor.Vendor;
import com.marketplace.repository.PaymentTransactionRepository;
import com.marketplace.repository.VendorRepository;
import com.marketplace.service.PaymentService;
import com.marketplace.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * The vendor-facing side of checkout: start an order, confirm what the
 * gateway reported, and look at your own billing history.
 *
 * <p>Every endpoint resolves the vendor from the JWT, the same fix applied to
 * {@code VendorController} — a vendor can only ever buy a plan for themselves.
 */
@RestController
@RequestMapping("/api/vendor/payments")
@RequiredArgsConstructor
public class VendorPaymentController {

    private final PaymentService paymentService;
    private final SubscriptionService subscriptionService;
    private final VendorRepository vendorRepository;
    private final PaymentTransactionRepository transactionRepository;

    @PostMapping("/orders")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, String> payload, Authentication authentication) {
        return currentVendor(authentication)
                .<ResponseEntity<?>>map(vendor -> {
                    try {
                        Map<String, Object> order = paymentService.createOrder(
                                vendor, payload.get("planCode"), payload.get("billingPeriod"), payload.get("couponCode"));
                        return ResponseEntity.ok(order);
                    } catch (IllegalArgumentException e) {
                        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
                    }
                })
                .orElseGet(this::noVendorAccount);
    }

    /**
     * Confirms a payment after the (simulated) checkout finishes. Also the
     * path {@code /api/payments/webhook} reaches for the same outcome — both
     * are safe to call for the same payment; only the first does anything.
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verify(@RequestBody Map<String, String> payload, Authentication authentication) {
        return currentVendor(authentication)
                .<ResponseEntity<?>>map(vendor -> {
                    try {
                        Map<String, Object> result = paymentService.verifyAndActivate(
                                payload.get("orderId"), payload.get("gatewayPaymentId"), payload.get("signature"));
                        return ResponseEntity.ok(result);
                    } catch (SecurityException e) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
                    } catch (IllegalArgumentException | IllegalStateException e) {
                        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
                    }
                })
                .orElseGet(this::noVendorAccount);
    }

    /** The signed-in vendor's own payment history, newest first. */
    @GetMapping("/history")
    public ResponseEntity<?> history(Authentication authentication) {
        return currentVendor(authentication)
                .<ResponseEntity<?>>map(vendor -> {
                    List<PaymentTransaction> transactions = transactionRepository.findByVendorId(vendor.getId()).stream()
                            .sorted(Comparator.comparing(PaymentTransaction::getCreatedAt,
                                    Comparator.nullsLast(Comparator.reverseOrder())))
                            .toList();
                    return ResponseEntity.ok(transactions);
                })
                .orElseGet(this::noVendorAccount);
    }

    /** The signed-in vendor's current subscription, if any. */
    @GetMapping("/subscription")
    public ResponseEntity<?> currentSubscription(Authentication authentication) {
        return currentVendor(authentication)
                .<ResponseEntity<?>>map(vendor -> ResponseEntity.ok(
                        subscriptionService.getActiveSubscription(vendor.getId()).orElse(null)))
                .orElseGet(this::noVendorAccount);
    }

    private Optional<Vendor> currentVendor(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return Optional.empty();
        }
        return vendorRepository.findById(authentication.getName());
    }

    private ResponseEntity<?> noVendorAccount() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "No vendor account for the signed-in user"));
    }
}
