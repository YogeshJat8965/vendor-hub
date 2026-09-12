package com.marketplace.config;

import com.marketplace.service.PresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

/**
 * Bridges STOMP session lifecycle to chat presence: marks a user online when
 * their first WebSocket session connects, offline when their last one
 * disconnects, and broadcasts each transition to /topic/presence so open
 * inboxes update in real time.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PresenceEventListener {

    private final PresenceService presenceService;
    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleSessionConnected(SessionConnectedEvent event) {
        Principal user = event.getUser();
        String sessionId = SimpMessageHeaderAccessor.wrap(event.getMessage()).getSessionId();
        if (user == null || sessionId == null) {
            return;
        }

        PresenceService.PresenceChange change = presenceService.markOnline(sessionId, user.getName());
        if (change != null) {
            broadcast(change);
            log.info("User {} is now online", user.getName());
        }
    }

    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        if (sessionId == null) {
            return;
        }

        PresenceService.PresenceChange change = presenceService.markOffline(sessionId);
        if (change != null) {
            broadcast(change);
            log.info("User {} is now offline", change.userId());
        }
    }

    private void broadcast(PresenceService.PresenceChange change) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("userId", change.userId());
        payload.put("status", change.online() ? "ONLINE" : "OFFLINE");
        payload.put("lastSeenAt", change.at().toString());
        messagingTemplate.convertAndSend("/topic/presence", payload);
    }
}
