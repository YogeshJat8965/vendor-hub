package com.marketplace.controller;

import com.marketplace.model.QuoteRequest;
import com.marketplace.service.QuoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/quotes")
@RequiredArgsConstructor
public class QuoteController {
    
    private final QuoteService quoteService;
    
    @PostMapping
    public ResponseEntity<?> createQuote(@RequestBody QuoteRequest quote) {
        try {
            QuoteRequest created = quoteService.createQuote(quote);
            return ResponseEntity.ok(Map.of("quote", created, "message", "Quote request submitted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/request")
    public ResponseEntity<?> createQuoteRequest(@RequestBody QuoteRequest quote) {
        try {
            QuoteRequest created = quoteService.createQuote(quote);
            return ResponseEntity.ok(Map.of("quote", created, "message", "Quote request submitted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/vendor/{vendorSlug}")
    public ResponseEntity<?> getVendorQuotes(@PathVariable String vendorSlug) {
        return ResponseEntity.ok(quoteService.getVendorQuotes(vendorSlug));
    }
    
    @GetMapping("/vendor")
    public ResponseEntity<?> getVendorQuotesByEmail(@RequestParam String email) {
        return ResponseEntity.ok(quoteService.getVendorQuotesByEmail(email));
    }
    
    @GetMapping("/customer/{email}")
    public ResponseEntity<?> getCustomerQuotes(@PathVariable String email) {
        return ResponseEntity.ok(quoteService.getCustomerQuotes(email));
    }
    
    @GetMapping("/customer")
    public ResponseEntity<?> getCustomerQuotesByEmail(@RequestParam String email) {
        return ResponseEntity.ok(quoteService.getCustomerQuotes(email));
    }
    
    @PutMapping("/{quoteId}/status")
    public ResponseEntity<?> updateQuoteStatus(
            @PathVariable String quoteId,
            @RequestBody Map<String, String> payload) {
        try {
            String status = payload.get("status");
            QuoteRequest updated = quoteService.updateQuoteStatus(quoteId, status);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/{quoteId}/respond")
    public ResponseEntity<?> respondToQuote(
            @PathVariable String quoteId,
            @RequestBody Map<String, Object> payload) {
        try {
            String response = (String) payload.get("response");
            Double estimatedCost = payload.get("estimatedCost") != null ? 
                ((Number) payload.get("estimatedCost")).doubleValue() : null;
            String estimatedTime = (String) payload.get("estimatedTime");
            
            QuoteRequest updated = quoteService.respondToQuote(quoteId, response, estimatedCost, estimatedTime);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
