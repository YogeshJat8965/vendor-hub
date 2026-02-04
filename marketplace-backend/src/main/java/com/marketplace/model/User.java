package com.marketplace.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;
    
    @NotBlank
    private String name;
    
    @Email
    @Indexed(unique = true)
    private String email;
    
    private String password;
    
    private String googleId;
    
    @NotBlank
    private String role; // CUSTOMER, VENDOR, ADMIN
    
    private String imageUrl;
    
    private boolean consentConfirmed;
    
    private Instant createdAt;
    
    private Instant updatedAt;
}
