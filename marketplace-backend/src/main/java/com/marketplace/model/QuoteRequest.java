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
    
    private String projectDescription;
    
    private Double budget;
    
    private LocalDateTime preferredDate;
    
    private String status; // NEW, IN_PROGRESS, QUOTED, ACCEPTED, REJECTED, CLOSED
    
    private String vendorResponse;
    
    private Double estimatedCost;
    
    private String estimatedTime;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
