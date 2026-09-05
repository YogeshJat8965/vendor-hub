package com.marketplace.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Data
@Document(collection = "conversations")
public class Conversation {
    
    @Id
    private String id;
    
    private String quoteRequestId; // Link to the QuoteRequest
    
    private String customerId;
    
    private String vendorId;
    
    private String lastMessage;
    
    private Instant lastMessageTime;
    
    private Instant createdAt;
    
    private Instant updatedAt;
}
