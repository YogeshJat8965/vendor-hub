package com.marketplace.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Data
@Document(collection = "categories")
public class Category {
    @Id
    private String id;
    
    private String name;
    
    private String slug;
    
    private String description;
    
    private String icon;
    
    private Integer displayOrder;
    
    private Boolean visible;
    
    private Instant createdAt;
    
    private Instant updatedAt;
}
