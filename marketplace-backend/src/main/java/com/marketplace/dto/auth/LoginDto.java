package com.marketplace.dto.auth;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Data
public class LoginDto {
    @Email
    @NotBlank
    private String email;
    
    @NotBlank
    private String password;
}
