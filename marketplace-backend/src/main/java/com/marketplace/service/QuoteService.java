package com.marketplace.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marketplace.model.QuoteRequest;
import com.marketplace.model.User;
import com.marketplace.model.vendor.Vendor;
import com.marketplace.repository.QuoteRequestRepository;
import com.marketplace.repository.VendorRepository;
import com.marketplace.model.Conversation;
import com.marketplace.model.Message;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuoteService {

    private final QuoteRequestRepository quoteRepository;
    private final VendorRepository vendorRepository;
    private final MessagingService messagingService;
    private final ObjectMapper objectMapper;
    private final NotificationService notificationService;
    private final com.marketplace.repository.UserRepository userRepository;

    public QuoteRequest createQuote(QuoteRequest quote) {
        quote.setStatus("NEW");
        quote.setCreatedAt(LocalDateTime.now());
        quote.setUpdatedAt(LocalDateTime.now());
        QuoteRequest savedQuote = quoteRepository.save(quote);

        // Auto-create a conversation and send an initial message
        try {
            Vendor vendor = vendorRepository.findBySlug(quote.getVendorSlug())
                    .orElseThrow(() -> new RuntimeException("Vendor not found"));

            notificationService.notify(vendor.getId(), "QUOTE", "New quote request",
                    savedQuote.getCustomerName() + " requested a quote for " + savedQuote.getServiceRequested(),
                    "/dashboard/vendor/quotes");

            Conversation conv = messagingService.getOrCreateConversation(
                    savedQuote.getId(),
                    savedQuote.getCustomerEmail(),
                    vendor.getEmail());

            Message initialMessage = new Message();
            initialMessage.setConversationId(conv.getId());
            initialMessage.setSenderId(savedQuote.getCustomerEmail());
            initialMessage.setSenderRole("CUSTOMER");
            initialMessage.setType("QUOTE_CARD");
            initialMessage.setContent(buildQuoteCardContent(savedQuote));

            messagingService.saveMessage(initialMessage);
        } catch (Exception e) {
            // Log error but don't fail the quote request
            log.error("Failed to initialize conversation for quote {}: {}", savedQuote.getId(), e.getMessage());
        }

        return savedQuote;
    }

    /**
     * A small JSON snapshot rendered by the frontend as a card in the chat
     * thread, instead of a plain-text sentence. Self-contained (doesn't
     * reference the QuoteRequest by id) so it keeps rendering correctly even
     * if that quote is later modified.
     */
    private String buildQuoteCardContent(QuoteRequest quote) {
        Map<String, Object> card = new HashMap<>();
        card.put("quoteRequestId", quote.getId());
        card.put("title", quote.getServiceRequested());
        card.put("description", quote.getProjectDescription());
        card.put("budget", quote.getBudget());
        try {
            return objectMapper.writeValueAsString(card);
        } catch (Exception e) {
            // Fall back to a plain sentence if serialization somehow fails,
            // so the message still sends even in that edge case.
            return "I have requested a quote for: " + quote.getServiceRequested() + ".\nDescription: " + quote.getProjectDescription();
        }
    }
    
    public List<QuoteRequest> getVendorQuotes(String vendorSlug) {
        return quoteRepository.findByVendorSlug(vendorSlug);
    }
    
    public List<QuoteRequest> getVendorQuotesByEmail(String email) {
        Vendor vendor = vendorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        return quoteRepository.findByVendorSlug(vendor.getSlug());
    }
    
    public List<QuoteRequest> getCustomerQuotes(String customerEmail) {
        return quoteRepository.findByCustomerEmail(customerEmail);
    }

    public List<QuoteRequest> getDisputedQuotes() {
        return quoteRepository.findByStatus("DISPUTED");
    }
    
    public QuoteRequest updateQuoteStatus(String quoteId, String status) {
        QuoteRequest quote = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new RuntimeException("Quote not found"));
        quote.setStatus(status);
        quote.setUpdatedAt(LocalDateTime.now());
        QuoteRequest saved = quoteRepository.save(quote);
        notifyCustomerOfQuoteUpdate(saved, "Your quote request for " + saved.getServiceRequested()
                + " is now " + status.toLowerCase());
        return saved;
    }

    public QuoteRequest respondToQuote(String quoteId, String response, Double estimatedCost, String estimatedTime) {
        QuoteRequest quote = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new RuntimeException("Quote not found"));
        quote.setVendorResponse(response);
        quote.setEstimatedCost(estimatedCost);
        quote.setEstimatedTime(estimatedTime);
        quote.setStatus("QUOTED");
        quote.setUpdatedAt(LocalDateTime.now());
        QuoteRequest saved = quoteRepository.save(quote);
        notifyCustomerOfQuoteUpdate(saved, "You received a quote response for " + saved.getServiceRequested());
        postResponseCardToConversation(saved);
        return saved;
    }

    /**
     * Posts the vendor's quote response into the same inbox conversation the
     * customer already sees — otherwise the response only ever showed up as
     * a quotes-page field the customer had to go find, instead of the chat
     * message it should have been all along.
     */
    private void postResponseCardToConversation(QuoteRequest quote) {
        try {
            Vendor vendor = vendorRepository.findBySlug(quote.getVendorSlug())
                    .orElseThrow(() -> new RuntimeException("Vendor not found"));

            Conversation conv = messagingService.getOrCreateConversation(
                    quote.getId(), quote.getCustomerEmail(), vendor.getEmail());

            Map<String, Object> card = new HashMap<>();
            card.put("quoteRequestId", quote.getId());
            card.put("estimatedCost", quote.getEstimatedCost());
            card.put("estimatedTime", quote.getEstimatedTime());
            card.put("response", quote.getVendorResponse());

            Message message = new Message();
            message.setConversationId(conv.getId());
            message.setSenderId(vendor.getEmail());
            message.setSenderRole("VENDOR");
            message.setType("QUOTE_RESPONSE_CARD");
            message.setContent(objectMapper.writeValueAsString(card));

            messagingService.saveMessage(message);
        } catch (Exception e) {
            log.error("Failed to post quote response to conversation for quote {}: {}", quote.getId(), e.getMessage());
        }
    }

    /** Silently does nothing if the requester never created a User account (guest quote request). */
    private void notifyCustomerOfQuoteUpdate(QuoteRequest quote, String message) {
        userRepository.findByEmail(quote.getCustomerEmail()).ifPresent(customer ->
                notificationService.notify(customer.getId(), "QUOTE", "Quote update", message,
                        "/dashboard/customer/quotes"));
    }

    /**
     * The vendor's side of the completion handoff: they've finished the work
     * (or shipped the product) and are handing it to the customer to
     * confirm. This does NOT unlock reviews yet — only confirmCompletion (or
     * the 7-day auto-complete safety net) does that, so a vendor can't
     * self-certify their way into a review.
     */
    public QuoteRequest markDelivered(String quoteId, String vendorUserId) {
        QuoteRequest quote = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new RuntimeException("Quote not found"));

        Vendor vendor = vendorRepository.findById(vendorUserId)
                .orElseThrow(() -> new RuntimeException("Only vendor accounts can mark a project delivered"));
        if (!quote.getVendorSlug().equals(vendor.getSlug())) {
            throw new RuntimeException("You can only update your own quotes");
        }
        if (!"ACCEPTED".equalsIgnoreCase(quote.getStatus())) {
            throw new RuntimeException("Only an accepted quote can be marked as delivered");
        }

        quote.setStatus("DELIVERED");
        quote.setDeliveredAt(LocalDateTime.now());
        quote.setUpdatedAt(LocalDateTime.now());
        QuoteRequest saved = quoteRepository.save(quote);

        notifyCustomerOfQuoteUpdate(saved, saved.getServiceRequested()
                + " has been marked as delivered — please confirm to complete it.");
        return saved;
    }

    /**
     * The customer's confirmation that the job/product was actually
     * delivered as expected. This is the moment the quote becomes eligible
     * for a review (see ReviewService.findLatestCompletedQuote).
     */
    public QuoteRequest confirmCompletion(String quoteId, String customerUserId) {
        QuoteRequest quote = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new RuntimeException("Quote not found"));

        User customer = userRepository.findById(customerUserId)
                .orElseThrow(() -> new RuntimeException("Only customer accounts can confirm completion"));
        if (!quote.getCustomerEmail().equalsIgnoreCase(customer.getEmail())) {
            throw new RuntimeException("You can only confirm your own quotes");
        }
        if (!"DELIVERED".equalsIgnoreCase(quote.getStatus())) {
            throw new RuntimeException("Only a delivered quote can be confirmed as completed");
        }

        return completeQuote(quote, false);
    }

    private QuoteRequest completeQuote(QuoteRequest quote, boolean autoConfirmed) {
        quote.setStatus("COMPLETED");
        quote.setCompletedAt(LocalDateTime.now());
        quote.setUpdatedAt(LocalDateTime.now());
        QuoteRequest saved = quoteRepository.save(quote);

        vendorRepository.findBySlug(saved.getVendorSlug()).ifPresent(vendor ->
                notificationService.notify(vendor.getId(), "QUOTE",
                        autoConfirmed ? "Auto-confirmed as completed" : "Completion confirmed",
                        (autoConfirmed
                                ? "The customer didn't respond within 7 days, so "
                                : "The customer confirmed ")
                                + saved.getServiceRequested() + " as completed.",
                        "/dashboard/vendor/quotes"));

        return saved;
    }

    /**
     * Safety net so an unresponsive customer can't leave a vendor stuck
     * forever waiting on a confirmation: any quote sitting in DELIVERED for
     * more than 7 days auto-completes. Runs hourly — cheap enough given the
     * expected volume, and coarse enough that "7 days" doesn't need to be
     * precise to the minute. A quote the customer disputed has already moved
     * to DISPUTED by this point, so it's naturally skipped here — disputing
     * is exactly how a customer opts out of the auto-complete clock.
     */
    @Scheduled(cron = "0 0 * * * *")
    public void autoCompleteStaleDeliveries() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(7);
        List<QuoteRequest> delivered = quoteRepository.findByStatus("DELIVERED");
        for (QuoteRequest quote : delivered) {
            if (quote.getDeliveredAt() != null && quote.getDeliveredAt().isBefore(cutoff)) {
                try {
                    completeQuote(quote, true);
                } catch (Exception e) {
                    log.error("Failed to auto-complete quote {}: {}", quote.getId(), e.getMessage());
                }
            }
        }
    }

    /**
     * The customer's alternative to confirming completion: they say the
     * delivery wasn't actually satisfactory. Moves the quote out of
     * DELIVERED entirely, which is what stops the 7-day auto-complete from
     * ever touching it — an admin has to resolve it explicitly instead.
     */
    public QuoteRequest raiseDispute(String quoteId, String customerUserId, String reason) {
        QuoteRequest quote = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new RuntimeException("Quote not found"));

        User customer = userRepository.findById(customerUserId)
                .orElseThrow(() -> new RuntimeException("Only customer accounts can raise a dispute"));
        if (!quote.getCustomerEmail().equalsIgnoreCase(customer.getEmail())) {
            throw new RuntimeException("You can only dispute your own quotes");
        }
        if (!"DELIVERED".equalsIgnoreCase(quote.getStatus())) {
            throw new RuntimeException("Only a delivered quote can be disputed");
        }
        if (reason == null || reason.trim().length() < 10) {
            throw new RuntimeException("Please explain what went wrong (at least 10 characters)");
        }

        quote.setStatus("DISPUTED");
        quote.setDisputeReason(reason.trim());
        quote.setDisputedAt(LocalDateTime.now());
        quote.setUpdatedAt(LocalDateTime.now());
        QuoteRequest saved = quoteRepository.save(quote);

        notificationService.notifyAdmins("QUOTE_DISPUTE", "Delivery disputed",
                customer.getName() + " disputed the delivery of " + saved.getServiceRequested(),
                "/dashboard/admin/disputes");

        return saved;
    }

    /**
     * Admin's resolution of a dispute: either side with the vendor (the
     * quote becomes COMPLETED, same as a normal confirmation) or reopen it
     * so the vendor can sort things out and redeliver (back to ACCEPTED).
     */
    public QuoteRequest resolveDispute(String quoteId, String resolution) {
        QuoteRequest quote = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new RuntimeException("Quote not found"));
        if (!"DISPUTED".equalsIgnoreCase(quote.getStatus())) {
            throw new RuntimeException("This quote isn't currently disputed");
        }

        if ("COMPLETE".equalsIgnoreCase(resolution)) {
            return completeQuote(quote, false);
        } else if ("REOPEN".equalsIgnoreCase(resolution)) {
            quote.setStatus("ACCEPTED");
            quote.setDeliveredAt(null);
            quote.setUpdatedAt(LocalDateTime.now());
            QuoteRequest saved = quoteRepository.save(quote);

            vendorRepository.findBySlug(saved.getVendorSlug()).ifPresent(vendor ->
                    notificationService.notify(vendor.getId(), "QUOTE", "Dispute reopened",
                            "An admin reopened the dispute for " + saved.getServiceRequested()
                                    + " — please redeliver once resolved.",
                            "/dashboard/vendor/quotes"));
            notifyCustomerOfQuoteUpdate(saved, "Your dispute for " + saved.getServiceRequested()
                    + " was reviewed — the vendor will follow up.");

            return saved;
        } else {
            throw new RuntimeException("Unknown resolution: " + resolution);
        }
    }
}
