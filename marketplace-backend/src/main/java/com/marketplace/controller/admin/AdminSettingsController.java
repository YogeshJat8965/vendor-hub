package com.marketplace.controller.admin;

import com.marketplace.model.PlatformSettings;
import com.marketplace.service.PlatformSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Platform-wide settings.
 *
 * <p>Currently exposes only the vendor-registration controls, which the
 * approval queue depends on. Phase 7 adds the remaining settings and the full
 * admin UI on top of this same endpoint.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminSettingsController {

    private final PlatformSettingsService platformSettingsService;

    @GetMapping("/settings")
    public ResponseEntity<?> getSettings() {
        return ResponseEntity.ok(platformSettingsService.get());
    }

    @PutMapping("/settings")
    public ResponseEntity<?> updateSettings(@RequestBody PlatformSettings updates,
                                            Authentication authentication) {
        String updatedBy = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(platformSettingsService.update(updates, updatedBy));
    }
}
