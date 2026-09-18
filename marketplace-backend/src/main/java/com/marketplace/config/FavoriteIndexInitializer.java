package com.marketplace.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.stereotype.Component;

/**
 * Creates the compound unique index {@code favorites.(customerId, vendorId)}
 * directly, the same scoped approach {@link PaymentIndexInitializer} uses —
 * this app does not enable Spring Data's global {@code auto-index-creation}
 * (see that class's Javadoc for why), so a brand-new collection like this one
 * gets its one load-bearing index created explicitly instead. Without it, a
 * double-click on "favorite" could race two inserts into the same
 * (customer, vendor) pair.
 */
@Slf4j
@Component
@Order(5)
@RequiredArgsConstructor
public class FavoriteIndexInitializer implements CommandLineRunner {

    private final MongoTemplate mongoTemplate;

    @Override
    public void run(String... args) {
        Index index = new Index()
                .on("customerId", Sort.Direction.ASC)
                .on("vendorId", Sort.Direction.ASC)
                .unique()
                .named("customer_vendor_unique");
        mongoTemplate.indexOps("favorites").ensureIndex(index);
        log.info("Ensured unique compound index on favorites.(customerId, vendorId)");
    }
}
