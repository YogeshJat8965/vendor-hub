package com.marketplace.controller.vendor;

import com.marketplace.model.vendor.Vendor;
import com.marketplace.repository.VendorRepository;
import com.marketplace.service.PlanService;
import com.marketplace.service.VendorAnalyticsService;
import com.marketplace.service.VendorEntitlementService;
import com.marketplace.service.VendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/vendor")
@RequiredArgsConstructor
public class VendorController {

    private final VendorService vendorService;
    private final VendorRepository vendorRepository;
    private final VendorEntitlementService entitlementService;
    private final VendorAnalyticsService vendorAnalyticsService;

    /**
     * The signed-in vendor's own profile.
     *
     * <p>The {@code email} parameter is accepted for backwards compatibility
     * with existing callers but is <strong>ignored</strong>: the vendor is
     * resolved from the JWT. Previously any vendor could read any other
     * vendor's record — including their stored password hash — just by passing
     * a different address.
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestParam(required = false) String email,
                                        Authentication authentication) {
        return currentVendor(authentication)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "No vendor account for the signed-in user")));
    }

    /**
     * Updates the signed-in vendor's profile. The target is taken from the JWT,
     * never from the request body — sending someone else's email no longer
     * edits their account.
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Vendor updates, Authentication authentication) {
        return currentVendor(authentication)
                .<ResponseEntity<?>>map(vendor -> {
                    try {
                        Vendor updated = vendorService.updateVendorByEmail(vendor.getEmail(), updates);
                        return ResponseEntity.ok(updated);
                    } catch (Exception e) {
                        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
                    }
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "No vendor account for the signed-in user")));
    }

    /**
     * What the signed-in vendor's plan allows, and how much of it they've used.
     *
     * <p>The vendor dashboard reads its limits from here rather than holding
     * its own copy, so an admin changing a limit is reflected in the UI
     * immediately and the two can never disagree.
     */
    @GetMapping("/plan")
    public ResponseEntity<?> getPlan(Authentication authentication) {
        return currentVendor(authentication)
                .<ResponseEntity<?>>map(vendor -> ResponseEntity.ok(entitlementService.describe(vendor)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "No vendor account for the signed-in user")));
    }

    /**
     * The signed-in vendor's own analytics — real numbers computed from
     * their actual quotes, reviews and profile views, gated by their plan
     * (see {@link VendorAnalyticsService}). The {@code email} parameter is
     * accepted for backwards compatibility but ignored, same as
     * {@code /profile}: the vendor is always resolved from the JWT.
     */
    @GetMapping("/analytics")
    public ResponseEntity<?> getVendorAnalytics(
            @RequestParam(required = false) String email,
            @RequestParam(defaultValue = "30") String period,
            Authentication authentication) {
        return currentVendor(authentication)
                .<ResponseEntity<?>>map(vendor -> {
                    int days = switch (period) {
                        case "7" -> 7;
                        case "90" -> 90;
                        case "365" -> 365;
                        default -> 30;
                    };
                    return ResponseEntity.ok(vendorAnalyticsService.getAnalytics(vendor, days));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "No vendor account for the signed-in user")));
    }

    /**
     * REST authentication carries the Mongo id as the principal name
     * (JwtAuthFilter uses extractUserId), so a vendor is looked up by id.
     */
    private java.util.Optional<Vendor> currentVendor(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return java.util.Optional.empty();
        }
        return vendorRepository.findById(authentication.getName());
    }
}
