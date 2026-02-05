package com.marketplace.dto;

import lombok.Data;

@Data
public class DashboardMetrics {
    private String vendorName;
    private String slug;
    private String subscriptionPlan;
    
    private long totalViews;
    private long recentViews7d;
    private long recentViews30d;
    
    private long totalLeads;
    private long recentLeads7d;
    
    private long totalReviews;
    private Double averageRating;
    
    private Double conversionRate;
}
