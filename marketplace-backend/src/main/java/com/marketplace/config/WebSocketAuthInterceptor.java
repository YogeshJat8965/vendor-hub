package com.marketplace.config;

import com.marketplace.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            // Get the JWT token from the "Authorization" header sent in the STOMP CONNECT frame
            List<String> authorization = accessor.getNativeHeader("Authorization");
            
            if (authorization != null && !authorization.isEmpty()) {
                String authHeader = authorization.get(0);
                if (authHeader.startsWith("Bearer ")) {
                    String token = authHeader.substring(7);
                    
                    try {
                        String userEmail = jwtService.extractEmail(token);
                        
                        if (userEmail != null && jwtService.isTokenValid(token)) {
                            // Extract role for authorities
                            String role = jwtService.extractRole(token);
                            List<GrantedAuthority> authorities = new ArrayList<>();
                            if (role != null) {
                                authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
                            }
                            
                            // Set authentication in the accessor so STOMP knows who this user is
                            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                    userEmail, null, authorities);
                            
                            accessor.setUser(auth);
                            log.info("WebSocket connected successfully for user: {}", userEmail);
                        } else {
                            log.error("Invalid JWT token for WebSocket connection");
                        }
                    } catch (Exception e) {
                        log.error("WebSocket auth error: {}", e.getMessage());
                    }
                }
            } else {
                log.warn("No Authorization header found in WebSocket CONNECT frame");
            }
        }
        
        return message;
    }
}
