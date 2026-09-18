package com.marketplace.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * A subscription tier, defined entirely in the database so an admin controls
 * every aspect of it — price, each limit, and each feature it unlocks —
 * without a code change or redeploy.
 *
 * <p>This is deliberately the <em>only</em> place plan numbers live. No limit
 * or price may be hardcoded in a service, controller or React component; every
 * enforcement point resolves through {@code PlanService}. Seed values are
 * written once by {@code PlanSeeder} and are admin-editable from that moment on.
 */
@Data
@Document(collection = "plans")
public class Plan {

    /** Sentinel for "no limit" on any numeric cap. */
    public static final int UNLIMITED = -1;

    @Id
    private String id;

    /**
     * Stable identifier (FREE, BASIC, PREMIUM). Immutable after creation —
     * subscriptions and historical payment records reference it, so renaming
     * a code would orphan them.
     */
    @Indexed(unique = true)
    private String code;

    // ------------------------------------------------------------ presentation

    private String name;
    private String tagline;
    private String description;
    /** Column order on the public pricing page. */
    private Integer displayOrder;
    /** Renders the "Most popular" ribbon on the pricing page. */
    private boolean highlighted;
    /** Hex colour for the plan tag shown in admin lists and on storefronts. */
    private String badgeColor;

    // ----------------------------------------------------------------- pricing

    /** Integer paise. Money is never stored as a floating-point value. */
    private long monthlyPricePaise;
    /** Optional. When set (> 0), a yearly option appears at checkout. */
    private Long yearlyPricePaise;
    private String currency = "INR";
    /**
     * When false the plan still works for everyone already subscribed but
     * disappears from the pricing page — how a tier is retired without
     * breaking existing subscribers.
     */
    private boolean purchasable = true;

    // ------------------------------------------------------------------ limits

    /** Each accepts {@link #UNLIMITED} to lift the cap entirely. */
    private int maxCatalogues;
    private int maxItemsPerCatalogue;
    private int maxImagesPerItem;
    private int maxCoverImages;
    private int maxDescriptionChars;

    // ---------------------------------------------------------------- features

    private boolean allowsGetQuote = true;
    private boolean allowsPriceRange;
    private boolean allowsMaterialsDetails;
    private boolean allowsProjectTimeline;
    private boolean allowsBeforeAfterImages;
    private boolean allowsVideo;
    private boolean allowsPdfBrochure;
    private boolean featuredBadge;
    private boolean priorityVisibility;
    private boolean allowsExtraCta;

    // --------------------------------------------------------------- analytics

    /** Total profile-views count on the vendor's own Analytics page. */
    private boolean allowsProfileViewsCount;
    /** The quote-requests trend chart. */
    private boolean allowsQuoteTrend;
    /** The profile-views trend chart. */
    private boolean allowsViewsTrend;
    /** The rating trend chart (a rolling average computed from real reviews). */
    private boolean allowsRatingTrend;
    /** The views-to-quotes conversion-rate insight. */
    private boolean allowsConversionInsights;
    /**
     * The "recent favorites" feed on Analytics, and the real-time
     * notification sent whenever a customer favorites this vendor.
     */
    private boolean allowsFavoritesInsights;

    // ------------------------------------------------------------------ system

    /**
     * The fallback tier for any vendor without an active subscription.
     * Exactly one plan carries this. It cannot be deleted, made unpurchasable,
     * or priced above zero, because every vendor in the system falls back to it.
     *
     * <p>The explicit {@code @JsonProperty} is load-bearing: Lombok generates
     * {@code isDefault()} for this field, and Jackson strips the {@code is}
     * prefix, which would publish it as {@code "default"} — so clients reading
     * {@code isDefault} would silently see undefined.
     */
    @JsonProperty("isDefault")
    private boolean isDefault;

    private Instant createdAt;
    private Instant updatedAt;
    private String updatedBy;

    /** True when the given cap is set to unlimited. */
    public static boolean isUnlimited(int limit) {
        return limit == UNLIMITED;
    }

    /** Whether {@code count} is within {@code limit}, honouring the unlimited sentinel. */
    public static boolean withinLimit(long count, int limit) {
        return isUnlimited(limit) || count <= limit;
    }
}
