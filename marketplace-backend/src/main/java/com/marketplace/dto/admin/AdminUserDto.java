package com.marketplace.dto.admin;

import com.marketplace.model.User;
import lombok.Data;

import java.time.Instant;

/**
 * A user as the admin panel sees them.
 *
 * <p>Exists primarily to keep {@code password} off the wire — returning the
 * raw {@link User} document sent every account's bcrypt hash to the browser.
 * It also derives a {@code status} string, because {@code User} only stores a
 * {@code banned} boolean and the admin UI works in terms of statuses.
 */
@Data
public class AdminUserDto {
    private String id;
    private String name;
    private String email;
    private String role;
    private String imageUrl;
    private boolean banned;
    /** ACTIVE or BANNED — derived from {@link User#isBanned()}. */
    private String status;
    private boolean consentConfirmed;
    /** EMAIL or GOOGLE, inferred from whether a Google id is linked. */
    private String authProvider;
    private Instant createdAt;
    private Instant updatedAt;

    public static AdminUserDto from(User user) {
        AdminUserDto dto = new AdminUserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setImageUrl(user.getImageUrl());
        dto.setBanned(user.isBanned());
        dto.setStatus(user.isBanned() ? "BANNED" : "ACTIVE");
        dto.setConsentConfirmed(user.isConsentConfirmed());
        dto.setAuthProvider(user.getGoogleId() != null ? "GOOGLE" : "EMAIL");
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }
}
