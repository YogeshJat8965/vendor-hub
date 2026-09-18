package com.marketplace.dto.admin;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * A quote as the admin deliveries page sees it: the raw {@code QuoteRequest}
 * plus the vendor's display name (the model only stores {@code vendorSlug})
 * and, for a quote sitting in DELIVERED, the moment it will auto-complete if
 * the customer never confirms.
 */
@Data
public class AdminQuoteDto {
    private String id;
    private String vendorSlug;
    private String vendorName;
    private String customerName;
    private String customerEmail;
    private String customerMobile;
    private String serviceRequested;
    private String projectDescription;
    private Double budget;
    private LocalDateTime preferredDate;
    private String status;
    private String vendorResponse;
    private Double estimatedCost;
    private String estimatedTime;
    private LocalDateTime deliveredAt;
    private LocalDateTime completedAt;
    private String disputeReason;
    private LocalDateTime disputedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    /** Only set while status is DELIVERED: deliveredAt + the auto-complete window. */
    private LocalDateTime autoCompleteAt;
    /** Id of the conversation this quote started, when one exists. */
    private String conversationId;
}
