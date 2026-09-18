package com.marketplace.service;

import com.marketplace.dto.admin.AdminUserDto;
import com.marketplace.dto.admin.AdminVendorDto;
import com.marketplace.model.QuoteRequest;
import com.marketplace.model.Review;
import com.marketplace.model.Subscription;
import com.marketplace.model.User;
import com.marketplace.model.vendor.Vendor;
import com.marketplace.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Builds the "who is this person and what have they done" view behind the
 * admin directory's detail panel.
 *
 * <p>Customers and vendors are joined to their activity by <em>email</em> and
 * <em>slug</em> respectively, not by Mongo id — that is how quotes and reviews
 * actually reference them in this schema.
 */
@Service
@RequiredArgsConstructor
public class AdminPeopleService {

    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final QuoteRequestRepository quoteRepository;
    private final ReviewRepository reviewRepository;
    private final CatalogueRepository catalogueRepository;
    private final SubscriptionService subscriptionService;
    private final ConversationRepository conversationRepository;

    /** Customer (or admin) profile plus their real quote and review history. */
    public Optional<Map<String, Object>> getUserDetail(String userId) {
        return userRepository.findById(userId).map(user -> {
            Map<String, Object> detail = new LinkedHashMap<>();
            detail.put("profile", AdminUserDto.from(user));

            List<QuoteRequest> quotes = quoteRepository.findByCustomerEmail(user.getEmail());
            List<Review> reviews = reviewRepository.findByCustomerEmail(user.getEmail());

            detail.put("stats", customerStats(user, quotes, reviews));
            detail.put("quotes", quotes.stream()
                    .sorted(Comparator.comparing(QuoteRequest::getCreatedAt,
                            Comparator.nullsLast(Comparator.reverseOrder())))
                    .limit(10)
                    .map(this::quoteSummary)
                    .toList());
            detail.put("reviews", reviews.stream()
                    .sorted(Comparator.comparing(Review::getCreatedAt,
                            Comparator.nullsLast(Comparator.reverseOrder())))
                    .limit(10)
                    .map(this::reviewSummary)
                    .toList());
            return detail;
        });
    }

    private Map<String, Object> customerStats(User user, List<QuoteRequest> quotes, List<Review> reviews) {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalQuotes", quotes.size());
        stats.put("completedQuotes", quotes.stream().filter(q -> "COMPLETED".equals(q.getStatus())).count());
        stats.put("openQuotes", quotes.stream()
                .filter(q -> !"COMPLETED".equals(q.getStatus())
                        && !"REJECTED".equals(q.getStatus())
                        && !"CLOSED".equals(q.getStatus()))
                .count());
        stats.put("totalReviews", reviews.size());
        stats.put("averageRatingGiven", reviews.isEmpty() ? null
                : Math.round(reviews.stream()
                        .filter(r -> r.getRating() != null)
                        .mapToInt(Review::getRating).average().orElse(0.0) * 10.0) / 10.0);
        // Conversations key participants by email, not by Mongo id.
        stats.put("conversations", conversationRepository.findByCustomerIdOrderByLastMessageTimeDesc(user.getEmail()).size());
        return stats;
    }

    /** Vendor profile plus their quote pipeline, ratings and subscription. */
    public Optional<Map<String, Object>> getVendorDetail(String vendorId) {
        return vendorRepository.findById(vendorId).map(vendor -> {
            Map<String, Object> detail = new LinkedHashMap<>();
            detail.put("profile", AdminVendorDto.from(vendor));

            List<QuoteRequest> quotes = quoteRepository.findByVendorSlug(vendor.getSlug());
            List<Review> reviews = reviewRepository.findByVendorSlug(vendor.getSlug());

            detail.put("stats", vendorStats(vendor, quotes, reviews));
            detail.put("quotes", quotes.stream()
                    .sorted(Comparator.comparing(QuoteRequest::getCreatedAt,
                            Comparator.nullsLast(Comparator.reverseOrder())))
                    .limit(10)
                    .map(this::quoteSummary)
                    .toList());
            detail.put("reviews", reviews.stream()
                    .sorted(Comparator.comparing(Review::getCreatedAt,
                            Comparator.nullsLast(Comparator.reverseOrder())))
                    .limit(10)
                    .map(this::reviewSummary)
                    .toList());
            return detail;
        });
    }

