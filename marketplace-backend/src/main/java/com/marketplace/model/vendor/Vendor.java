package com.marketplace.model.vendor;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.List;

@Data
@Document(collection = "vendors")
@CompoundIndexes({
    @CompoundIndex(name = "slug_idx", def = "{'slug':1}", unique = true),
    @CompoundIndex(name = "geo_idx", def = "{'location':'2dsphere'}")
})
public class Vendor {
    @Id
    private String id;
    
    @NotBlank
    @Indexed(unique = true)
    private String slug;
    
    @NotBlank
    @Indexed(unique = true)
    private String storeName;
    
    private String businessName;
    
    private String ownerName;
    
    @Email
    @Indexed(unique = true)
    private String email;
    
    private String passwordHash;
    
    private String mobile;
    
    @NotBlank
    private String vendorType; // Carpenter, Painter, etc.
    
    private String category;
    
    private String city;
    
    private String pincode;
    
    private GeoJsonPoint location; // For geospatial queries
    
    private String status; // PENDING, ACTIVE, REJECTED, SUSPENDED

    // Why the account was rejected or suspended. Collected by the admin panel
    // and shown back to the vendor, so the decision isn't a silent one.
    private String rejectionReason;

    private String logoUrl;
    
    private String bannerUrl;
    
    private String qrUrl;
    
    private String themeColor;
    
    private Double rating;
    
    private Integer reviewCount;
    
    private String subscriptionPlan; // BASIC, PREMIUM
    
    private boolean certified;
    
    private boolean promoted;
    
    private Instant promotedUntil;
    
    private String oauth2Provider; // EMAIL, GOOGLE
    
    private String role; // VENDOR
    
    // Additional profile fields
    private String description;
    
    private String longDescription;
    
    private String phone;
    
    private String website;
    
    private String address;
    
    private String state;
    
    private String zipCode;
    
    private Integer yearsInBusiness;
    
    private List<String> services;
    
    private List<String> gallery;

    // Extra storefront contact options — writable only while the vendor's
    // plan has allowsExtraCta (enforced in VendorService.updateVendorByEmail),
    // and stripped from every public read when it doesn't, so a downgrade
    // hides them immediately without deleting the vendor's own data.
    private String whatsappNumber;
    private String callNumber;
    private String customCtaLabel;
    private String customCtaUrl;

    /**
     * Set per-request from the vendor's resolved plan, never persisted —
     * mirrors how {@code Catalogue.locked} is computed fresh on every read
     * rather than stored, so it can never go stale in the database.
     */
    @org.springframework.data.annotation.Transient
    private boolean featuredBadge;

    @org.springframework.data.annotation.Transient
    private boolean priorityVisibility;

    private Instant createdAt;

    private Instant updatedAt;
}
