package com.marketplace.model;

import lombok.Data;
import java.util.List;

@Data
public class CatalogueItem {

    private String id; // Typically generated as UUID string for sub-items

    private String title;

    private String description;

    // "SERVICE" or "PRODUCT". Old items predating this field come back as
    // null from Mongo — treat null as SERVICE everywhere it's read, so
    // existing catalogues keep behaving exactly as before.
    private String itemType;

    private Double startingPrice; // "Starting Price" for a service, plain fixed Price for a product

    private String priceRange; // Service only, e.g. "$1000 - $5000"

    private List<String> images; // 3 for Basic, 7 for Premium

    // Service-only fields
    private String materialsDetails;

    private String projectTimeline;

    // Product-only fields. No real inventory tracking (no auto-decrement on
    // an order) — the vendor sets these manually and edits them as their
    // actual stock changes.
    private String stockStatus; // "IN_STOCK", "OUT_OF_STOCK", "MADE_TO_ORDER"

    private Integer stockQuantity; // optional, only meaningful when stockStatus is IN_STOCK

    // Premium Fields
    private List<String> beforeAfterImages;

    private String videoUrl;

    private String pdfBrochureUrl;
}
