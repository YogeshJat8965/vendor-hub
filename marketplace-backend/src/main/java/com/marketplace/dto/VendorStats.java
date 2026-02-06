package com.marketplace.dto;

import lombok.Data;

@Data
public class VendorStats {
    private long totalViews;
    private long quoteRequests;
    private long pendingQuotes;
    private long acceptedQuotes;
    private long completedQuotes;
    private Double averageRating;
    private long totalReviews;
}
