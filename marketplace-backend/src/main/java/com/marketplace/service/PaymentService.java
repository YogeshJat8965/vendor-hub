package com.marketplace.service;

import com.marketplace.model.*;
import com.marketplace.model.vendor.Vendor;
import com.marketplace.payment.PaymentGateway;
import com.marketplace.repository.PaymentOrderRepository;
import com.marketplace.repository.PaymentTransactionRepository;
import com.marketplace.repository.SubscriptionRepository;
import com.marketplace.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * The payment lifecycle: create an order, verify what the gateway reports,
 * and activate a subscription — exactly once per real payment, however many
 * times the confirmation arrives.
 *
 * <p>Two invariants matter more than anything else here:
 * <ol>
 *   <li><b>The server decides the price.</b> {@link #createOrder} reads the
 *       amount from the {@link Plan} document; nothing the client sends is
 *       ever trusted as an amount.</li>
 *   <li><b>Activation happens once.</b> {@link #verifyAndActivate} is called
 *       from both the browser's post-checkout callback and the gateway's own
 *       webhook — either can arrive first, or both can arrive at once — and
 *       exactly one {@link PaymentTransaction} and one {@link Subscription}
 *       must result. This is enforced by the unique index on
 *       {@code gatewayPaymentId}, not by an in-memory lock, so it holds even
 *       across two concurrent requests.</li>
 * </ol>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    /**
     * An internal-only marker, never returned to a caller: it means "a request
     * is actively deciding this payment's outcome right now." It exists so
     * that when a webhook and the browser callback race each other, exactly
     * one of them performs the gateway check and activation, and the other
     * waits for that result instead of reading a still-half-written row.
     */
    private static final String STATUS_RESOLVING = "RESOLVING";

    private final PaymentOrderRepository orderRepository;
    private final PaymentTransactionRepository transactionRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final VendorRepository vendorRepository;
    private final PlanService planService;
    private final SubscriptionService subscriptionService;
    private final CouponService couponService;
    private final NotificationService notificationService;
    private final PaymentGateway paymentGateway;
    private final MongoTemplate mongoTemplate;

    /**
     * Starts a checkout. The amount is resolved from the plan's current price
     * — never accepted from the caller — so an order can never be created for
     * more or less than what the plan actually costs right now. An optional
     * coupon is validated and discounted here too; it is only actually
     * redeemed (counted against its usage limit) once the payment settles.
     */
    public Map<String, Object> createOrder(Vendor vendor, String planCode, String billingPeriod, String couponCode) {
        Plan plan = planService.findByCode(planCode)
                .orElseThrow(() -> new IllegalArgumentException("Unknown plan: " + planCode));
        if (!plan.isPurchasable()) {
            throw new IllegalArgumentException(plan.getName() + " is not currently available for purchase");
        }

        boolean yearly = Subscription.PERIOD_YEARLY.equalsIgnoreCase(billingPeriod);
        if (yearly && (plan.getYearlyPricePaise() == null || plan.getYearlyPricePaise() <= 0)) {
            throw new IllegalArgumentException(plan.getName() + " does not offer yearly billing");
        }
        long fullPrice = yearly ? plan.getYearlyPricePaise() : plan.getMonthlyPricePaise();
        if (fullPrice <= 0) {
            throw new IllegalArgumentException("The " + plan.getName() + " plan has no cost to check out for");
        }

        // A vendor who has ever moved up to a pricier plan can never buy a
        // cheaper one while it's still active — there is no downgrade path.
        // Once this subscription runs out and they fall back to the default
        // plan, they're free to buy any plan again, including a cheaper one.
        long creditPaise = 0;
        Subscription current = subscriptionService.getActiveSubscription(vendor.getId()).orElse(null);
        if (current != null) {
            if (plan.getCode().equalsIgnoreCase(current.getPlanCode())) {
                throw new IllegalArgumentException("You're already on the " + plan.getName() + " plan");
            }
            Plan currentPlan = planService.getByCode(current.getPlanCode());
            if (plan.getMonthlyPricePaise() <= currentPlan.getMonthlyPricePaise()) {
                throw new IllegalArgumentException(
                        "You're on the " + currentPlan.getName() + " plan and downgrades aren't available — "
                                + "your plan will move to Free automatically when it expires, and you can choose any plan again then.");
            }
            creditPaise = unusedPeriodCredit(current);
        }

        Coupon coupon = null;
        long couponDiscountPaise = 0;
        if (couponCode != null && !couponCode.isBlank()) {
            coupon = couponService.validateForPlan(couponCode, plan);
            couponDiscountPaise = couponService.computeDiscount(coupon, fullPrice);
        }

        long amountPaise = Math.max(0, fullPrice - couponDiscountPaise - creditPaise);

        PaymentOrder order = new PaymentOrder();
        order.setVendorId(vendor.getId());
        order.setPlanCode(plan.getCode());
        order.setBillingPeriod(yearly ? Subscription.PERIOD_YEARLY : Subscription.PERIOD_MONTHLY);
        order.setAmountPaise(amountPaise);
        order.setCurrency(plan.getCurrency());
        order.setCreditAppliedPaise(creditPaise);
        order.setCouponCode(coupon != null ? coupon.getCode() : null);
        order.setCouponDiscountPaise(couponDiscountPaise);
        order.setStatus(PaymentOrder.STATUS_CREATED);
        order.setCreatedAt(Instant.now());
        order.setUpdatedAt(Instant.now());
        order = orderRepository.save(order);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("orderId", order.getId());
        response.put("amountPaise", order.getAmountPaise());
        response.put("currency", order.getCurrency());
        response.put("planCode", order.getPlanCode());
        response.put("billingPeriod", order.getBillingPeriod());
        response.put("creditAppliedPaise", creditPaise);
        response.put("couponCode", order.getCouponCode());
        response.put("couponDiscountPaise", couponDiscountPaise);

        if (amountPaise == 0) {
            // Fully covered by credit and/or coupon — activate right away
            // with no gateway involved at all, but still record a real
            // (zero-amount) transaction so payment history and the audit
            // trail account for how it happened.
            order.setStatus(PaymentOrder.STATUS_PAID);
            order.setUpdatedAt(Instant.now());
            order = orderRepository.save(order);

            PaymentTransaction transaction = new PaymentTransaction();
            transaction.setVendorId(order.getVendorId());
            transaction.setPlanCode(order.getPlanCode());
            transaction.setBillingPeriod(order.getBillingPeriod());
            transaction.setAmountPaise(0);
            transaction.setCurrency(order.getCurrency());
            transaction.setOrderId(order.getId());
            transaction.setCouponCode(order.getCouponCode());
            transaction.setCouponDiscountPaise(order.getCouponDiscountPaise());
            transaction.setGatewayPaymentId("credit_" + UUID.randomUUID());
            transaction.setStatus(PaymentTransaction.STATUS_SUCCESS);
            transaction.setCreatedAt(Instant.now());
            transaction.setUpdatedAt(Instant.now());

            Subscription subscription = activateSubscription(order);
            transaction.setSubscriptionId(subscription.getId());
            transactionRepository.save(transaction);
            if (order.getCouponCode() != null) {
                couponService.redeem(order.getCouponCode());
            }

            response.put("alreadyActivated", true);
            response.put("subscriptionId", subscription.getId());
            return response;
        }

        PaymentGateway.GatewayOrder gatewayOrder = paymentGateway.createOrder(order.getId(), amountPaise, plan.getCurrency());
        order.setGatewayOrderId(gatewayOrder.gatewayOrderId());
        order = orderRepository.save(order);
        response.put("gatewayOrderId", order.getGatewayOrderId());
        response.put("alreadyActivated", false);
        return response;
    }

    /**
     * The portion of what a vendor already paid that corresponds to time
     * remaining in their current period, prorated linearly by time. Used only
     * to credit an upgrade — a downgrade never charges anything up front, so
     * it never needs this.
     */
    private long unusedPeriodCredit(Subscription current) {
        if (current.getCurrentPeriodStart() == null || current.getCurrentPeriodEnd() == null) {
            return 0;
        }
        long totalMs = Duration.between(current.getCurrentPeriodStart(), current.getCurrentPeriodEnd()).toMillis();
        if (totalMs <= 0) {
            return 0;
        }
        long remainingMs = Math.max(0, Duration.between(Instant.now(), current.getCurrentPeriodEnd()).toMillis());
        double fraction = Math.min(1.0, (double) remainingMs / totalMs);
        return Math.round(current.getAmountPaidPaise() * fraction);
    }

    /**
     * Confirms one payment and, if it succeeded, activates the subscription.
     * Safe to call more than once for the same {@code gatewayPaymentId} — the
     * browser callback and the async webhook both call this, and can even
     * arrive at the same instant — and safe to call again later for a payment
     * that was PENDING the first time (that is exactly how a real settlement
     * webhook confirms an async payment method after the fact).
     *
     * <p>Concurrency is handled with two atomic Mongo operations rather than
     * an application-level lock, so the guarantee holds across two separate
     * requests, not just two threads in one process:
     * <ol>
     *   <li>{@code findAndModify(upsert=true)} claims the row for this
     *       {@code gatewayPaymentId} — the very first call for a payment
     *       creates it, every later call finds the same one.</li>
     *   <li>{@code findAndModify(query: status=PENDING, update: status=RESOLVING)}
     *       is a compare-and-set: of any number of concurrent callers, only
     *       one can ever win it, because MongoDB applies that update to at
     *       most one document matching the query, atomically. The winner
     *       checks the gateway and decides the outcome; everyone else — the
     *       loser of the race, or a call that arrives after the winner already
     *       finished — simply reads the now-settled result.</li>
     * </ol>
     */
    public Map<String, Object> verifyAndActivate(String orderId, String gatewayPaymentId, String signature) {
        PaymentOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        if (!paymentGateway.verifySignature(order.getGatewayOrderId(), gatewayPaymentId, signature)) {
            log.warn("Rejected payment verification for order {} — signature did not match", orderId);
            throw new SecurityException("Payment signature could not be verified");
        }

        claimTransactionRow(order, gatewayPaymentId);

        PaymentTransaction transaction = transactionRepository.findByGatewayPaymentId(gatewayPaymentId)
                .orElseThrow(() -> new IllegalStateException("Transaction row missing immediately after claiming it"));

        if (isTerminal(transaction.getStatus())) {
            return resultOf(transaction, "Already processed");
        }

        return resolveOutcome(order, gatewayPaymentId);
    }

    /** Ensures a transaction row exists for this payment id — creating it on the very first call, a no-op after. */
    private void claimTransactionRow(PaymentOrder order, String gatewayPaymentId) {
        Query query = Query.query(Criteria.where("gatewayPaymentId").is(gatewayPaymentId));
        Update update = new Update()
                .setOnInsert("vendorId", order.getVendorId())
                .setOnInsert("planCode", order.getPlanCode())
                .setOnInsert("billingPeriod", order.getBillingPeriod())
                .setOnInsert("amountPaise", order.getAmountPaise())
                .setOnInsert("currency", order.getCurrency())
                .setOnInsert("orderId", order.getId())
                .setOnInsert("gatewayOrderId", order.getGatewayOrderId())
                .setOnInsert("gatewayPaymentId", gatewayPaymentId)
                .setOnInsert("couponCode", order.getCouponCode())
                .setOnInsert("couponDiscountPaise", order.getCouponDiscountPaise())
                .setOnInsert("status", PaymentTransaction.STATUS_PENDING)
                .setOnInsert("createdAt", Instant.now());
        mongoTemplate.findAndModify(query, update, FindAndModifyOptions.options().upsert(true), PaymentTransaction.class);
    }

    /**
     * Decides — or waits for someone else to decide — what an unsettled
     * transaction's outcome is, exactly once per settlement.
     */
    private Map<String, Object> resolveOutcome(PaymentOrder order, String gatewayPaymentId) {
        Query casQuery = Query.query(Criteria.where("gatewayPaymentId").is(gatewayPaymentId)
                .and("status").is(PaymentTransaction.STATUS_PENDING));
        Update casUpdate = Update.update("status", STATUS_RESOLVING).set("updatedAt", Instant.now());

        PaymentTransaction wonRace = mongoTemplate.findAndModify(casQuery, casUpdate,
                FindAndModifyOptions.options().returnNew(true), PaymentTransaction.class);

        if (wonRace == null) {
            // Someone else is resolving this right now (or just finished) —
            // wait for a terminal result rather than returning nothing.
            return waitForSettlement(gatewayPaymentId);
        }

        // The amount is read from OUR order record, never from the gateway
        // response or the request — this is what makes a tampered amount
        // impossible rather than merely unlikely.
        PaymentGateway.GatewayPayment gatewayPayment = paymentGateway.fetchPayment(gatewayPaymentId);

        String finalStatus;
        String subscriptionId = null;
        String failureReason = null;

        switch (gatewayPayment.status()) {
            case SUCCESS -> {
                finalStatus = PaymentTransaction.STATUS_SUCCESS;
                Subscription subscription = activateSubscription(order);
                subscriptionId = subscription.getId();
                order.setStatus(PaymentOrder.STATUS_PAID);
                if (order.getCouponCode() != null) {
                    couponService.redeem(order.getCouponCode());
                }
            }
            case PENDING -> {
                // Still not settled by the gateway — release the claim so a
                // later check (another webhook delivery) can try again.
                finalStatus = PaymentTransaction.STATUS_PENDING;
                order.setStatus(PaymentOrder.STATUS_PENDING);
            }
            default -> {
                finalStatus = PaymentTransaction.STATUS_FAILED;
                failureReason = gatewayPayment.failureReason();
                order.setStatus(PaymentOrder.STATUS_FAILED);
                notifyPaymentFailed(order, failureReason);
            }
        }

        wonRace.setStatus(finalStatus);
        wonRace.setSubscriptionId(subscriptionId);
        wonRace.setFailureReason(failureReason);
        wonRace.setUpdatedAt(Instant.now());
        PaymentTransaction saved = transactionRepository.save(wonRace);

        order.setUpdatedAt(Instant.now());
        orderRepository.save(order);

        return resultOf(saved, switch (gatewayPayment.status()) {
            case SUCCESS -> "Payment successful";
            case PENDING -> "Payment pending";
            default -> "Payment failed";
        });
    }

    /**
     * Polls briefly for the request currently resolving this payment to
     * finish. The window is a handful of local Mongo round trips — the work
     * being waited on is a single gateway lookup plus one save, not an
     * external call — so this returns almost immediately in practice.
     */
    private Map<String, Object> waitForSettlement(String gatewayPaymentId) {
        for (int attempt = 0; attempt < 40; attempt++) {
            PaymentTransaction current = transactionRepository.findByGatewayPaymentId(gatewayPaymentId).orElse(null);
            if (current != null && isTerminal(current.getStatus())) {
                return resultOf(current, "Already processed");
            }
            try {
                Thread.sleep(25);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
        // Gave up waiting rather than blocking indefinitely — the caller gets
        // whatever the current state is, even if still unsettled.
        PaymentTransaction current = transactionRepository.findByGatewayPaymentId(gatewayPaymentId)
                .orElseThrow(() -> new IllegalStateException("Transaction disappeared while waiting for settlement"));
        return resultOf(current, "Still processing");
    }

    private boolean isTerminal(String status) {
        return PaymentTransaction.STATUS_SUCCESS.equals(status) || PaymentTransaction.STATUS_FAILED.equals(status);
    }

    private Subscription activateSubscription(PaymentOrder order) {
        Vendor vendor = vendorRepository.findById(order.getVendorId())
                .orElseThrow(() -> new IllegalStateException("Vendor no longer exists: " + order.getVendorId()));

        Instant now = Instant.now();
        boolean yearly = Subscription.PERIOD_YEARLY.equals(order.getBillingPeriod());

        // A vendor has at most one ACTIVE subscription at a time. An upgrade
        // supersedes whatever was active rather than leaving two ACTIVE rows
        // around — which would otherwise double-count toward MRR.
        String previousPlanCode = subscriptionService.getActiveSubscription(vendor.getId())
                .map(old -> {
                    old.setStatus(Subscription.STATUS_CANCELLED);
                    old.setCancelledAt(now);
                    old.setUpdatedAt(now);
                    subscriptionRepository.save(old);
                    return old.getPlanCode();
                })
                .orElse(null);

        Subscription subscription = new Subscription();
        subscription.setVendorId(vendor.getId());
        subscription.setVendorSlug(vendor.getSlug());
        subscription.setPlanCode(order.getPlanCode());
        subscription.setPreviousPlanCode(previousPlanCode);
        subscription.setStatus(Subscription.STATUS_ACTIVE);
        // The price actually paid, locked in for this subscription — if an
        // admin later raises the plan's price, this vendor keeps what they
        // paid until the period ends and renewal charges the new rate.
        subscription.setAmountPaidPaise(order.getAmountPaise());
        subscription.setBillingPeriod(order.getBillingPeriod());
        subscription.setCurrentPeriodStart(now);
        subscription.setCurrentPeriodEnd(now.plus(yearly ? 365 : 30, ChronoUnit.DAYS));
        subscription.setCouponCode(order.getCouponCode());
        subscription.setCouponDiscountPaise(order.getCouponDiscountPaise());
        subscription.setSource(Subscription.SOURCE_PURCHASE);
        subscription.setCreatedAt(now);
        subscription.setUpdatedAt(now);
        subscription = subscriptionRepository.save(subscription);

        subscriptionService.syncPlanMirror(vendor);

        Plan plan = planService.getByCode(order.getPlanCode());
        notificationService.notify(vendor.getId(), "SUBSCRIPTION", "You're now on " + plan.getName(),
                "Your payment went through — you're live on the " + plan.getName() + " plan.",
                "/dashboard/vendor/billing");

        log.info("Activated subscription {} for vendor {} on plan {}", subscription.getId(), vendor.getId(), plan.getCode());
        return subscription;
    }

    private void notifyPaymentFailed(PaymentOrder order, String reason) {
        Plan plan = planService.getByCode(order.getPlanCode());
        notificationService.notify(order.getVendorId(), "SUBSCRIPTION", "Payment failed",
                "Your payment for the " + plan.getName() + " plan didn't go through"
                        + (reason != null ? " (" + reason + ")" : "") + ". You're still on your current plan.",
                "/dashboard/vendor/billing");
    }

    private Map<String, Object> resultOf(PaymentTransaction transaction, String message) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", transaction.getStatus());
        result.put("message", message);
        result.put("transactionId", transaction.getId());
        result.put("subscriptionId", transaction.getSubscriptionId());
        return result;
    }

    public Optional<PaymentOrder> findOrder(String orderId) {
        return orderRepository.findById(orderId);
    }
}
