package com.marketplace.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "collaborations")
public class Collaboration {
    @Id
    private String id;
    
    private String postedByVendorSlug;
    
    private String title;
    
    private String description;
    
    private List<String> lookingFor; // Service types
    
    private String projectType;
    
    private String location;
    
    private String budget;
    
    private String status; // OPEN, CLOSED, IN_PROGRESS
    
    private LocalDateTime createdAt;
}
