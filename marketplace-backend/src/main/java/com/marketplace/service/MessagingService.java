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
            conv.setLastMessage(previewFor(message));
            conv.setLastMessageTime(message.getTimestamp());
            conv.setUpdatedAt(Instant.now());
            conversationRepository.save(conv);
        });

        return savedMessage;
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
            default -> "Sent a file";
        };
    }

    private ConversationDTO mapToDTO(Conversation conv) {
        ConversationDTO dto = new ConversationDTO();
        dto.setId(conv.getId());
        dto.setQuoteRequestId(conv.getQuoteRequestId());
        dto.setCustomerId(conv.getCustomerId());
        dto.setVendorId(conv.getVendorId());
        dto.setLastMessage(conv.getLastMessage());
        dto.setLastMessageTime(conv.getLastMessageTime());
        dto.setCreatedAt(conv.getCreatedAt());
        dto.setUpdatedAt(conv.getUpdatedAt());
        
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
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<ConversationDTO> getVendorConversations(String vendorId) {
        return conversationRepository.findByVendorIdOrderByLastMessageTimeDesc(vendorId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<Message> getConversationMessages(String conversationId) {
        return messageRepository.findByConversationIdOrderByTimestampAsc(conversationId);
    }
}
