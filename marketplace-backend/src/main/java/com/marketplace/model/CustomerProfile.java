package com.marketplace.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "customer_profiles")
public class CustomerProfile {
    @Id
    private String id;
    
    private String userId;
    private String email;
    
    private String fullName;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String photoUrl;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
