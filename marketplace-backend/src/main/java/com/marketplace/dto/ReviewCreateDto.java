package com.marketplace.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class ReviewCreateDto {
    @NotBlank
    private String vendorSlug;

    // Optional: which specific completed engagement this review is for.
    // Omitted when reviewing generically from the vendor's public profile
    // (no particular quote in context) — the service then picks the latest
    // completed quote with this vendor that doesn't already have a review.
    private String quoteId;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;

    @NotBlank
    @Size(min = 10, max = 2000, message = "Review must be at least 10 characters")
    private String comment;

    private List<String> images;
}
