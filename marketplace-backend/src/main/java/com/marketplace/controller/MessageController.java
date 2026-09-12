package com.marketplace.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.marketplace.model.Conversation;
import com.marketplace.model.Message;
import com.marketplace.model.vendor.Vendor;
import com.marketplace.repository.ConversationRepository;
import com.marketplace.repository.VendorRepository;
import com.marketplace.service.MessagingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class MessageController {

    private static final long MAX_IMAGE_BYTES = 10L * 1024 * 1024;
    private static final long MAX_PDF_BYTES = 20L * 1024 * 1024;
    private static final long MAX_VIDEO_BYTES = 100L * 1024 * 1024;

    private final MessagingService messagingService;
    private final SimpMessagingTemplate messagingTemplate;
    private final Cloudinary cloudinary;
    private final ConversationRepository conversationRepository;
    private final VendorRepository vendorRepository;

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
            List<com.marketplace.dto.ConversationDTO> conversations = messagingService.getCustomerConversations(customerId);
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/api/conversations/vendor/{vendorId}")
    public ResponseEntity<?> getVendorConversations(@PathVariable String vendorId) {
        try {
            List<com.marketplace.dto.ConversationDTO> conversations = messagingService.getVendorConversations(vendorId);
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

    @PutMapping("/api/conversations/{conversationId}/read")
    public ResponseEntity<?> markConversationRead(@PathVariable String conversationId, @RequestParam String viewerEmail) {
        try {
            messagingService.markConversationRead(conversationId, viewerEmail);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/api/conversations/unread-count")
    public ResponseEntity<?> getTotalUnreadCount(@RequestParam String email, @RequestParam String role) {
        long count = messagingService.getTotalUnreadCount(email, "VENDOR".equalsIgnoreCase(role));
        return ResponseEntity.ok(Map.of("count", count));
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

    /**
     * Uploads an inbox attachment (image/video/PDF) to Cloudinary and returns
     * its URL. The actual chat Message is created separately over the
     * WebSocket (chat.sendMessage), same as a plain text message — this
     * endpoint's only job is turning the file into a URL.
     *
     * Size limits are enforced here server-side, not just in the frontend,
     * since a client-side check alone can always be bypassed by calling the
     * API directly.
     */
    @PostMapping("/api/conversations/upload")
    public ResponseEntity<?> uploadAttachment(
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type,
            @RequestParam("conversationId") String conversationId) {
        try {
            String attachmentType = type == null ? "" : type.toUpperCase();

            switch (attachmentType) {
                case "IMAGE" -> {
                    if (file.getSize() > MAX_IMAGE_BYTES) {
                        return ResponseEntity.badRequest().body(Map.of("error", "Image must be under 10MB."));
                    }
                }
                case "VIDEO", "PDF" -> {
                    long limit = attachmentType.equals("VIDEO") ? MAX_VIDEO_BYTES : MAX_PDF_BYTES;
                    if (file.getSize() > limit) {
                        String label = attachmentType.equals("VIDEO") ? "Video must be under 100MB." : "PDF must be under 20MB.";
                        return ResponseEntity.badRequest().body(Map.of("error", label));
                    }

                    Conversation conversation = conversationRepository.findById(conversationId)
                            .orElseThrow(() -> new RuntimeException("Conversation not found"));
                    Vendor vendor = vendorRepository.findByEmail(conversation.getVendorId()).orElse(null);
                    if (!isMediaAllowedForVendorPlan(vendor)) {
                        return ResponseEntity.badRequest().body(Map.of(
                                "error", "Video and PDF attachments are a Premium feature for this vendor."));
                    }
                }
                default -> {
                    return ResponseEntity.badRequest().body(Map.of("error", "Unsupported attachment type: " + type));
                }
            }

            // PDFs must upload as "raw", not "auto" (which Cloudinary treats
            // as "image" for PDFs): recent Cloudinary accounts block public
            // delivery of non-image files served through the image endpoint
            // by default, which makes the resulting URL 401. "raw" delivery
            // isn't subject to that restriction.
            //
            // NOTE: passing format:"pdf" here (tried and reverted) makes
            // Cloudinary recognize and block the file the same way, even as
            // "raw" — the restriction is keyed on recognized format, not
            // resource_type. So this stays plain "raw" with no format hint:
            // it works, but Cloudinary always serves it as
            // application/octet-stream with Content-Disposition: attachment
            // and no file extension. The only way to get correct content-type
            // and inline display is enabling "Allow delivery of PDF and ZIP
            // files" in the Cloudinary console's Security settings.
            String resourceType = attachmentType.equals("PDF") ? "raw" : "auto";
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("resource_type", resourceType));
            String fileUrl = uploadResult.get("url").toString();

            return ResponseEntity.ok(Map.of("url", fileUrl, "type", attachmentType));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * TODO(payments): once subscription plans are enforced, gate this on
     * vendor.getSubscriptionPlan().equals("PREMIUM") — for the whole
     * conversation thread, so both the vendor and their customer can send
     * PDF/video only when that vendor is on Premium. Left open for everyone
     * during testing, as agreed.
     */
    private boolean isMediaAllowedForVendorPlan(Vendor vendor) {
        return true;
    }
}
