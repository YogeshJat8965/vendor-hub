package com.marketplace.service;

import com.marketplace.model.PageView;
import com.marketplace.model.Plan;
import com.marketplace.model.QuoteRequest;
import com.marketplace.model.Review;
import com.marketplace.model.vendor.Vendor;
import com.marketplace.repository.PageViewRepository;
import com.marketplace.repository.QuoteRequestRepository;
import com.marketplace.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * The vendor's own performance numbers — real data, computed from the same
 * {@link QuoteRequest}, {@link Review} and {@link PageView} collections the
 * rest of the app already writes to.
 *
 * <p>Every field beyond the always-available totals (quotes, reviews, rating)
 * is gated by the vendor's resolved {@link Plan}: a field the plan doesn't
 * allow comes back {@code null} rather than a fabricated number, mirroring
 * how {@code PlanVisibilityService} locks premium catalogue content — the
 * frontend renders a locked/blurred card for anything it receives as null
 * whose matching {@code entitlements} flag is false.
 */
@Service
@RequiredArgsConstructor
public class VendorAnalyticsService {

    private final QuoteRequestRepository quoteRequestRepository;
    private final ReviewRepository reviewRepository;
    private final PageViewRepository pageViewRepository;
    private final SubscriptionService subscriptionService;
    private final FavoriteService favoriteService;

    public Map<String, Object> getAnalytics(Vendor vendor, int periodDays) {
        Plan plan = subscriptionService.getEffectivePlan(vendor);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime periodStart = now.minusDays(periodDays);
        String slug = vendor.getSlug();

        Map<String, Object> entitlements = new LinkedHashMap<>();
        entitlements.put("profileViewsCount", plan.isAllowsProfileViewsCount());
        entitlements.put("quoteTrend", plan.isAllowsQuoteTrend());
        entitlements.put("viewsTrend", plan.isAllowsViewsTrend());
        entitlements.put("ratingTrend", plan.isAllowsRatingTrend());
        entitlements.put("conversionInsights", plan.isAllowsConversionInsights());
        entitlements.put("favoritesInsights", plan.isAllowsFavoritesInsights());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("plan", Map.of("code", plan.getCode(), "name", plan.getName()));
        result.put("entitlements", entitlements);
        result.put("period", String.valueOf(periodDays));

        // Always available, on every tier including Free.
        long totalQuotes = quoteRequestRepository.findByVendorSlug(slug).size();
        long totalReviews = reviewRepository.countByVendorSlug(slug);
        result.put("totalQuotes", totalQuotes);
        result.put("totalReviews", totalReviews);
        result.put("averageRating", vendor.getRating() != null ? vendor.getRating() : 0.0);

        result.put("totalViews", plan.isAllowsProfileViewsCount()
                ? (long) pageViewRepository.findByVendorSlug(slug).size() : null);

        result.put("quoteTrend", plan.isAllowsQuoteTrend()
                ? bucketByDay(quoteRequestRepository.findByVendorSlugAndCreatedAtAfter(slug, periodStart).stream()
                        .map(QuoteRequest::getCreatedAt).toList(), periodDays, now)
                : null);

        result.put("viewsTrend", plan.isAllowsViewsTrend()
                ? bucketByDay(pageViewRepository.findByVendorSlugAndViewedAtAfter(slug, periodStart).stream()
                        .map(PageView::getViewedAt).toList(), periodDays, now)
                : null);

        result.put("ratingTrend", plan.isAllowsRatingTrend()
                ? ratingTrend(reviewRepository.findByVendorSlug(slug), periodDays, now)
                : null);

        Double conversionRatePct = null;
        if (plan.isAllowsConversionInsights()) {
            long periodViews = pageViewRepository.countByVendorSlugAndViewedAtAfter(slug, periodStart);
            long periodQuotes = quoteRequestRepository.findByVendorSlugAndCreatedAtAfter(slug, periodStart).size();
            conversionRatePct = periodViews > 0 ? Math.round(periodQuotes * 10000.0 / periodViews) / 100.0 : 0.0;
        }
        result.put("conversionRatePct", conversionRatePct);

        if (plan.isAllowsFavoritesInsights()) {
            result.put("favoritesCount", favoriteService.countForVendor(vendor.getId()));
            result.put("recentFavorites", favoriteService.listForVendor(vendor.getId()).stream()
                    .limit(10)
                    .map(f -> {
                        Map<String, Object> row = new LinkedHashMap<>();
                        row.put("customerName", f.getCustomerName() != null && !f.getCustomerName().isBlank() ? f.getCustomerName() : "Someone");
                        row.put("createdAt", f.getCreatedAt());
                        return row;
                    })
                    .toList());
        } else {
            result.put("favoritesCount", null);
            result.put("recentFavorites", null);
        }

        return result;
    }

    /**
     * Groups timestamps into evenly-spaced buckets counting back from today —
     * daily for a 7 or 30 day window, weekly for 90 days or a year, so a
     * year's worth of bars doesn't render as an unreadable wall of slivers.
     */
    private List<Map<String, Object>> bucketByDay(List<LocalDateTime> timestamps, int periodDays, LocalDateTime now) {
        int bucketSpanDays = periodDays > 30 ? 7 : 1;
        int bucketCount = (int) Math.ceil(periodDays / (double) bucketSpanDays);
        LocalDate today = now.toLocalDate();

        Map<LocalDate, Long> counts = new HashMap<>();
        for (LocalDateTime ts : timestamps) {
            if (ts == null) continue;
            long daysAgo = java.time.temporal.ChronoUnit.DAYS.between(ts.toLocalDate(), today);
            long bucketIndex = Math.max(0, daysAgo) / bucketSpanDays;
            LocalDate bucketDate = today.minusDays(bucketIndex * bucketSpanDays);
            counts.merge(bucketDate, 1L, Long::sum);
        }

        List<Map<String, Object>> rows = new ArrayList<>();
        for (int i = bucketCount - 1; i >= 0; i--) {
            LocalDate bucketDate = today.minusDays((long) i * bucketSpanDays);
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("date", bucketDate.toString());
            row.put("count", counts.getOrDefault(bucketDate, 0L));
            rows.add(row);
        }
        return rows;
    }

    /** A rolling average rating computed as of each bucket's date, from every real review up to that point. */
    private List<Map<String, Object>> ratingTrend(List<Review> allReviews, int periodDays, LocalDateTime now) {
        int bucketSpanDays = periodDays > 30 ? 7 : 1;
        int bucketCount = (int) Math.ceil(periodDays / (double) bucketSpanDays);
        LocalDate today = now.toLocalDate();

        List<Review> sorted = allReviews.stream()
                .filter(r -> r.getCreatedAt() != null && r.getRating() != null)
                .sorted(Comparator.comparing(Review::getCreatedAt))
                .toList();

        List<Map<String, Object>> rows = new ArrayList<>();
        for (int i = bucketCount - 1; i >= 0; i--) {
            LocalDate bucketDate = today.minusDays((long) i * bucketSpanDays);
            LocalDateTime cutoff = bucketDate.plusDays(1).atStartOfDay();
            double avg = sorted.stream()
                    .filter(r -> r.getCreatedAt().isBefore(cutoff))
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0.0);
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("date", bucketDate.toString());
            row.put("rating", Math.round(avg * 100.0) / 100.0);
            rows.add(row);
        }
        return rows;
    }
}
