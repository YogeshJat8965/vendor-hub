package com.marketplace.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.stereotype.Component;

/**
 * Creates the one index payment idempotency actually depends on:
 * {@code payment_transactions.gatewayPaymentId}, unique.
 *
 * <p>This app does not enable Spring Data's global
 * {@code auto-index-creation} — the {@code vendors} collection already
 * carries hand-named indexes (e.g. {@code slug_idx}) that predate this
 * codebase's {@code @Indexed} annotations, and the global flag crashes
 * startup the moment it tries to create a second index on the same key under
 * a different auto-generated name. Creating just this one index directly,
 * against a brand-new collection with no pre-existing index to collide with,
 * gets the real guarantee ({@link PaymentService#verifyAndActivate}'s claim
 * that a payment can only ever be processed once) without that risk.
 */
@Slf4j
@Component
@Order(3)
@RequiredArgsConstructor
public class PaymentIndexInitializer implements CommandLineRunner {

    private final MongoTemplate mongoTemplate;

    @Override
    public void run(String... args) {
        mongoTemplate.indexOps("payment_transactions")
                .ensureIndex(new Index().on("gatewayPaymentId", org.springframework.data.domain.Sort.Direction.ASC)
                        .unique()
                        .named("gatewayPaymentId_unique"));
        log.info("Ensured unique index on payment_transactions.gatewayPaymentId");
    }
}
