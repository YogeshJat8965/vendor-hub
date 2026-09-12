package com.marketplace.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * What the admin moderation queue actually needs to see for a flagged
 * review: the review itself, plus which vendor is disputing it (only the
 * reviewed vendor can flag, so "who flagged this" is always that vendor).
 */
@Data
public class FlaggedReviewDto {
    private String id;
    private String vendorSlug;
    private String vendorName;
    private String customerName;
    private String customerEmail;
    private Integer rating;
    private String comment;
    private String flagReason;
    private String flagDetails;
    private LocalDateTime flaggedAt;
    private LocalDateTime createdAt;
}
