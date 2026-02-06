package com.marketplace.service;

import com.marketplace.dto.auth.LoginDto;
import com.marketplace.dto.auth.SignupDto;
import com.marketplace.dto.auth.VendorRegistrationDto;
import com.marketplace.model.User;
import com.marketplace.model.vendor.Vendor;
import com.marketplace.repository.UserRepository;
import com.marketplace.repository.VendorRepository;
import com.marketplace.util.SlugGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    public String customerSignup(SignupDto dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already in use");
        }
        
        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole("CUSTOMER");
        user.setConsentConfirmed(dto.isConsentConfirmed());
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());
        
        User saved = userRepository.save(user);
        return jwtService.generateToken(saved.getId(), saved.getEmail(), saved.getRole());
    }
    
    public String vendorSignup(VendorRegistrationDto dto) {
        if (vendorRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already in use");
        }
        
        String slug = SlugGenerator.generateSlug(dto.getStoreName());
        if (vendorRepository.existsBySlug(slug)) {
            throw new RuntimeException("Store name already taken");
        }
        
        Vendor vendor = new Vendor();
        vendor.setSlug(slug);
        vendor.setStoreName(dto.getStoreName());
        vendor.setBusinessName(dto.getBusinessName());
        vendor.setEmail(dto.getEmail());
        vendor.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        vendor.setVendorType(dto.getVendorType());
        vendor.setMobile(dto.getMobile());
        vendor.setCity(dto.getCity());
        vendor.setPincode(dto.getPincode());
        vendor.setRole("VENDOR");
        vendor.setStatus("ACTIVE");
        vendor.setSubscriptionPlan("BASIC");
        vendor.setOauth2Provider("EMAIL");
        vendor.setCreatedAt(Instant.now());
        vendor.setUpdatedAt(Instant.now());
        
        Vendor saved = vendorRepository.save(vendor);
        return jwtService.generateToken(saved.getId(), saved.getEmail(), saved.getRole());
    }
    
    public String login(LoginDto dto) {
        // Try user login
        Optional<User> user = userRepository.findByEmail(dto.getEmail());
        if (user.isPresent()) {
            if (passwordEncoder.matches(dto.getPassword(), user.get().getPassword())) {
                return jwtService.generateToken(user.get().getId(), user.get().getEmail(), user.get().getRole());
            }
        }
        
        // Try vendor login
        Optional<Vendor> vendor = vendorRepository.findByEmail(dto.getEmail());
        if (vendor.isPresent()) {
            if (passwordEncoder.matches(dto.getPassword(), vendor.get().getPasswordHash())) {
                return jwtService.generateToken(vendor.get().getId(), vendor.get().getEmail(), vendor.get().getRole());
            }
        }
        
        throw new RuntimeException("Invalid credentials");
    }
    
    public void changePassword(String email, String currentPassword, String newPassword) {
        // Try user first
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            if (!passwordEncoder.matches(currentPassword, user.get().getPassword())) {
                throw new RuntimeException("Current password is incorrect");
            }
            user.get().setPassword(passwordEncoder.encode(newPassword));
            user.get().setUpdatedAt(Instant.now());
            userRepository.save(user.get());
            return;
        }
        
        // Try vendor
        Optional<Vendor> vendor = vendorRepository.findByEmail(email);
        if (vendor.isPresent()) {
            if (!passwordEncoder.matches(currentPassword, vendor.get().getPasswordHash())) {
                throw new RuntimeException("Current password is incorrect");
            }
            vendor.get().setPasswordHash(passwordEncoder.encode(newPassword));
            vendor.get().setUpdatedAt(Instant.now());
            vendorRepository.save(vendor.get());
            return;
        }
        
        throw new RuntimeException("User not found");
    }
}
