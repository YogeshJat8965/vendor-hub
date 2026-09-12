package com.marketplace.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "quote_requests")
public class QuoteRequest {
    @Id
    private String id;
    
    private String vendorSlug;
    
    private String customerName;
    
    private String customerEmail;
    
    private String customerMobile;
    
    private String serviceRequested;
    
    private String catalogueId; // Optional: Link to a specific catalogue
    
    private String catalogueItemId; // Optional: Link to a specific item inside the catalogue
    
    private String projectDescription;
    
    private Double budget;
    
    private LocalDateTime preferredDate;
    
    private String status; // NEW, IN_PROGRESS, QUOTED, ACCEPTED, DELIVERED, DISPUTED, COMPLETED, REJECTED, CLOSED

    private String vendorResponse;

    private Double estimatedCost;

    private String estimatedTime;

    // Set when the vendor marks the job DELIVERED. Used both to show the
    // customer when delivery happened and to drive the 7-day auto-complete
    // safety net if the customer never confirms. A DISPUTED quote moves out
    // of DELIVERED entirely, so it's naturally excluded from that safety net
    // without any extra scheduler logic.
    private LocalDateTime deliveredAt;

    private LocalDateTime completedAt;

    // The customer's explanation when they raise a delivery dispute instead
    // of confirming completion — shown to admin for resolution.
    private String disputeReason;

    private LocalDateTime disputedAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
