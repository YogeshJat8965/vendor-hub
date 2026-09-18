package com.marketplace.controller.admin;

import com.marketplace.dto.admin.AdminUserDto;
import com.marketplace.repository.UserRepository;
import com.marketplace.service.AdminPeopleService;
import com.marketplace.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Customer and admin account management. Vendors are a separate collection
 * and are handled by {@link AdminVendorController}.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AdminPeopleService adminPeopleService;

    /**
     * Every account in the {@code users} collection (customers and admins).
     *
     * <p>Mapped through {@link AdminUserDto} rather than returned raw — the
     * {@code User} document carries the bcrypt password hash, which must never
     * reach the browser.
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<AdminUserDto> users = userRepository.findAll().stream()
                .map(AdminUserDto::from)
                .toList();
        return ResponseEntity.ok(users);
    }

    /** One account plus the quotes, reviews and conversations behind it. */
    @GetMapping("/users/{userId}/detail")
    public ResponseEntity<?> getUserDetail(@PathVariable String userId) {
        return adminPeopleService.getUserDetail(userId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/users/{userId}/ban")
    public ResponseEntity<?> banUser(@PathVariable String userId, Authentication authentication) {
        // REST authentication carries the Mongo user id as the principal name
        // (JwtAuthFilter uses extractUserId), so this compares like with like.
        if (authentication != null && userId.equals(authentication.getName())) {
            return ResponseEntity.badRequest().body(Map.of("error", "You cannot ban your own account"));
        }

        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(user -> {
                    if ("ADMIN".equals(user.getRole())) {
                        return ResponseEntity.badRequest().body(Map.of("error", "Admin accounts cannot be banned"));
                    }
                    user.setBanned(true);
                    userRepository.save(user);
                    notificationService.notify(user.getId(), "ACCOUNT", "Account suspended",
                            "Your account has been suspended. Contact support for details.", "/");
                    return ResponseEntity.ok(Map.of("message", "User banned"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/users/{userId}/unban")
    public ResponseEntity<?> unbanUser(@PathVariable String userId) {
        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(user -> {
                    user.setBanned(false);
                    userRepository.save(user);
                    notificationService.notify(user.getId(), "ACCOUNT", "Account restored",
                            "Your account has been restored. Welcome back.", "/");
                    return ResponseEntity.ok(Map.of("message", "User unbanned"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
