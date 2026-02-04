package com.marketplace.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "reviews")
public class Review {
    @Id
    private String id;
    
    private String vendorSlug;
    
    private String customerName;
    
    private String customerEmail;
    
    private Integer rating; // 1-5
    
    private String comment;
    
    private List<String> images;
    
    private boolean flagged;
    
    private String flagReason;
    
    private boolean verifiedPurchase;
    
    private LocalDateTime createdAt;
}
