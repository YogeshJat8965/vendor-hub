package com.marketplace.dto.admin;

import com.marketplace.model.vendor.Vendor;
import lombok.Data;

import java.time.Instant;

/**
 * A vendor as the admin panel sees them.
 *
 * <p>Like {@link AdminUserDto}, this exists to keep the credential field —
 * {@code passwordHash} — out of the response. It also exposes a single
 * {@code displayName}, since a vendor's usable name is spread across
 * {@code businessName}, {@code storeName} and {@code email} and every admin
 * screen was re-deriving it.
 */
@Data
public class AdminVendorDto {
    private String id;
    private String slug;
    private String displayName;
    private String storeName;
    private String businessName;
    private String ownerName;
    private String email;
    private String mobile;
    private String phone;
    private String vendorType;
    private String category;
    private String city;
    private String state;
    private String pincode;
    /** PENDING, ACTIVE, REJECTED or SUSPENDED. */
    private String status;
    private String logoUrl;
    private Double rating;
    private Integer reviewCount;
    private String subscriptionPlan;
    private boolean certified;
    private boolean promoted;
    private Integer yearsInBusiness;
    private String rejectionReason;
    private Instant createdAt;
    private Instant updatedAt;

    public static AdminVendorDto from(Vendor vendor) {
        AdminVendorDto dto = new AdminVendorDto();
        dto.setId(vendor.getId());
        dto.setSlug(vendor.getSlug());
        dto.setDisplayName(displayNameOf(vendor));
        dto.setStoreName(vendor.getStoreName());
        dto.setBusinessName(vendor.getBusinessName());
        dto.setOwnerName(vendor.getOwnerName());
        dto.setEmail(vendor.getEmail());
        dto.setMobile(vendor.getMobile());
        dto.setPhone(vendor.getPhone());
        dto.setVendorType(vendor.getVendorType());
        dto.setCategory(vendor.getCategory());
        dto.setCity(vendor.getCity());
        dto.setState(vendor.getState());
        dto.setPincode(vendor.getPincode());
        dto.setStatus(vendor.getStatus());
        dto.setLogoUrl(vendor.getLogoUrl());
        dto.setRating(vendor.getRating());
        dto.setReviewCount(vendor.getReviewCount());
        dto.setSubscriptionPlan(vendor.getSubscriptionPlan());
        dto.setCertified(vendor.isCertified());
        dto.setPromoted(vendor.isPromoted());
        dto.setYearsInBusiness(vendor.getYearsInBusiness());
        dto.setRejectionReason(vendor.getRejectionReason());
        dto.setCreatedAt(vendor.getCreatedAt());
        dto.setUpdatedAt(vendor.getUpdatedAt());
        return dto;
    }

    /** First non-blank of business name, store name, owner name, then email. */
    private static String displayNameOf(Vendor vendor) {
        if (isNotBlank(vendor.getBusinessName())) return vendor.getBusinessName();
        if (isNotBlank(vendor.getStoreName())) return vendor.getStoreName();
        if (isNotBlank(vendor.getOwnerName())) return vendor.getOwnerName();
        return vendor.getEmail();
    }

    private static boolean isNotBlank(String value) {
        return value != null && !value.isBlank();
    }
}
