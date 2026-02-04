package com.marketplace.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;
    
    private String userId;
    
    private String type; // QUOTE, REVIEW, COLLABORATION, SYSTEM
    
    private String title;
    
    private String message;
    
    private String link;
    
    private boolean read;
    
    private LocalDateTime createdAt;
}
