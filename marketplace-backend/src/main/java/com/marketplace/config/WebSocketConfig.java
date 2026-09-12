package com.marketplace.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Slf4j
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketAuthInterceptor webSocketAuthInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Only "/topic" and "/queue" are real broker-managed destinations.
        // "/user" must NOT also be registered here: it's exclusively the
        // user-destination prefix below, resolved by UserDestinationMessageHandler
        // into a per-session "/queue/..." destination before the broker ever
        // sees it. Registering "/user" as a broker prefix too (as this was)
        // makes the broker's subscription registry treat the untranslated
        // "/user/..." destination as its own literal entry, which silently
        // breaks convertAndSendToUser() delivery — the translated SEND never
        // matches any subscriber even though the SUBSCRIBE for the same
        // destination string was registered correctly.
        config.enableSimpleBroker("/topic", "/queue");

        // Prefix for messages that are bound for methods annotated with @MessageMapping
        config.setApplicationDestinationPrefixes("/app");

        // Use this for routing messages to specific users
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // The endpoint that clients will use to connect to our websocket server
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Allow all origins for the websocket connection
                .withSockJS(); // Enable SockJS fallback options
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // Add our interceptor to authenticate incoming WebSocket connections
        registration.interceptors(webSocketAuthInterceptor);
    }
}
