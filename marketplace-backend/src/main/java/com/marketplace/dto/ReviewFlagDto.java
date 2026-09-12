package com.marketplace.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReviewFlagDto {
    // Category: FAKE, OFFENSIVE, SPAM, COMPETITOR, OTHER
    @NotBlank
    private String reason;

    // Optional free-text explanation from the flagging vendor.
    private String details;
}
