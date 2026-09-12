package com.marketplace.service;

import com.marketplace.model.Notification;
import com.marketplace.model.User;
import com.marketplace.model.vendor.Vendor;
import com.marketplace.repository.NotificationRepository;
import com.marketplace.repository.UserRepository;
import com.marketplace.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Central entry point for creating notifications. Every trigger point in the
 * app (new quote, new message, new review, etc.) calls {@link #notify} or
 * {@link #notifyAdmins} instead of writing to NotificationRepository
 * directly, so storage + real-time delivery always stay in sync.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * @param recipientUserId the Mongo _id of the User or Vendor document to
     *                        notify (the same id used everywhere else in the
     *                        REST layer) — NOT an email.
     */
    public Notification notify(String recipientUserId, String type, String title, String message, String link) {
        if (recipientUserId == null) {
            return null;
        }
        Notification notification = new Notification();
        notification.setUserId(recipientUserId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setLink(link);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        Notification saved = notificationRepository.save(notification);
        pushRealtime(recipientUserId, saved);
        return saved;
    }

    public void notifyAdmins(String type, String title, String message, String link) {
        List<User> admins = userRepository.findByRole("ADMIN");
        for (User admin : admins) {
            notify(admin.getId(), type, title, message, link);
        }
    }

    /**
     * The live WebSocket session is authenticated by email (see
     * WebSocketAuthInterceptor), while everything else in the app identifies
     * users by their Mongo _id — so the recipient's email has to be resolved
     * here purely to route the push. Failing to resolve it just means no
     * real-time push (the notification is still saved and shows up on next
     * fetch), so this never blocks notification creation.
     */
    private void pushRealtime(String recipientUserId, Notification notification) {
        try {
            String email = userRepository.findById(recipientUserId).map(User::getEmail)
                    .or(() -> vendorRepository.findById(recipientUserId).map(Vendor::getEmail))
                    .orElse(null);
            if (email != null) {
                messagingTemplate.convertAndSendToUser(email, "/queue/notifications", notification);
            }
        } catch (Exception e) {
            log.warn("Failed to push real-time notification to {}: {}", recipientUserId, e.getMessage());
        }
    }

    public List<Notification> list(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .limit(30)
                .toList();
    }

    public long unreadCount(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public long unreadCount(String userId, String type) {
        return type == null
                ? unreadCount(userId)
                : notificationRepository.countByUserIdAndTypeAndReadFalse(userId, type);
    }

    public void markRead(String notificationId, String userId) {
        notificationRepository.findById(notificationId)
                .filter(n -> n.getUserId().equals(userId))
                .ifPresent(n -> {
                    n.setRead(true);
                    notificationRepository.save(n);
                });
    }

    public void markAllRead(String userId) {
        notificationRepository.findByUserIdAndReadFalse(userId)
                .forEach(n -> {
                    n.setRead(true);
                    notificationRepository.save(n);
                });
    }

    public void markAllRead(String userId, String type) {
        if (type == null) {
            markAllRead(userId);
            return;
        }
        notificationRepository.findByUserIdAndTypeAndReadFalse(userId, type)
                .forEach(n -> {
                    n.setRead(true);
                    notificationRepository.save(n);
                });
    }
}
