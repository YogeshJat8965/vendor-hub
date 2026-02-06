package com.marketplace.config;

import com.marketplace.model.User;
import com.marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    
    @Override
    public void run(String... args) {
        // Create admin user if not exists
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        
        if (!userRepository.existsByEmail("admin@vendorhub.com")) {
            User admin = new User();
            admin.setName("Admin");
            admin.setEmail("admin@vendorhub.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("ADMIN");
            admin.setConsentConfirmed(true);
            admin.setCreatedAt(Instant.now());
            admin.setUpdatedAt(Instant.now());
            
            userRepository.save(admin);
            System.out.println("============================================");
            System.out.println("✅ Admin user created successfully!");
            System.out.println("   Email: admin@vendorhub.com");
            System.out.println("   Password: admin123");
            System.out.println("============================================");
        } else {
            System.out.println("ℹ️  Admin user already exists: admin@vendorhub.com");
        }
    }
}
