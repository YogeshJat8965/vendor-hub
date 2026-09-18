package com.marketplace.service;

import com.marketplace.model.PaymentTransaction;
import com.marketplace.model.QuoteRequest;
import com.marketplace.model.Review;
import com.marketplace.model.Subscription;
import com.marketplace.model.User;
import com.marketplace.model.vendor.Vendor;
import com.marketplace.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Every number the admin dashboard and analytics pages display.
 *
 * <p>The one rule this class follows: a figure is either computed from real
 * documents or it is reported as {@code null}. Nothing here estimates,
 * back-fills or simulates. Where the data genuinely does not exist — revenue,
 * for instance, because there is no payment subsystem — the caller gets
 * {@code null} and the UI renders an explicit placeholder rather than a zero
 * that reads like a real measurement.
 *
 * <p>Note the two time types in play: {@code User} and {@code Vendor} store
 * {@code createdAt} as an {@link Instant}, while {@code QuoteRequest} and
 * {@code Review} use {@link LocalDateTime}. Both are normalised to
 * {@link LocalDate} in the system zone before any bucketing.
 */
@Service
@RequiredArgsConstructor
public class AdminStatsService {

    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final QuoteRequestRepository quoteRepository;
    private final ReviewRepository reviewRepository;
    private final ConversationRepository conversationRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;

    /** Quote statuses in pipeline order, so the UI never has to hardcode them. */
    private static final List<String> QUOTE_STATUSES =
            List.of("NEW", "IN_PROGRESS", "QUOTED", "ACCEPTED", "DELIVERED", "DISPUTED", "COMPLETED", "REJECTED", "CLOSED");

    private static final List<String> VENDOR_STATUSES =
            List.of("PENDING", "ACTIVE", "SUSPENDED", "REJECTED");

    // ---------------------------------------------------------------- overview

    /**
     * Headline platform figures plus period-over-period growth.
     *
     * @param periodDays window used for the growth comparison; the previous
     *                   window of equal length is the baseline.
     */
    public Map<String, Object> getOverview(int periodDays) {
        List<User> users = userRepository.findAll();
        List<Vendor> vendors = vendorRepository.findAll();
        List<QuoteRequest> quotes = quoteRepository.findAll();
        List<Review> reviews = reviewRepository.findAll();

        Map<String, Object> stats = new LinkedHashMap<>();

        // People
        long customers = users.stream().filter(u -> "CUSTOMER".equals(u.getRole())).count();
        long admins = users.stream().filter(u -> "ADMIN".equals(u.getRole())).count();
        stats.put("totalUsers", users.size());
        stats.put("totalCustomers", customers);
        stats.put("totalAdmins", admins);
        stats.put("bannedUsers", users.stream().filter(User::isBanned).count());

        // Vendors, counted per real status value
        Map<String, Long> vendorsByStatus = new LinkedHashMap<>();
        VENDOR_STATUSES.forEach(s -> vendorsByStatus.put(s, 0L));
        vendors.forEach(v -> vendorsByStatus.merge(
                v.getStatus() == null ? "UNKNOWN" : v.getStatus(), 1L, Long::sum));
        stats.put("totalVendors", vendors.size());
        stats.put("activeVendors", vendorsByStatus.getOrDefault("ACTIVE", 0L));
        stats.put("pendingVendors", vendorsByStatus.getOrDefault("PENDING", 0L));
        stats.put("suspendedVendors", vendorsByStatus.getOrDefault("SUSPENDED", 0L));
        stats.put("rejectedVendors", vendorsByStatus.getOrDefault("REJECTED", 0L));
        stats.put("vendorsByStatus", vendorsByStatus);

        // Quote pipeline
        Map<String, Long> quotesByStatus = new LinkedHashMap<>();
        QUOTE_STATUSES.forEach(s -> quotesByStatus.put(s, 0L));
        quotes.forEach(q -> quotesByStatus.merge(
                q.getStatus() == null ? "UNKNOWN" : q.getStatus(), 1L, Long::sum));
        long completed = quotesByStatus.getOrDefault("COMPLETED", 0L);
        stats.put("totalQuotes", quotes.size());
        stats.put("quotesByStatus", quotesByStatus);
        stats.put("completedQuotes", completed);
        stats.put("awaitingConfirmation", quotesByStatus.getOrDefault("DELIVERED", 0L));
        stats.put("openDisputes", quotesByStatus.getOrDefault("DISPUTED", 0L));
        stats.put("completionRate", quotes.isEmpty() ? null
                : round1(completed * 100.0 / quotes.size()));

        // Reviews — the platform average excludes flagged ones, matching the
        // rule each vendor's own rating already uses.
        List<Review> visibleReviews = reviews.stream().filter(r -> !r.isFlagged()).toList();
        stats.put("totalReviews", reviews.size());
        stats.put("flaggedReviews", reviews.stream().filter(Review::isFlagged).count());
        stats.put("averageRating", visibleReviews.isEmpty() ? null
                : round1(visibleReviews.stream()
                        .filter(r -> r.getRating() != null)
                        .mapToInt(Review::getRating).average().orElse(0.0)));

        stats.put("totalConversations", conversationRepository.count());

        Map<String, Object> revenue = getRevenue();
        // Kept for the existing "Revenue" stat card contract elsewhere in the
        // admin UI — MRR is the single most meaningful figure for a
        // subscription business, so that's what this field now reports.
        stats.put("totalRevenue", revenue.get("mrrPaise"));
        stats.put("revenue", revenue);

        stats.put("growth", growth(users, vendors, quotes, reviews, periodDays));
        stats.put("newThisPeriod", newThisPeriod(users, vendors, quotes, reviews, periodDays));
        stats.put("periodDays", periodDays);
        return stats;
    }

