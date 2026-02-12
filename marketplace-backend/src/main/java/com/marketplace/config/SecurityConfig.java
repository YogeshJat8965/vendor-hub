package com.marketplace.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthFilter jwtAuthFilter;
    
    @Value("${cors.allowed-origins}")
    private String allowedOrigins;
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Allow all OPTIONS requests (CORS preflight)
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/explore/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/vendors/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/quotes", "/api/quotes/request").permitAll()
                .requestMatchers("/api/quotes/customer/**").authenticated()
                .requestMatchers("/api/quotes/vendor/**").authenticated()
                .requestMatchers("/api/customer/**").authenticated()
                .requestMatchers("/api/vendor/upload/**").hasRole("VENDOR")
                .requestMatchers("/api/customer/upload/**").authenticated()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/vendor/**").hasRole("VENDOR")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Read allowed origins from environment variable and trim whitespace
        String[] originArray = allowedOrigins.split(",");
        List<String> origins = new java.util.ArrayList<>();
        for (String origin : originArray) {
            String trimmed = origin.trim();
            if (!trimmed.isEmpty()) {
                origins.add(trimmed);
            }
        }
        
        // DEBUG: Log what origins we're using
        System.out.println("=== CORS Configuration ===");
        System.out.println("Raw ALLOWED_ORIGINS: [" + allowedOrigins + "]");
        System.out.println("Trimmed origins: " + origins);
        System.out.println("========================");
        
        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
