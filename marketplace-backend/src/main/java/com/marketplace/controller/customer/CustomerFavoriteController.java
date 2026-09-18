package com.marketplace.controller.customer;

import com.marketplace.model.Favorite;
import com.marketplace.model.User;
import com.marketplace.model.vendor.Vendor;
import com.marketplace.repository.UserRepository;
import com.marketplace.repository.VendorRepository;
import com.marketplace.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * A customer's own favorites. Every endpoint resolves the customer from the
 * JWT — the same pattern used for vendors — so one customer can never read or
 * change another's favorites.
 */
@RestController
@RequestMapping("/api/customer/favorites")
@RequiredArgsConstructor
public class CustomerFavoriteController {

    private final FavoriteService favoriteService;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;

    @PostMapping("/{vendorId}/toggle")
    public ResponseEntity<?> toggle(@PathVariable String vendorId, Authentication authentication) {
        return currentUser(authentication)
                .<ResponseEntity<?>>map(user -> {
                    try {
                        boolean favorited = favoriteService.toggle(user.getId(), user.getName(), vendorId);
                        return ResponseEntity.ok(Map.of("favorited", favorited));
                    } catch (IllegalArgumentException e) {
                        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
                    }
                })
                .orElseGet(this::noUserAccount);
    }

    @GetMapping("/{vendorId}")
    public ResponseEntity<?> check(@PathVariable String vendorId, Authentication authentication) {
        return currentUser(authentication)
                .<ResponseEntity<?>>map(user -> ResponseEntity.ok(Map.of("favorited", favoriteService.isFavorited(user.getId(), vendorId))))
                .orElseGet(this::noUserAccount);
    }

    /** The signed-in customer's favorited vendors, newest first, as full storefront summaries. */
    @GetMapping
    public ResponseEntity<?> list(Authentication authentication) {
        return currentUser(authentication)
                .<ResponseEntity<?>>map(user -> {
                    List<Favorite> favorites = favoriteService.listForCustomer(user.getId());
                    List<Map<String, Object>> vendors = favorites.stream()
                            .map(f -> vendorRepository.findById(f.getVendorId()).map(v -> toSummary(v, f)).orElse(null))
                            .filter(v -> v != null)
                            .toList();
                    return ResponseEntity.ok(vendors);
                })
                .orElseGet(this::noUserAccount);
    }

    private Map<String, Object> toSummary(Vendor vendor, Favorite favorite) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", vendor.getId());
        row.put("slug", vendor.getSlug());
        row.put("businessName", vendor.getBusinessName() != null ? vendor.getBusinessName() : vendor.getStoreName());
        row.put("vendorType", vendor.getVendorType());
        row.put("city", vendor.getCity());
        row.put("state", vendor.getState());
        row.put("rating", vendor.getRating());
        row.put("reviewCount", vendor.getReviewCount());
        row.put("logoUrl", vendor.getLogoUrl());
        row.put("favoritedAt", favorite.getCreatedAt());
        return row;
    }

    private java.util.Optional<User> currentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return java.util.Optional.empty();
        }
        return userRepository.findById(authentication.getName());
    }

    private ResponseEntity<?> noUserAccount() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "No account for the signed-in user"));
    }
}
