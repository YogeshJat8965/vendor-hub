package com.marketplace.controller.customer;

import com.marketplace.model.CustomerProfile;
import com.marketplace.repository.CustomerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerProfileRepository customerProfileRepository;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestParam String email) {
        CustomerProfile profile = customerProfileRepository.findByEmail(email)
                .orElse(new CustomerProfile());
        
        // If profile doesn't exist, return empty profile with email
        if (profile.getId() == null) {
            profile.setEmail(email);
        }
        
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody CustomerProfile updates) {
        try {
            String email = updates.getEmail();
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }
            
            CustomerProfile profile = customerProfileRepository.findByEmail(email)
                    .orElse(new CustomerProfile());

            // Update fields
            profile.setEmail(email);
            profile.setFullName(updates.getFullName());
            profile.setPhone(updates.getPhone());
            profile.setAddress(updates.getAddress());
            profile.setCity(updates.getCity());
            profile.setState(updates.getState());
            profile.setZipCode(updates.getZipCode());
            profile.setPhotoUrl(updates.getPhotoUrl());
            
            if (profile.getId() == null) {
                profile.setCreatedAt(LocalDateTime.now());
            }
            profile.setUpdatedAt(LocalDateTime.now());

            CustomerProfile saved = customerProfileRepository.save(profile);
            return ResponseEntity.ok(Map.of("profile", saved, "message", "Profile updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
