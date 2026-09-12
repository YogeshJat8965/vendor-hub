package com.marketplace.dto;

import lombok.Data;
import java.time.Instant;

@Data
public class ConversationDTO {
    private String id;
    private String quoteRequestId;
    private String customerId;
    private String vendorId;
    private String customerName;
    private String vendorName;
    private String vendorStoreName;
    private String lastMessage;
    private Instant lastMessageTime;
    private Instant createdAt;
    private Instant updatedAt;
    private long unreadCount;
}
