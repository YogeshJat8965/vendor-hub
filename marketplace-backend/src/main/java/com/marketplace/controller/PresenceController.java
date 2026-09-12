package com.marketplace.controller;

import com.marketplace.service.PresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Initial-snapshot presence lookup, used to render correct online/offline
 * state before any /topic/presence WebSocket event has arrived for a user
 * this session hasn't seen change yet.
 */
@RestController
@RequestMapping("/api/presence")
@RequiredArgsConstructor
public class PresenceController {

    private final PresenceService presenceService;

    @GetMapping
    public ResponseEntity<?> getPresence(@RequestParam String userIds) {
        Map<String, Object> result = new LinkedHashMap<>();

        for (String userId : userIds.split(",")) {
            String id = userId.trim();
            if (id.isEmpty()) {
                continue;
            }
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("online", presenceService.isOnline(id));
            Instant lastSeen = presenceService.getLastSeenAt(id);
            entry.put("lastSeenAt", lastSeen != null ? lastSeen.toString() : null);
            result.put(id, entry);
        }

        return ResponseEntity.ok(result);
    }
}
