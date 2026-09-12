package com.marketplace.repository;

import com.marketplace.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findByConversationIdOrderByTimestampAsc(String conversationId);
    long countByConversationIdAndSenderIdNotAndReadFalse(String conversationId, String senderId);
    List<Message> findByConversationIdAndSenderIdNotAndReadFalse(String conversationId, String senderId);
}
