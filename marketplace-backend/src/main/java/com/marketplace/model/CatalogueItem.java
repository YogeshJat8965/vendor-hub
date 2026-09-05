package com.marketplace.model;

import lombok.Data;
import java.util.List;

@Data
public class CatalogueItem {
    
    private String id; // Typically generated as UUID string for sub-items
    
    private String title;
    
    private String description;
    
    private Double startingPrice;
    
    private String priceRange; // e.g. "$1000 - $5000"
    
    private List<String> images; // 3 for Basic, 7 for Premium
    
    // Premium Fields
    private String materialsDetails;
    
    private String projectTimeline;
    
    private List<String> beforeAfterImages;
    
    private String videoUrl;
    
    private String pdfBrochureUrl;
}
