package com.marketplace.dto.auth;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
public class SignupDto {
    @NotBlank
    private String name;
    
    @Email
    @NotBlank
    private String email;
    
    @NotBlank
    @Size(min = 8)
    private String password;
    
    private boolean consentConfirmed;
}