    // ----------------------------------------------------------------- revenue

    /**
     * Real subscription revenue, computed from {@link PaymentTransaction}
     * records — never from {@link Subscription} prices, since a transaction
     * is the only proof money actually moved. An admin-granted plan
     * ({@code Subscription.source = ADMIN_GRANT}) has no transaction behind
     * it and is therefore correctly invisible here, so comping a vendor can
     * never inflate revenue.
     */
    public Map<String, Object> getRevenue() {
        List<PaymentTransaction> successful = paymentTransactionRepository.findByStatus(PaymentTransaction.STATUS_SUCCESS);
        List<Subscription> activeSubs = subscriptionRepository.findByStatus(Subscription.STATUS_ACTIVE).stream()
                .filter(Subscription::isCurrentlyActive)
                .toList();

        long totalCollectedPaise = successful.stream().mapToLong(PaymentTransaction::getAmountPaise).sum();

        // MRR: every currently active paid subscription normalised to a
        // monthly figure — a yearly subscriber's amountPaidPaise is what they
        // paid for the whole year, so it is divided by 12 here rather than
        // counted as a full month of revenue.
        long mrrPaise = activeSubs.stream()
                .mapToLong(s -> Subscription.PERIOD_YEARLY.equals(s.getBillingPeriod())
                        ? Math.round(s.getAmountPaidPaise() / 12.0)
                        : s.getAmountPaidPaise())
                .sum();

        Map<String, Long> byPlan = new LinkedHashMap<>();
        for (PaymentTransaction t : successful) {
            byPlan.merge(t.getPlanCode(), t.getAmountPaise(), Long::sum);
        }
        List<Map<String, Object>> byPlanList = byPlan.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(e -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("planCode", e.getKey());
                    row.put("amountPaise", e.getValue());
                    return row;
                })
                .toList();

