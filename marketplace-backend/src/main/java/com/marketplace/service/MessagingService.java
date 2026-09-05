package com.marketplace.service;

import com.marketplace.model.Conversation;
import com.marketplace.model.Message;
import com.marketplace.repository.ConversationRepository;
import com.marketplace.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessagingService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;

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
            conv.setLastMessage(message.getType().equals("TEXT") ? message.getContent() : "Sent a file");
            conv.setLastMessageTime(message.getTimestamp());
            conv.setUpdatedAt(Instant.now());
            conversationRepository.save(conv);
        });

        return savedMessage;
    }

    public List<Conversation> getCustomerConversations(String customerId) {
        return conversationRepository.findByCustomerIdOrderByLastMessageTimeDesc(customerId);
    }

    public List<Conversation> getVendorConversations(String vendorId) {
        return conversationRepository.findByVendorIdOrderByLastMessageTimeDesc(vendorId);
    }

    public List<Message> getConversationMessages(String conversationId) {
        return messageRepository.findByConversationIdOrderByTimestampAsc(conversationId);
    }
}
