package com.marketplace.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory online/offline tracking for chat presence.
 *
 * A user is "online" as long as at least one of their WebSocket sessions
 * (e.g. multiple browser tabs) is connected, so we track session -> user
 * and a per-user open-session count rather than a single boolean per user.
 *
 * This is process-local state: fine for a single backend instance, but it
 * would need a shared store (e.g. Redis) behind a load-balanced deployment
 * with more than one instance.
 */
@Service
public class PresenceService {

    private final Map<String, String> sessionToUser = new ConcurrentHashMap<>();
    private final Map<String, Integer> openSessionsByUser = new ConcurrentHashMap<>();
    private final Map<String, Instant> lastSeenAt = new ConcurrentHashMap<>();

    public record PresenceChange(String userId, boolean online, Instant at) {}

    /**
     * Records a new connected session for the user.
     * @return the change to broadcast, or null if the user was already online.
     */
    public synchronized PresenceChange markOnline(String sessionId, String userId) {
        sessionToUser.put(sessionId, userId);
        int count = openSessionsByUser.merge(userId, 1, Integer::sum);
        if (count == 1) {
            return new PresenceChange(userId, true, Instant.now());
        }
        return null;
    }

    /**
     * Records a session disconnecting.
     * @return the change to broadcast (only once the user's last session closes), or null.
     */
    public synchronized PresenceChange markOffline(String sessionId) {
        String userId = sessionToUser.remove(sessionId);
        if (userId == null) {
            return null;
        }
        int count = openSessionsByUser.merge(userId, -1, Integer::sum);
        if (count <= 0) {
            openSessionsByUser.remove(userId);
            Instant now = Instant.now();
            lastSeenAt.put(userId, now);
            return new PresenceChange(userId, false, now);
        }
        return null;
    }

    public boolean isOnline(String userId) {
        return openSessionsByUser.getOrDefault(userId, 0) > 0;
    }

    public Instant getLastSeenAt(String userId) {
        return lastSeenAt.get(userId);
    }
}
