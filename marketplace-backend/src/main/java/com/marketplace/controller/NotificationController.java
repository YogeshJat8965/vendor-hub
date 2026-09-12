package com.marketplace.controller;

import com.marketplace.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<?> list(Authentication authentication) {
        return ResponseEntity.ok(notificationService.list(authentication.getName()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> unreadCount(@RequestParam(required = false) String type, Authentication authentication) {
        return ResponseEntity.ok(Map.of("count", notificationService.unreadCount(authentication.getName(), type)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable String id, Authentication authentication) {
        notificationService.markRead(id, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllRead(@RequestParam(required = false) String type, Authentication authentication) {
        notificationService.markAllRead(authentication.getName(), type);
        return ResponseEntity.ok().build();
    }
}
