package com.marketplace.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;

@Data
@Document(collection = "subscriptions")
public class Subscription {
    @Id
    private String id;
    
    private String vendorId;
    private String vendorSlug;
    
    private String plan; // BASIC, PREMIUM
    
    private Double price;
    
    private LocalDate startDate;
    
    private LocalDate endDate;
    
    private String status; // ACTIVE, EXPIRED, CANCELLED
    
    private boolean autoRenew;
}
