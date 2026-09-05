package com.marketplace.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Data
@Document(collection = "messages")
public class Message {
    
    @Id
    private String id;
    
    private String conversationId;
    
    private String senderId;
    
    private String senderRole; // CUSTOMER or VENDOR
    
    private String content; // Text or URL depending on type
    
    private String type; // TEXT, IMAGE, PDF
    
    private boolean read;
    
    private Instant timestamp;
}
