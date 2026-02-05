package com.marketplace.dto.auth;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Data
public class VendorRegistrationDto {
    @NotBlank
    private String storeName;
    
    @NotBlank
    private String businessName;
    
    @Email
    @NotBlank
    private String email;
    
    @NotBlank
    private String password;
    
    @NotBlank
    private String vendorType;
    
    private String mobile;
    
    private String city;
    
    private String pincode;
    
    private boolean consentConfirmed;
}
