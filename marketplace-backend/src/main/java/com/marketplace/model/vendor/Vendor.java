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
    
    private String status; // ACTIVE, INACTIVE, SUSPENDED
    
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
    
    private Instant createdAt;
    
    private Instant updatedAt;
}
