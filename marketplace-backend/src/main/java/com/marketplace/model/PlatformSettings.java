package com.marketplace.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

/**
 * Platform-wide configuration, stored as a single document.
 *
 * <p>Every default here reproduces the behaviour the app had when these
 * settings were hardcoded, so introducing this document changes nothing until
 * an admin deliberately flips a switch.
 *
 * <p>Settings that the app cannot actually honour are deliberately absent.
 * The old mock settings screen offered SMS alerts and payment notification
 * toggles; there is no SMS provider and no payment subsystem, so storing
 * those would have been a switch that silently does nothing.
 */
@Data
@Document(collection = "platform_settings")
public class PlatformSettings {

    /** Fixed id — there is exactly one settings document. */
    public static final String SINGLETON_ID = "platform";

    /** Matches the window {@code QuoteService} used before this was configurable. */
    public static final int DEFAULT_AUTO_COMPLETE_DAYS = 7;

    @Id
    private String id = SINGLETON_ID;

    // ---------------------------------------------------------------- general

    private String siteName = "VendorHub";
    private String supportEmail;
    private String adminEmail;

    // ------------------------------------------------------------ vendor gate

    /**
     * When true, a vendor signup is activated immediately. When false, the
     * vendor lands in PENDING and waits for an admin in the approval queue.
     *
     * <p>Defaults to true because that is exactly what
     * {@code AuthService.vendorSignup} did unconditionally before this existed
     * — defaulting it off would have silently locked every new vendor out.
     */
    private boolean autoApproveVendors = true;

    /** When false, vendor signup is refused outright. */
    private boolean vendorRegistrationEnabled = true;

    // --------------------------------------------------------------- features

    /** When false, customers cannot post new reviews. Existing reviews stay visible. */
    private boolean reviewsEnabled = true;

    /** When false, customers cannot raise new quote requests. */
    private boolean quoteRequestsEnabled = true;

    /**
     * How long a DELIVERED quote waits for customer confirmation before the
     * scheduler auto-completes it. Clamped to 1–90 on write.
     */
    private int autoCompleteDays = DEFAULT_AUTO_COMPLETE_DAYS;

    // ------------------------------------------------------------- subscriptions

    public static final List<Integer> DEFAULT_REMINDER_DAYS = List.of(7, 3, 1);

    /**
     * How many days before a paid subscription expires the vendor gets a
     * reminder notification — one reminder per value in this list, each
     * firing exactly once. There is no auto-renewal, so this is the vendor's
     * only warning that they'll need to buy again to keep their plan. An
     * empty list turns reminders off entirely.
     */
    private List<Integer> renewalReminderDaysBeforeExpiry = DEFAULT_REMINDER_DAYS;

    // ----------------------------------------------------------------- audit

    private Instant updatedAt;
    private String updatedBy;
}
