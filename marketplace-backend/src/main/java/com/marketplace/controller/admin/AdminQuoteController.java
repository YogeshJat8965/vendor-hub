package com.marketplace.controller.admin;

import com.marketplace.dto.admin.AdminQuoteDto;
import com.marketplace.model.QuoteRequest;
import com.marketplace.model.vendor.Vendor;
import com.marketplace.repository.ConversationRepository;
import com.marketplace.repository.QuoteRequestRepository;
import com.marketplace.repository.VendorRepository;
import com.marketplace.service.AdminStatsService;
import com.marketplace.service.PlatformSettingsService;
import com.marketplace.service.QuoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Quote and delivery oversight: the full pipeline view plus dispute
 * resolution. Before this, an admin had no visibility into any of the
 * platform's quotes at all — only disputed ones were ever exposed.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminQuoteController {

    private final QuoteRequestRepository quoteRepository;
    private final VendorRepository vendorRepository;
    private final ConversationRepository conversationRepository;
    private final QuoteService quoteService;
    private final PlatformSettingsService platformSettingsService;

    /** Every quote on the platform, newest first. */
    @GetMapping("/quotes")
    public ResponseEntity<?> getAllQuotes() {
        // Read once per request, not once per row — the window is the same for
        // every quote and this is otherwise a database call per quote.
        int autoCompleteDays = platformSettingsService.get().getAutoCompleteDays();
        List<AdminQuoteDto> quotes = quoteRepository.findAll().stream()
                .sorted(Comparator.comparing(QuoteRequest::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(q -> toAdminQuoteDto(q, autoCompleteDays))
                .toList();
        return ResponseEntity.ok(quotes);
    }

    /**
     * Pipeline counts plus the operational timings the deliveries page
     * headlines with: how long vendors take to deliver, how long the whole
     * job takes end to end, and how many deliveries are close to auto-closing.
     */
    @GetMapping("/quotes/stats")
    public ResponseEntity<?> getQuoteStats() {
        List<QuoteRequest> quotes = quoteRepository.findAll();

        Map<String, Long> byStatus = new LinkedHashMap<>();
        List.of("NEW", "IN_PROGRESS", "QUOTED", "ACCEPTED", "DELIVERED", "DISPUTED", "COMPLETED", "REJECTED", "CLOSED")
                .forEach(s -> byStatus.put(s, 0L));
        quotes.forEach(q -> byStatus.merge(q.getStatus() == null ? "UNKNOWN" : q.getStatus(), 1L, Long::sum));

        // Request raised -> vendor delivered. Falls back to completedAt for
        // quotes that reached completion without a recorded delivery moment
        // (older records predating the two-step completion flow).
        Double avgDeliveryHours = averageHoursBetween(quotes, QuoteRequest::getCreatedAt,
                q -> q.getDeliveredAt() != null ? q.getDeliveredAt() : q.getCompletedAt());
        // Delivered -> customer confirmed.
        Double avgCompletionHours = averageHoursBetween(quotes, QuoteRequest::getDeliveredAt, QuoteRequest::getCompletedAt);

        int autoCompleteDays = platformSettingsService.get().getAutoCompleteDays();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime warningWindowStart = now.minusDays(autoCompleteDays).plusHours(24);
        long nearingAutoComplete = quotes.stream()
                .filter(q -> "DELIVERED".equals(q.getStatus()) && q.getDeliveredAt() != null)
                // Delivered long enough ago that less than 24h remain before
                // the scheduler auto-completes it.
                .filter(q -> q.getDeliveredAt().isBefore(warningWindowStart))
                .count();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total", quotes.size());
        stats.put("byStatus", byStatus);
        stats.put("avgHoursToDelivery", avgDeliveryHours);
        stats.put("avgHoursToCompletion", avgCompletionHours);
        stats.put("nearingAutoComplete", nearingAutoComplete);
        stats.put("autoCompleteDays", autoCompleteDays);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/quotes/disputed")
    public ResponseEntity<?> getDisputedQuotes() {
        int autoCompleteDays = platformSettingsService.get().getAutoCompleteDays();
        List<AdminQuoteDto> quotes = quoteService.getDisputedQuotes().stream()
                .sorted(Comparator.comparing(QuoteRequest::getDisputedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(q -> toAdminQuoteDto(q, autoCompleteDays))
                .toList();
        return ResponseEntity.ok(quotes);
    }

    @PutMapping("/quotes/{quoteId}/resolve-dispute")
    public ResponseEntity<?> resolveDispute(@PathVariable String quoteId, @RequestBody Map<String, String> payload) {
        try {
            QuoteRequest updated = quoteService.resolveDispute(quoteId, payload.get("resolution"));
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private AdminQuoteDto toAdminQuoteDto(QuoteRequest quote, int autoCompleteDays) {
        AdminQuoteDto dto = new AdminQuoteDto();
        dto.setId(quote.getId());
        dto.setVendorSlug(quote.getVendorSlug());
        dto.setCustomerName(quote.getCustomerName());
        dto.setCustomerEmail(quote.getCustomerEmail());
        dto.setCustomerMobile(quote.getCustomerMobile());
        dto.setServiceRequested(quote.getServiceRequested());
        dto.setProjectDescription(quote.getProjectDescription());
        dto.setBudget(quote.getBudget());
        dto.setPreferredDate(quote.getPreferredDate());
        dto.setStatus(quote.getStatus());
        dto.setVendorResponse(quote.getVendorResponse());
        dto.setEstimatedCost(quote.getEstimatedCost());
        dto.setEstimatedTime(quote.getEstimatedTime());
        dto.setDeliveredAt(quote.getDeliveredAt());
        dto.setCompletedAt(quote.getCompletedAt());
        dto.setDisputeReason(quote.getDisputeReason());
        dto.setDisputedAt(quote.getDisputedAt());
        dto.setCreatedAt(quote.getCreatedAt());
        dto.setUpdatedAt(quote.getUpdatedAt());

        vendorRepository.findBySlug(quote.getVendorSlug())
                .map(AdminStatsService::displayName)
                .ifPresentOrElse(dto::setVendorName, () -> dto.setVendorName(quote.getVendorSlug()));

        if ("DELIVERED".equals(quote.getStatus()) && quote.getDeliveredAt() != null) {
            dto.setAutoCompleteAt(quote.getDeliveredAt().plusDays(autoCompleteDays));
        }

        conversationRepository.findByQuoteRequestId(quote.getId())
                .ifPresent(conv -> dto.setConversationId(conv.getId()));

        return dto;
    }

    /** Average hours between two timestamps, over only the quotes where both exist. Null when none qualify. */
    private Double averageHoursBetween(List<QuoteRequest> quotes,
                                       java.util.function.Function<QuoteRequest, LocalDateTime> start,
                                       java.util.function.Function<QuoteRequest, LocalDateTime> end) {
        List<Double> hours = quotes.stream()
                .map(q -> {
                    LocalDateTime s = start.apply(q);
                    LocalDateTime e = end.apply(q);
                    if (s == null || e == null || e.isBefore(s)) return null;
                    return Duration.between(s, e).toMinutes() / 60.0;
                })
                .filter(java.util.Objects::nonNull)
                .toList();

        if (hours.isEmpty()) return null;
        double avg = hours.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        return Math.round(avg * 10.0) / 10.0;
    }
}
