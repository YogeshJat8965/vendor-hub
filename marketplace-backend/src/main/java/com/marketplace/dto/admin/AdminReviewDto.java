package com.marketplace.dto.admin;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * A review as the admin moderation page sees it: the review itself, which
 * vendor it belongs to, and — when it traces back to one — the quote that
 * made the reviewer eligible to write it.
 *
 * <p>Supersedes {@link com.marketplace.dto.FlaggedReviewDto} for admin use.
 * That DTO only ever carried flagged reviews; this one is used for every
 * review the admin page shows, flagged or not, since the queue now covers
 * the full catalogue rather than only what a vendor happened to flag.
 */
@Data
public class AdminReviewDto {
    private String id;
    private String vendorSlug;
    private String vendorName;
    private String customerName;
    private String customerEmail;
    private Integer rating;
    private String comment;
    private List<String> images;
    private boolean verifiedPurchase;
    private boolean flagged;
    private String flagReason;
    private String flagDetails;
    private LocalDateTime flaggedAt;
    private LocalDateTime createdAt;
    private String quoteRequestId;
    /** Null when the review carries no quote id, or that quote no longer exists. */
    private LinkedQuote linkedQuote;

    @Data
    public static class LinkedQuote {
        private String id;
        private String service;
        private String status;
    }
}
