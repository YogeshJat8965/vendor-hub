package com.marketplace.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "page_views")
public class PageView {
    @Id
    private String id;
    
    private String vendorSlug;
    
    private String ipAddress;
    
    private String userAgent;
    
    private String referrer;
    
    private String city;
    
    private LocalDateTime viewedAt;
}
