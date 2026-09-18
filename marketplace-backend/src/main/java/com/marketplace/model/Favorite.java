package com.marketplace.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * A customer saving a vendor to their favorites — the real, server-side
 * replacement for what used to live only in the browser's {@code localStorage}.
 * Being server-side is what makes it possible to notify a Premium vendor when
 * it happens, and to keep the list in sync across a customer's devices.
 */
@Data
@Document(collection = "favorites")
@CompoundIndex(name = "customer_vendor_unique", def = "{'customerId': 1, 'vendorId': 1}", unique = true)
public class Favorite {

    @Id
    private String id;

    private String customerId;
    /** Denormalised so the vendor's "recent favorites" feed needs no extra lookup per row. */
    private String customerName;

    private String vendorId;
    private String vendorSlug;

    private Instant createdAt;
}
