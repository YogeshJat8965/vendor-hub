package com.marketplace.repository;

import com.marketplace.model.Conversation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends MongoRepository<Conversation, String> {
    List<Conversation> findByCustomerIdOrderByLastMessageTimeDesc(String customerId);
    List<Conversation> findByVendorIdOrderByLastMessageTimeDesc(String vendorId);
    Optional<Conversation> findByQuoteRequestId(String quoteRequestId);
}
