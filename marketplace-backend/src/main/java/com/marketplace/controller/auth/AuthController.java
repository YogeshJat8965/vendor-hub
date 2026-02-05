package com.marketplace.controller.auth;

import com.marketplace.dto.auth.LoginDto;
import com.marketplace.dto.auth.SignupDto;
import com.marketplace.dto.auth.VendorRegistrationDto;
import com.marketplace.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/signup")
    public ResponseEntity<?> customerSignup(@Valid @RequestBody SignupDto dto) {
        try {
            String token = authService.customerSignup(dto);
            return ResponseEntity.ok(Map.of("token", token, "message", "Signup successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/vendor/signup")
    public ResponseEntity<?> vendorSignup(@Valid @RequestBody VendorRegistrationDto dto) {
        try {
            String token = authService.vendorSignup(dto);
            return ResponseEntity.ok(Map.of("token", token, "message", "Vendor registration successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDto dto) {
        try {
            String token = authService.login(dto);
            return ResponseEntity.ok(Map.of("token", token, "message", "Login successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
