package com.marketplace.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "catalogues")
public class Catalogue {
    
    @Id
    private String id;
    
    private String vendorId;
    
    private String name;
    
    private String type; // BASIC or PREMIUM
    
    private String description;
    
    private String coverImage;
    
    private List<CatalogueItem> items = new ArrayList<>();

    private Instant createdAt;

    private Instant updatedAt;

    /**
     * Whether the owning vendor's current plan still allows this catalogue to
     * be shown publicly. Computed per request and never stored — a downgrade
     * hides content, it does not alter it, so persisting this would turn a
     * reversible state into a permanent one.
     */
    @org.springframework.data.annotation.Transient
    private boolean locked;
}
