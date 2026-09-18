package com.marketplace.service;

import com.marketplace.model.PlatformSettings;
import com.marketplace.repository.PlatformSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

/**
 * Reads and writes the single {@link PlatformSettings} document.
 *
 * <p>{@link #get()} never returns null: if no document exists yet it returns
 * the defaults, which mirror the app's previous hardcoded behaviour. Callers
 * can therefore treat settings as always available and never null-check.
 */
@Service
@RequiredArgsConstructor
public class PlatformSettingsService {

    private final PlatformSettingsRepository repository;

    public PlatformSettings get() {
        return repository.findById(PlatformSettings.SINGLETON_ID)
                .orElseGet(PlatformSettings::new);
    }

    /**
     * Applies an update. Fields are copied explicitly rather than saving the
     * incoming object wholesale, so a partial or malformed payload can't wipe
     * the audit fields or smuggle in an unexpected id.
     */
    public PlatformSettings update(PlatformSettings updates, String updatedBy) {
        PlatformSettings settings = get();
        settings.setId(PlatformSettings.SINGLETON_ID);

        settings.setSiteName(blankToNull(updates.getSiteName()) != null
                ? updates.getSiteName().trim() : settings.getSiteName());
        settings.setSupportEmail(blankToNull(updates.getSupportEmail()));
        settings.setAdminEmail(blankToNull(updates.getAdminEmail()));

        settings.setAutoApproveVendors(updates.isAutoApproveVendors());
        settings.setVendorRegistrationEnabled(updates.isVendorRegistrationEnabled());
        settings.setReviewsEnabled(updates.isReviewsEnabled());
        settings.setQuoteRequestsEnabled(updates.isQuoteRequestsEnabled());

        // Clamped rather than rejected: a nonsensical window would either
        // auto-complete deliveries instantly or never at all.
        settings.setAutoCompleteDays(Math.max(1, Math.min(updates.getAutoCompleteDays(), 90)));

        settings.setRenewalReminderDaysBeforeExpiry(normalizeReminderDays(updates.getRenewalReminderDaysBeforeExpiry()));

        settings.setUpdatedAt(Instant.now());
        settings.setUpdatedBy(updatedBy);
        return repository.save(settings);
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }

    /**
     * An empty list deliberately means "no reminders" and is kept as-is;
     * otherwise each value is clamped to 1–60 days, de-duplicated, capped at
     * 8 thresholds, and sorted descending so the furthest-out reminder always
     * fires first.
     */
    private List<Integer> normalizeReminderDays(List<Integer> updates) {
        if (updates == null) {
            return PlatformSettings.DEFAULT_REMINDER_DAYS;
        }
        return updates.stream()
                .filter(java.util.Objects::nonNull)
                .map(d -> Math.max(1, Math.min(d, 60)))
                .distinct()
                .sorted(Comparator.reverseOrder())
                .limit(8)
                .toList();
    }
}
