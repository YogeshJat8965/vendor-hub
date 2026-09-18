package com.marketplace.dto.admin;

import com.marketplace.model.Category;
import lombok.Data;

import java.time.Instant;

/**
 * A category as the admin sees it, including how many vendors actually sit
 * under it.
 *
 * <p>{@code vendorCount} was declared in the admin UI long before anything
 * computed it. It is now a real figure — and on current data it is 0 for every
 * category, because no vendor references a category at all: vendors carry a
 * free-text {@code vendorType} ("Carpenter", "Plumber") that does not match
 * any category name ("Carpentry", "Plumbing"), and {@code Vendor.category} is
 * null on every record. The admin page surfaces that mismatch rather than
 * hiding it behind a fuzzy match that would invent a link the data doesn't have.
 */
@Data
public class AdminCategoryDto {
    private String id;
    private String name;
    private String slug;
    private String description;
    private String icon;
    private Integer displayOrder;
    private Boolean visible;
    private Instant createdAt;
    private Instant updatedAt;
    /** Vendors whose vendorType or category matches this category's name or slug. */
    private long vendorCount;

    public static AdminCategoryDto from(Category category, long vendorCount) {
        AdminCategoryDto dto = new AdminCategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setSlug(category.getSlug());
        dto.setDescription(category.getDescription());
        dto.setIcon(category.getIcon());
        dto.setDisplayOrder(category.getDisplayOrder());
        dto.setVisible(category.getVisible());
        dto.setCreatedAt(category.getCreatedAt());
        dto.setUpdatedAt(category.getUpdatedAt());
        dto.setVendorCount(vendorCount);
        return dto;
    }
}
