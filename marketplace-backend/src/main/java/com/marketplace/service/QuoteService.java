package com.marketplace.service;

import com.marketplace.model.QuoteRequest;
import com.marketplace.model.vendor.Vendor;
import com.marketplace.repository.QuoteRequestRepository;
import com.marketplace.repository.VendorRepository;
import com.marketplace.model.Conversation;
import com.marketplace.model.Message;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuoteService {
    
    private final QuoteRequestRepository quoteRepository;
    private final VendorRepository vendorRepository;
    private final MessagingService messagingService;
    
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
            initialMessage.setContent("I have requested a quote for: " + savedQuote.getServiceRequested() + ".\nDescription: " + savedQuote.getProjectDescription());
            initialMessage.setType("TEXT");
            
            messagingService.saveMessage(initialMessage);
        } catch (Exception e) {
            // Log error but don't fail the quote request
            System.err.println("Failed to initialize conversation for quote: " + e.getMessage());
        }
        
        return savedQuote;
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
