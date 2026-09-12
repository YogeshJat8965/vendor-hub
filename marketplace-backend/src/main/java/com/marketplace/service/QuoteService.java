package com.marketplace.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marketplace.model.QuoteRequest;
import com.marketplace.model.vendor.Vendor;
import com.marketplace.repository.QuoteRequestRepository;
import com.marketplace.repository.VendorRepository;
import com.marketplace.model.Conversation;
import com.marketplace.model.Message;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    public QuoteRequest createQuote(QuoteRequest quote) {
        quote.setStatus("NEW");
        quote.setCreatedAt(LocalDateTime.now());
        quote.setUpdatedAt(LocalDateTime.now());
        QuoteRequest savedQuote = quoteRepository.save(quote);

        // Auto-create a conversation and send an initial message
        try {
            Vendor vendor = vendorRepository.findBySlug(quote.getVendorSlug())
                    .orElseThrow(() -> new RuntimeException("Vendor not found"));

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
    
    public QuoteRequest updateQuoteStatus(String quoteId, String status) {
        QuoteRequest quote = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new RuntimeException("Quote not found"));
        quote.setStatus(status);
        quote.setUpdatedAt(LocalDateTime.now());
        return quoteRepository.save(quote);
    }
    
    public QuoteRequest respondToQuote(String quoteId, String response, Double estimatedCost, String estimatedTime) {
        QuoteRequest quote = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new RuntimeException("Quote not found"));
        quote.setVendorResponse(response);
        quote.setEstimatedCost(estimatedCost);
        quote.setEstimatedTime(estimatedTime);
        quote.setStatus("QUOTED");
        quote.setUpdatedAt(LocalDateTime.now());
        return quoteRepository.save(quote);
    }
}
