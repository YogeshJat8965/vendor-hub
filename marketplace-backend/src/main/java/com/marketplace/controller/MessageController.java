package com.marketplace.controller;

import com.marketplace.model.Conversation;
import com.marketplace.model.Message;
import com.marketplace.service.MessagingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class MessageController {

    private final MessagingService messagingService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * WebSocket Endpoint
     * Clients send messages to /app/chat.sendMessage
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload Message chatMessage) {
        // Save message to database
        Message savedMessage = messagingService.saveMessage(chatMessage);
        
        // Broadcast the message to the specific conversation topic
        // We can send it to a queue for the specific receiver, or to a conversation topic.
        // Easiest is to send to a conversation topic that both parties subscribe to.
        // E.g., clients subscribe to /topic/conversation/{conversationId}
        messagingTemplate.convertAndSend("/topic/conversation/" + savedMessage.getConversationId(), savedMessage);
    }

    /**
     * REST Endpoints for chat history and conversation lists
     */

    @GetMapping("/api/conversations/customer/{customerId}")
    public ResponseEntity<?> getCustomerConversations(@PathVariable String customerId) {
        try {
            List<Conversation> conversations = messagingService.getCustomerConversations(customerId);
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/api/conversations/vendor/{vendorId}")
    public ResponseEntity<?> getVendorConversations(@PathVariable String vendorId) {
        try {
            List<Conversation> conversations = messagingService.getVendorConversations(vendorId);
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/api/conversations/{conversationId}/messages")
    public ResponseEntity<?> getConversationMessages(@PathVariable String conversationId) {
        try {
            List<Message> messages = messagingService.getConversationMessages(conversationId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/api/conversations/init")
    public ResponseEntity<?> initConversation(@RequestBody Map<String, String> payload) {
        try {
            String quoteId = payload.get("quoteRequestId");
            String customerId = payload.get("customerId");
            String vendorId = payload.get("vendorId");
            
            Conversation conv = messagingService.getOrCreateConversation(quoteId, customerId, vendorId);
            return ResponseEntity.ok(conv);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
