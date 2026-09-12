package com.marketplace.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "reviews")
public class Review {
    @Id
    private String id;

    private String vendorSlug;

    private String customerName;

    private String customerEmail;

    // The ACCEPTED quote that made this customer eligible to review this
    // vendor. Kept for traceability/audit — e.g. if a review is disputed,
    // admin can look at the real engagement behind it.
    private String quoteRequestId;

    private Integer rating; // 1-5

    private String comment;

    private List<String> images;

    // True whenever the review passed the eligibility check (i.e. always,
    // for reviews created through the normal flow) — kept explicit so it's
    // visible to customers as a trust signal on the vendor's profile.
    private boolean verifiedPurchase;

    private boolean flagged;

    private String flagReason; // category: FAKE, OFFENSIVE, SPAM, COMPETITOR, OTHER

    private String flagDetails; // free-text explanation from the flagging vendor

    private LocalDateTime flaggedAt;

    private LocalDateTime createdAt;
}
