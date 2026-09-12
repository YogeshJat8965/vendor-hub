package com.marketplace.service;

import com.marketplace.dto.ConversationDTO;
import com.marketplace.model.Conversation;
import com.marketplace.model.Message;
import com.marketplace.model.User;
import com.marketplace.model.vendor.Vendor;
import com.marketplace.repository.ConversationRepository;
import com.marketplace.repository.MessageRepository;
import com.marketplace.repository.UserRepository;
import com.marketplace.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessagingService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final NotificationService notificationService;

    public Conversation getOrCreateConversation(String quoteRequestId, String customerId, String vendorId) {
        return conversationRepository.findByQuoteRequestId(quoteRequestId)
                .orElseGet(() -> {
                    Conversation newConv = new Conversation();
                    newConv.setQuoteRequestId(quoteRequestId);
                    newConv.setCustomerId(customerId);
                    newConv.setVendorId(vendorId);
                    newConv.setCreatedAt(Instant.now());
                    newConv.setUpdatedAt(Instant.now());
                    newConv.setLastMessageTime(Instant.now());
                    return conversationRepository.save(newConv);
                });
    }

    public Message saveMessage(Message message) {
        message.setTimestamp(Instant.now());
        message.setRead(false);
        Message savedMessage = messageRepository.save(message);

        // Update conversation's last message
        conversationRepository.findById(message.getConversationId()).ifPresent(conv -> {
            String preview = previewFor(message);
            conv.setLastMessage(preview);
            conv.setLastMessageTime(message.getTimestamp());
            conv.setUpdatedAt(Instant.now());
            conversationRepository.save(conv);

            notifyRecipient(conv, message, preview);
        });

        return savedMessage;
    }

    /**
     * conversation.customerId / vendorId (and message.senderId) all store the
     * participant's email, not a Mongo id (see the field comments on
     * Conversation) — so the recipient is "whichever side isn't the sender",
     * resolved to a Mongo id here only to satisfy Notification.userId.
     *
     * The auto-generated QUOTE_CARD / QUOTE_RESPONSE_CARD messages are
     * skipped here — QuoteService already sends its own QUOTE notification
     * for those same events, so notifying again here would double up (a
     * "New quote request"/"Quote update" and a "New message" for one action).
     */
    private void notifyRecipient(Conversation conv, Message message, String preview) {
        if ("QUOTE_CARD".equals(message.getType()) || "QUOTE_RESPONSE_CARD".equals(message.getType())) {
            return;
        }
        boolean senderIsCustomer = message.getSenderId().equals(conv.getCustomerId());
        String recipientEmail = senderIsCustomer ? conv.getVendorId() : conv.getCustomerId();
        if (recipientEmail == null) {
            return;
        }

        if (senderIsCustomer) {
            vendorRepository.findByEmail(recipientEmail).ifPresent(vendor ->
                    notificationService.notify(vendor.getId(), "MESSAGE", "New message", preview,
                            "/dashboard/vendor/inbox"));
        } else {
            userRepository.findByEmail(recipientEmail).ifPresent(customer ->
                    notificationService.notify(customer.getId(), "MESSAGE", "New message", preview,
                            "/dashboard/customer/inbox"));
        }
    }

    /** A short, human-friendly line for the conversation list preview. */
    private String previewFor(Message message) {
        String type = message.getType();
        if (type == null || type.equals("TEXT")) {
            return message.getContent();
        }
        return switch (type) {
            case "IMAGE" -> "📷 Photo";
            case "VIDEO" -> "🎥 Video";
            case "PDF" -> "📄 PDF Document";
            case "QUOTE_CARD" -> "📋 New quote request";
            case "QUOTE_RESPONSE_CARD" -> "💬 Sent a quote response";
            default -> "Sent a file";
        };
    }

    /** @param viewerId the email of whoever is requesting this conversation list — used to count unread messages addressed to them. */
    private ConversationDTO mapToDTO(Conversation conv, String viewerId) {
        ConversationDTO dto = new ConversationDTO();
        dto.setId(conv.getId());
        dto.setQuoteRequestId(conv.getQuoteRequestId());
        dto.setCustomerId(conv.getCustomerId());
        dto.setVendorId(conv.getVendorId());
        dto.setLastMessage(conv.getLastMessage());
        dto.setLastMessageTime(conv.getLastMessageTime());
        dto.setCreatedAt(conv.getCreatedAt());
        dto.setUpdatedAt(conv.getUpdatedAt());
        dto.setUnreadCount(messageRepository.countByConversationIdAndSenderIdNotAndReadFalse(conv.getId(), viewerId));

        userRepository.findByEmail(conv.getCustomerId()).ifPresent(user -> {
            dto.setCustomerName(user.getName());
        });

        vendorRepository.findByEmail(conv.getVendorId()).ifPresent(vendor -> {
            dto.setVendorName(vendor.getBusinessName());
            dto.setVendorStoreName(vendor.getStoreName());
        });

        return dto;
    }

    public List<ConversationDTO> getCustomerConversations(String customerId) {
        return conversationRepository.findByCustomerIdOrderByLastMessageTimeDesc(customerId)
                .stream().map(conv -> mapToDTO(conv, customerId)).collect(Collectors.toList());
    }

    public List<ConversationDTO> getVendorConversations(String vendorId) {
        return conversationRepository.findByVendorIdOrderByLastMessageTimeDesc(vendorId)
                .stream().map(conv -> mapToDTO(conv, vendorId)).collect(Collectors.toList());
    }

    public List<Message> getConversationMessages(String conversationId) {
        return messageRepository.findByConversationIdOrderByTimestampAsc(conversationId);
    }

    /** Marks every message in this conversation not sent by viewerEmail as read — called when they open it. */
    public void markConversationRead(String conversationId, String viewerEmail) {
        List<Message> unread = messageRepository.findByConversationIdAndSenderIdNotAndReadFalse(conversationId, viewerEmail);
        unread.forEach(m -> m.setRead(true));
        messageRepository.saveAll(unread);
    }

    /** Total unread messages across every conversation this person is part of — drives the Inbox sidebar badge. */
    public long getTotalUnreadCount(String viewerEmail, boolean isVendor) {
        List<Conversation> conversations = isVendor
                ? conversationRepository.findByVendorIdOrderByLastMessageTimeDesc(viewerEmail)
                : conversationRepository.findByCustomerIdOrderByLastMessageTimeDesc(viewerEmail);
        return conversations.stream()
                .mapToLong(conv -> messageRepository.countByConversationIdAndSenderIdNotAndReadFalse(conv.getId(), viewerEmail))
                .sum();
    }
}