    private Map<String, Object> vendorStats(Vendor vendor, List<QuoteRequest> quotes, List<Review> reviews) {
        long completed = quotes.stream().filter(q -> "COMPLETED".equals(q.getStatus())).count();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalQuotes", quotes.size());
        stats.put("completedQuotes", completed);
        stats.put("openQuotes", quotes.stream()
                .filter(q -> !"COMPLETED".equals(q.getStatus())
                        && !"REJECTED".equals(q.getStatus())
                        && !"CLOSED".equals(q.getStatus()))
                .count());
        stats.put("completionRate", quotes.isEmpty() ? null
                : Math.round(completed * 1000.0 / quotes.size()) / 10.0);

        // Recomputed from the reviews themselves rather than trusting the
        // denormalised Vendor.rating field, which is null on most documents.
        List<Review> visible = reviews.stream().filter(r -> !r.isFlagged()).toList();
        stats.put("totalReviews", reviews.size());
        stats.put("flaggedReviews", reviews.stream().filter(Review::isFlagged).count());
        stats.put("averageRating", visible.isEmpty() ? null
                : Math.round(visible.stream()
                        .filter(r -> r.getRating() != null)
                        .mapToInt(Review::getRating).average().orElse(0.0) * 10.0) / 10.0);

        stats.put("catalogues", catalogueRepository.countByVendorId(vendor.getId()));
        stats.put("conversations", conversationRepository.findByVendorIdOrderByLastMessageTimeDesc(vendor.getEmail()).size());

        // The plan a vendor is actually entitled to right now, which is not
        // necessarily the mirror on their record — a lapsed subscription falls
        // back to the default tier.
        stats.put("effectivePlan", subscriptionService.getEffectivePlan(vendor).getCode());

        subscriptionService.getActiveSubscription(vendor.getId()).ifPresent(sub -> {
            Map<String, Object> subscription = new LinkedHashMap<>();
            subscription.put("planCode", sub.getPlanCode());
            subscription.put("status", sub.getStatus());
            subscription.put("amountPaidPaise", sub.getAmountPaidPaise());
            subscription.put("billingPeriod", sub.getBillingPeriod());
            subscription.put("currentPeriodStart",
                    sub.getCurrentPeriodStart() != null ? sub.getCurrentPeriodStart().toString() : null);
            subscription.put("currentPeriodEnd",
                    sub.getCurrentPeriodEnd() != null ? sub.getCurrentPeriodEnd().toString() : null);
            subscription.put("source", sub.getSource());
            stats.put("subscription", subscription);
        });

        return stats;
    }

    private Map<String, Object> quoteSummary(QuoteRequest quote) {
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("id", quote.getId());
        summary.put("service", quote.getServiceRequested());
        summary.put("status", quote.getStatus());
        summary.put("vendorSlug", quote.getVendorSlug());
        summary.put("customerName", quote.getCustomerName());
        summary.put("budget", quote.getBudget());
        summary.put("createdAt", quote.getCreatedAt() != null ? quote.getCreatedAt().toString() : null);
        return summary;
    }

    private Map<String, Object> reviewSummary(Review review) {
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("id", review.getId());
        summary.put("rating", review.getRating());
        summary.put("comment", review.getComment());
        summary.put("vendorSlug", review.getVendorSlug());
        summary.put("customerName", review.getCustomerName());
        summary.put("flagged", review.isFlagged());
        summary.put("createdAt", review.getCreatedAt() != null ? review.getCreatedAt().toString() : null);
        return summary;
    }

    /** Vendor types actually present in the data, for a filter that can't go stale. */
    public List<String> getVendorTypes() {
        return vendorRepository.findAll().stream()
                .map(Vendor::getVendorType)
                .filter(t -> t != null && !t.isBlank())
                .distinct()
                .sorted()
                .toList();
    }
}