        Map<String, Object> revenue = new LinkedHashMap<>();
        revenue.put("mrrPaise", mrrPaise);
        revenue.put("totalCollectedPaise", totalCollectedPaise);
        revenue.put("payingSubscribers", activeSubs.size());
        revenue.put("byPlan", byPlanList);
        revenue.put("successfulTransactionCount", successful.size());
        return revenue;
    }

    /** Real revenue collected per bucket, for the analytics revenue chart. */
    public List<Map<String, Object>> getRevenueTimeSeries(int days) {
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusDays(days);
        Bucketing bucketing = Bucketing.forWindow(days);
        List<LocalDate> buckets = bucketing.buckets(start, today);

        List<PaymentTransaction> successful = paymentTransactionRepository.findByStatus(PaymentTransaction.STATUS_SUCCESS);

        Map<String, Long> paiseByBucket = new HashMap<>();
        for (PaymentTransaction t : successful) {
            if (t.getCreatedAt() == null) continue;
            LocalDate date = LocalDateTime.ofInstant(t.getCreatedAt(), ZoneId.systemDefault()).toLocalDate();
            LocalDate key = bucketing.keyFor(date);
            if (!buckets.contains(key)) continue;
            paiseByBucket.merge(bucketing.label(key), t.getAmountPaise(), Long::sum);
        }

        return buckets.stream().map(bucketing::label).distinct().map(label -> {
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("date", label);
            point.put("amountPaise", paiseByBucket.getOrDefault(label, 0L));
            return point;
        }).toList();
    }

    /**
     * Absolute counts created inside the current window.
     *
     * <p>Kept alongside the percentages because a percentage needs a non-empty
     * baseline window and these do not. On a young platform — or one whose
     * activity is clustered rather than continuous — the percentage is often
     * unavailable while "23 new this month" is still a true, useful figure.
     */
    private Map<String, Object> newThisPeriod(List<User> users, List<Vendor> vendors,
                                              List<QuoteRequest> quotes, List<Review> reviews,
                                              int periodDays) {
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusDays(periodDays);
        // The window is inclusive of today, so the exclusive end is tomorrow.
        LocalDate end = today.plusDays(1);

        Map<String, Object> counts = new LinkedHashMap<>();
        counts.put("users", countInWindow(users.stream().map(u -> toLocalDate(u.getCreatedAt())).toList(), start, end));
        counts.put("vendors", countInWindow(vendors.stream().map(v -> toLocalDate(v.getCreatedAt())).toList(), start, end));
        counts.put("quotes", countInWindow(quotes.stream().map(q -> toLocalDate(q.getCreatedAt())).toList(), start, end));
        counts.put("reviews", countInWindow(reviews.stream().map(r -> toLocalDate(r.getCreatedAt())).toList(), start, end));
        return counts;
    }

    /**
     * Signup/activity change against the immediately preceding window of the
     * same length. Returns {@code null} for a series whose baseline window is
     * empty — a percentage against zero is not a meaningful number, and
     * reporting "+100%" there would overstate what the data supports.
     */
    private Map<String, Object> growth(List<User> users, List<Vendor> vendors,
                                       List<QuoteRequest> quotes, List<Review> reviews,
                                       int periodDays) {
        LocalDate today = LocalDate.now();
        LocalDate currentStart = today.minusDays(periodDays);
        LocalDate previousStart = today.minusDays(periodDays * 2L);

        Map<String, Object> growth = new LinkedHashMap<>();
        growth.put("users", percentChange(
                countInWindow(users.stream().map(u -> toLocalDate(u.getCreatedAt())).toList(), currentStart, today),
                countInWindow(users.stream().map(u -> toLocalDate(u.getCreatedAt())).toList(), previousStart, currentStart)));
        growth.put("vendors", percentChange(
                countInWindow(vendors.stream().map(v -> toLocalDate(v.getCreatedAt())).toList(), currentStart, today),
                countInWindow(vendors.stream().map(v -> toLocalDate(v.getCreatedAt())).toList(), previousStart, currentStart)));
        growth.put("quotes", percentChange(
                countInWindow(quotes.stream().map(q -> toLocalDate(q.getCreatedAt())).toList(), currentStart, today),
                countInWindow(quotes.stream().map(q -> toLocalDate(q.getCreatedAt())).toList(), previousStart, currentStart)));
        growth.put("reviews", percentChange(
                countInWindow(reviews.stream().map(r -> toLocalDate(r.getCreatedAt())).toList(), currentStart, today),
                countInWindow(reviews.stream().map(r -> toLocalDate(r.getCreatedAt())).toList(), previousStart, currentStart)));
        return growth;
    }

    // ------------------------------------------------------------ activity feed

    /**
     * The newest real events across the platform, newest first. Replaces what
     * used to be a hardcoded empty list.
     */
    public List<Map<String, Object>> getActivityFeed(int limit) {
        List<Map<String, Object>> events = new ArrayList<>();

        userRepository.findTop20ByOrderByCreatedAtDesc().stream()
                .filter(u -> !"ADMIN".equals(u.getRole()))
                .forEach(u -> events.add(event(
                        "user-" + u.getId(), "user_signup", "New customer registered",
                        u.getName() != null ? u.getName() : u.getEmail(), null,
                        toLocalDateTime(u.getCreatedAt()), "success", "/dashboard/admin/users")));

        vendorRepository.findTop20ByOrderByCreatedAtDesc().forEach(v -> {
            boolean pending = "PENDING".equals(v.getStatus());
            events.add(event(
                    "vendor-" + v.getId(), "vendor_signup",
                    pending ? "Vendor awaiting approval" : "New vendor registered",
                    displayName(v), v.getVendorType(),
                    toLocalDateTime(v.getCreatedAt()),
                    pending ? "warning" : "success", "/dashboard/admin/vendors"));
        });

        quoteRepository.findTop20ByOrderByCreatedAtDesc().forEach(q -> {
            // A quote's most recent meaningful moment, not just when it was
            // raised — otherwise a dispute filed today would surface with the
            // original request's date.
            String status = q.getStatus();
            if ("DISPUTED".equals(status) && q.getDisputedAt() != null) {
                events.add(event("quote-dispute-" + q.getId(), "quote_disputed", "Delivery disputed",
                        q.getCustomerName() != null ? q.getCustomerName() : q.getCustomerEmail(),
                        q.getServiceRequested(), q.getDisputedAt(), "error", "/dashboard/admin/disputes"));
            } else if ("COMPLETED".equals(status) && q.getCompletedAt() != null) {
                events.add(event("quote-complete-" + q.getId(), "quote_completed", "Quote completed",
                        q.getCustomerName() != null ? q.getCustomerName() : q.getCustomerEmail(),
                        q.getServiceRequested(), q.getCompletedAt(), "success", "/dashboard/admin/disputes"));
            } else {
                events.add(event("quote-" + q.getId(), "quote_created", "New quote request",
                        q.getCustomerName() != null ? q.getCustomerName() : q.getCustomerEmail(),
                        q.getServiceRequested(), q.getCreatedAt(), "info", "/dashboard/admin/disputes"));
            }
        });

        reviewRepository.findTop20ByOrderByCreatedAtDesc().forEach(r -> events.add(event(
                "review-" + r.getId(), r.isFlagged() ? "review_flagged" : "review_posted",
                r.isFlagged() ? "Review flagged" : "Review posted",
                r.getCustomerName() != null ? r.getCustomerName() : r.getCustomerEmail(),
                r.getRating() != null ? r.getRating() + "★ for " + r.getVendorSlug() : r.getVendorSlug(),
                r.isFlagged() && r.getFlaggedAt() != null ? r.getFlaggedAt() : r.getCreatedAt(),
                r.isFlagged() ? "warning" : "info", "/dashboard/admin/reviews")));

        return events.stream()
                .filter(e -> e.get("time") != null)
                .sorted(Comparator.comparing((Map<String, Object> e) -> (String) e.get("time")).reversed())
                .limit(Math.max(1, limit))
                .toList();
    }

    private Map<String, Object> event(String id, String type, String action, String subject,
                                      String detail, LocalDateTime time, String status, String link) {
        Map<String, Object> e = new LinkedHashMap<>();
        e.put("id", id);
        e.put("type", type);
        e.put("action", action);
        e.put("subject", subject);
        e.put("detail", detail);
        // ISO-8601 sorts lexicographically in chronological order, which is
        // what the comparator above relies on.
        e.put("time", time != null ? time.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : null);
        e.put("status", status);
        e.put("link", link);
        return e;
    }

    // -------------------------------------------------------------- time series

    /**
     * Daily/weekly/monthly buckets over the requested window, for the charts.
     *
     * <p>Every series is derived from a stored timestamp. Notably absent is a
     * "vendor approvals over time" series: nothing records <em>when</em> a
     * vendor was approved, only their current status, so that chart would have
     * had to invent its x-axis. It is replaced by vendor signups split by
     * current status, which the data does support.
     */
    public Map<String, Object> getTimeSeries(int days) {
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusDays(days);
        Bucketing bucketing = Bucketing.forWindow(days);

        List<User> users = userRepository.findAll();
        List<Vendor> vendors = vendorRepository.findAll();
        List<QuoteRequest> quotes = quoteRepository.findAll();
        List<Review> reviews = reviewRepository.findAll();

        List<LocalDate> buckets = bucketing.buckets(start, today);
        List<String> labels = buckets.stream().map(bucketing::label).toList();

        // Signups
        Map<String, Long> customerCounts = bucketCounts(bucketing, buckets,
                users.stream().filter(u -> "CUSTOMER".equals(u.getRole()))
                        .map(u -> toLocalDate(u.getCreatedAt())).toList());
        Map<String, Long> vendorCounts = bucketCounts(bucketing, buckets,
                vendors.stream().map(v -> toLocalDate(v.getCreatedAt())).toList());

        List<Map<String, Object>> userGrowth = new ArrayList<>();
        for (int i = 0; i < buckets.size(); i++) {
            String label = labels.get(i);
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("date", label);
            point.put("customers", customerCounts.getOrDefault(label, 0L));
            point.put("vendors", vendorCounts.getOrDefault(label, 0L));
            userGrowth.add(point);
        }

        // Quotes raised vs completed
        Map<String, Long> quotesCreated = bucketCounts(bucketing, buckets,
                quotes.stream().map(q -> toLocalDate(q.getCreatedAt())).toList());
        Map<String, Long> quotesCompleted = bucketCounts(bucketing, buckets,
                quotes.stream().filter(q -> q.getCompletedAt() != null)
                        .map(q -> q.getCompletedAt().toLocalDate()).toList());

        List<Map<String, Object>> quoteActivity = new ArrayList<>();
        for (String label : labels) {
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("date", label);
            point.put("created", quotesCreated.getOrDefault(label, 0L));
            point.put("completed", quotesCompleted.getOrDefault(label, 0L));
            quoteActivity.add(point);
        }

        // Reviews posted vs flagged (flagged bucketed by when it was flagged)
        Map<String, Long> reviewsPosted = bucketCounts(bucketing, buckets,
                reviews.stream().map(r -> toLocalDate(r.getCreatedAt())).toList());
        Map<String, Long> reviewsFlagged = bucketCounts(bucketing, buckets,
                reviews.stream().filter(r -> r.isFlagged() && r.getFlaggedAt() != null)
                        .map(r -> r.getFlaggedAt().toLocalDate()).toList());

        List<Map<String, Object>> reviewActivity = new ArrayList<>();
        for (String label : labels) {
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("date", label);
            point.put("reviews", reviewsPosted.getOrDefault(label, 0L));
            point.put("flagged", reviewsFlagged.getOrDefault(label, 0L));
            reviewActivity.add(point);
        }

        // Distributions
        List<Map<String, Object>> quotesByStatus = QUOTE_STATUSES.stream()
                .map(status -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("status", status);
                    row.put("count", quotes.stream().filter(q -> status.equals(q.getStatus())).count());
                    return row;
                })
                .filter(row -> (Long) row.get("count") > 0)
                .toList();

        List<Map<String, Object>> vendorsByType = vendors.stream()
                .collect(Collectors.groupingBy(
                        v -> v.getVendorType() == null ? "Unspecified" : v.getVendorType(),
                        LinkedHashMap::new, Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(e -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("type", e.getKey());
                    row.put("count", e.getValue());
                    return row;
                })
                .toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totals", getOverview(days));
        result.put("userGrowth", userGrowth);
        result.put("quoteActivity", quoteActivity);
        result.put("reviewActivity", reviewActivity);
        result.put("revenueActivity", getRevenueTimeSeries(days));
        result.put("quotesByStatus", quotesByStatus);
        result.put("vendorsByType", vendorsByType);
        result.put("periodDays", days);
        result.put("granularity", bucketing.name().toLowerCase());
        return result;
    }

    /** Chooses day/week/month buckets so a chart never renders 365 ticks. */
    private enum Bucketing {
        DAY, WEEK, MONTH;

        static Bucketing forWindow(int days) {
            if (days <= 31) return DAY;
            if (days <= 120) return WEEK;
            return MONTH;
        }

        /** The bucket a date belongs to, represented by the bucket's first day. */
        LocalDate keyFor(LocalDate date) {
            return switch (this) {
                case DAY -> date;
                case WEEK -> date.with(DayOfWeek.MONDAY);
                case MONTH -> date.withDayOfMonth(1);
            };
        }

        String label(LocalDate bucketStart) {
            return switch (this) {
                case DAY, WEEK -> bucketStart.format(DateTimeFormatter.ofPattern("dd MMM"));
                case MONTH -> bucketStart.format(DateTimeFormatter.ofPattern("MMM yy"));
            };
        }

        List<LocalDate> buckets(LocalDate start, LocalDate end) {
            List<LocalDate> result = new ArrayList<>();
            LocalDate cursor = keyFor(start);
            LocalDate last = keyFor(end);
            while (!cursor.isAfter(last)) {
                result.add(cursor);
                cursor = switch (this) {
                    case DAY -> cursor.plusDays(1);
                    case WEEK -> cursor.plusWeeks(1);
                    case MONTH -> cursor.plusMonths(1);
                };
            }
            return result;
        }
    }

    /** Counts dates into the supplied buckets, keyed by bucket label. */
    private Map<String, Long> bucketCounts(Bucketing bucketing, List<LocalDate> buckets, List<LocalDate> dates) {
        Set<LocalDate> valid = new HashSet<>(buckets);
        Map<String, Long> counts = new HashMap<>();
        for (LocalDate date : dates) {
            if (date == null) continue;
            LocalDate key = bucketing.keyFor(date);
            if (!valid.contains(key)) continue;
            counts.merge(bucketing.label(key), 1L, Long::sum);
        }
        return counts;
    }

    // -------------------------------------------------------------- conversions

    private static LocalDate toLocalDate(Instant instant) {
        return instant == null ? null : LocalDateTime.ofInstant(instant, ZoneId.systemDefault()).toLocalDate();
    }

    private static LocalDate toLocalDate(LocalDateTime dateTime) {
        return dateTime == null ? null : dateTime.toLocalDate();
    }

    private static LocalDateTime toLocalDateTime(Instant instant) {
        return instant == null ? null : LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
    }

    private static long countInWindow(List<LocalDate> dates, LocalDate startInclusive, LocalDate endExclusive) {
        return dates.stream()
                .filter(Objects::nonNull)
                .filter(d -> !d.isBefore(startInclusive) && d.isBefore(endExclusive))
                .count();
    }

    private static Double percentChange(long current, long previous) {
        if (previous == 0) return null;
        return round1((current - previous) * 100.0 / previous);
    }

    private static double round1(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    /** First non-blank of business name, store name, owner name, then email. */
    public static String displayName(Vendor vendor) {
        if (vendor.getBusinessName() != null && !vendor.getBusinessName().isBlank()) return vendor.getBusinessName();
        if (vendor.getStoreName() != null && !vendor.getStoreName().isBlank()) return vendor.getStoreName();
        if (vendor.getOwnerName() != null && !vendor.getOwnerName().isBlank()) return vendor.getOwnerName();
        return vendor.getEmail();
    }
}
