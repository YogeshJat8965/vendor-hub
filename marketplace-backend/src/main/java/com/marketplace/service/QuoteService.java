package com.marketplace.service;

import com.marketplace.model.QuoteRequest;
import com.marketplace.repository.QuoteRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuoteService {
    
    private final QuoteRequestRepository quoteRepository;
    
    public QuoteRequest createQuote(QuoteRequest quote) {
        quote.setStatus("NEW");
        quote.setCreatedAt(LocalDateTime.now());
        quote.setUpdatedAt(LocalDateTime.now());
        return quoteRepository.save(quote);
    }
    
    public List<QuoteRequest> getVendorQuotes(String vendorSlug) {
        return quoteRepository.findByVendorSlug(vendorSlug);
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
}
