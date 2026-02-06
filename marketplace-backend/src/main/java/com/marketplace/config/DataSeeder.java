package com.marketplace.config;

import com.marketplace.model.*;
import com.marketplace.model.vendor.Vendor;
import com.marketplace.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final QuoteRequestRepository quoteRequestRepository;
    private final ReviewRepository reviewRepository;
    private final PageViewRepository pageViewRepository;
    private final NotificationRepository notificationRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final CollaborationRepository collaborationRepository;

    @Override
    public void run(String... args) {
        seedCategories();
        seedQuoteRequests();
        seedReviews();
        seedPageViews();
        seedNotifications();
        seedSubscriptions();
        seedCollaborations();
        
        log.info("✅ Database seeding completed!");
        log.info("📊 Total Collections: 9");
        log.info("   - vendors: Check existing data");
        log.info("   - users: Check existing data");
        log.info("   - categories: {}", categoryRepository.count());
        log.info("   - quote_requests: {}", quoteRequestRepository.count());
        log.info("   - reviews: {}", reviewRepository.count());
        log.info("   - page_views: {}", pageViewRepository.count());
        log.info("   - notifications: {}", notificationRepository.count());
        log.info("   - subscriptions: {}", subscriptionRepository.count());
        log.info("   - collaborations: {}", collaborationRepository.count());
    }

    private void seedCategories() {
        long count = categoryRepository.count();
        if (count > 0) {
            log.info("Categories already exist. Skipping seeding. Count: {}", count);
            return;
        }

        log.info("Seeding categories...");

        List<Category> categories = Arrays.asList(
                createCategory("Plumbing", "plumbing", "Professional plumbing services for residential and commercial properties", 1),
                createCategory("Electrical", "electrical", "Licensed electrical services and installations", 2),
                createCategory("HVAC", "hvac", "Heating, ventilation, and air conditioning services", 3),
                createCategory("Carpentry", "carpentry", "Custom woodworking and carpentry services", 4),
                createCategory("Painting", "painting", "Interior and exterior painting services", 5),
                createCategory("Roofing", "roofing", "Roof installation, repair, and maintenance", 6),
                createCategory("Landscaping", "landscaping", "Landscape design, installation, and maintenance", 7),
                createCategory("Cleaning", "cleaning", "Professional cleaning services for homes and offices", 8),
                createCategory("Pest Control", "pest-control", "Pest inspection and extermination services", 9),
                createCategory("Handyman", "handyman", "General repair and maintenance services", 10),
                createCategory("Flooring", "flooring", "Flooring installation and refinishing", 11),
                createCategory("Moving", "moving", "Professional moving and relocation services", 12),
                createCategory("Locksmith", "locksmith", "Lock installation, repair, and emergency services", 13),
                createCategory("Appliance Repair", "appliance-repair", "Repair and maintenance of home appliances", 14),
                createCategory("Window Installation", "window-installation", "Window installation and replacement services", 15),
                createCategory("Garage Door", "garage-door", "Garage door installation and repair", 16),
                createCategory("Pool Service", "pool-service", "Pool maintenance and repair services", 17),
                createCategory("Drywall", "drywall", "Drywall installation and repair", 18),
                createCategory("Masonry", "masonry", "Brick, stone, and concrete work", 19),
                createCategory("Fencing", "fencing", "Fence installation and repair services", 20)
        );

        categoryRepository.saveAll(categories);
        log.info("Successfully seeded {} categories", categories.size());
    }

    private Category createCategory(String name, String slug, String description, int order) {
        Category category = new Category();
        category.setName(name);
        category.setSlug(slug);
        category.setDescription(description);
        category.setVisible(true);
        category.setDisplayOrder(order);
        category.setCreatedAt(Instant.now());
        category.setUpdatedAt(Instant.now());
        return category;
    }

    private void seedQuoteRequests() {
        long count = quoteRequestRepository.count();
        if (count > 0) {
            log.info("Quote requests already exist. Skipping seeding. Count: {}", count);
            return;
        }

        log.info("Seeding quote requests...");

        List<QuoteRequest> quotes = Arrays.asList(
                createQuoteRequest("johns-electricians", "Sarah Johnson", "sarah@example.com", "555-0101", 
                    "Electrical Inspection", "Need full home electrical inspection before purchase", 500.0, "PENDING"),
                createQuoteRequest("johns-electricians", "Mike Davis", "mike@example.com", "555-0102",
                    "Panel Upgrade", "Upgrade electrical panel to 200 amp service", 2500.0, "ACCEPTED"),
                createQuoteRequest("alifebot", "Emily Brown", "emily@example.com", "555-0103",
                    "Pool Cleaning", "Weekly pool maintenance service", 150.0, "COMPLETED"),
                createQuoteRequest("johns-electricians", "John Smith", "john@example.com", "555-0104",
                    "Outlet Installation", "Install 5 new outlets in garage", 400.0, "PENDING"),
                createQuoteRequest("alifebot", "Lisa Wilson", "lisa@example.com", "555-0105",
                    "Pool Repair", "Pool pump not working properly", 800.0, "PENDING")
        );

        quoteRequestRepository.saveAll(quotes);
        log.info("Successfully seeded {} quote requests", quotes.size());
    }

    private QuoteRequest createQuoteRequest(String vendorSlug, String customerName, String email, 
                                           String mobile, String service, String description, 
                                           Double budget, String status) {
        QuoteRequest quote = new QuoteRequest();
        quote.setVendorSlug(vendorSlug);
        quote.setCustomerName(customerName);
        quote.setCustomerEmail(email);
        quote.setCustomerMobile(mobile);
        quote.setServiceRequested(service);
        quote.setProjectDescription(description);
        quote.setBudget(budget);
        quote.setStatus(status);
        quote.setPreferredDate(LocalDateTime.now().plusDays(7));
        quote.setCreatedAt(LocalDateTime.now().minusDays(3));
        quote.setUpdatedAt(LocalDateTime.now());
        return quote;
    }

    private void seedReviews() {
        long count = reviewRepository.count();
        if (count > 0) {
            log.info("Reviews already exist. Skipping seeding. Count: {}", count);
            return;
        }

        log.info("Seeding reviews...");

        List<Review> reviews = Arrays.asList(
                createReview("johns-electricians", "Sarah Johnson", "sarah@example.com", 5, 
                    "Excellent service! Very professional and completed work ahead of schedule.", true),
                createReview("johns-electricians", "Mike Davis", "mike@example.com", 5,
                    "Great electrician! Fair pricing and quality work.", true),
                createReview("johns-electricians", "Robert Lee", "robert@example.com", 4,
                    "Good service, but took a bit longer than expected. Overall satisfied.", true),
                createReview("alifebot", "Emily Brown", "emily@example.com", 5,
                    "Amazing pool service! Very reliable and thorough.", true),
                createReview("alifebot", "Lisa Wilson", "lisa@example.com", 5,
                    "Best pool maintenance service I've used. Highly recommend!", true)
        );

        reviewRepository.saveAll(reviews);
        log.info("Successfully seeded {} reviews", reviews.size());
    }

    private Review createReview(String vendorSlug, String customerName, String email, 
                               Integer rating, String comment, boolean verified) {
        Review review = new Review();
        review.setVendorSlug(vendorSlug);
        review.setCustomerName(customerName);
        review.setCustomerEmail(email);
        review.setRating(rating);
        review.setComment(comment);
        review.setFlagged(false);
        review.setVerifiedPurchase(verified);
        review.setCreatedAt(LocalDateTime.now().minusDays((int)(Math.random() * 30)));
        return review;
    }

    private void seedPageViews() {
        long count = pageViewRepository.count();
        if (count > 0) {
            log.info("Page views already exist. Skipping seeding. Count: {}", count);
            return;
        }

        log.info("Seeding page views...");

        List<PageView> pageViews = Arrays.asList(
                createPageView("johns-electricians", "127.0.0.1"),
                createPageView("johns-electricians", "192.168.1.100"),
                createPageView("johns-electricians", "10.0.0.50"),
                createPageView("alifebot", "127.0.0.1"),
                createPageView("alifebot", "192.168.1.101"),
                createPageView("johns-electricians", "10.0.0.51"),
                createPageView("alifebot", "192.168.1.102")
        );

        pageViewRepository.saveAll(pageViews);
        log.info("Successfully seeded {} page views", pageViews.size());
    }

    private PageView createPageView(String vendorSlug, String ipAddress) {
        PageView pageView = new PageView();
        pageView.setVendorSlug(vendorSlug);
        pageView.setIpAddress(ipAddress);
        pageView.setViewedAt(LocalDateTime.now().minusDays((int)(Math.random() * 7)));
        return pageView;
    }

    private void seedNotifications() {
        long count = notificationRepository.count();
        if (count > 0) {
            log.info("Notifications already exist. Skipping seeding. Count: {}", count);
            return;
        }

        log.info("Seeding notifications...");

        List<Notification> notifications = Arrays.asList(
                createNotification("john@johnsplumbing.com", "New Quote Request", 
                    "You have received a new quote request for Electrical Inspection", "QUOTE_REQUEST", false),
                createNotification("john@johnsplumbing.com", "Quote Accepted", 
                    "Your quote for Panel Upgrade has been accepted", "QUOTE_ACCEPTED", true),
                createNotification("yogeshjat8965@gmail.com", "New Review", 
                    "You received a 5-star review for your pool service", "REVIEW", false)
        );

        notificationRepository.saveAll(notifications);
        log.info("Successfully seeded {} notifications", notifications.size());
    }

    private Notification createNotification(String userEmail, String title, String message, 
                                          String type, boolean read) {
        Notification notification = new Notification();
        notification.setUserId(userEmail); // Using email as userId
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRead(read);
        notification.setCreatedAt(LocalDateTime.now().minusHours((int)(Math.random() * 48)));
        return notification;
    }

    private void seedSubscriptions() {
        long count = subscriptionRepository.count();
        if (count > 0) {
            log.info("Subscriptions already exist. Skipping seeding. Count: {}", count);
            return;
        }

        log.info("Seeding subscriptions...");

        List<Subscription> subscriptions = Arrays.asList(
                createSubscription("johns-electricians", "BASIC", "ACTIVE", 29.99),
                createSubscription("alifebot", "PREMIUM", "ACTIVE", 99.99),
                createSubscription("demo-vendor", "BASIC", "TRIAL", 0.0)
        );

        subscriptionRepository.saveAll(subscriptions);
        log.info("Successfully seeded {} subscriptions", subscriptions.size());
    }

    private Subscription createSubscription(String vendorSlug, String plan, String status, Double price) {
        Subscription subscription = new Subscription();
        subscription.setVendorSlug(vendorSlug);
        subscription.setPlan(plan);
        subscription.setStatus(status);
        subscription.setPrice(price);
        subscription.setStartDate(java.time.LocalDate.now().minusMonths(1));
        subscription.setEndDate(java.time.LocalDate.now().plusMonths(11));
        subscription.setAutoRenew(true);
        return subscription;
    }

    private void seedCollaborations() {
        long count = collaborationRepository.count();
        if (count > 0) {
            log.info("Collaborations already exist. Skipping seeding. Count: {}", count);
            return;
        }

        log.info("Seeding collaborations...");

        List<Collaboration> collaborations = Arrays.asList(
                createCollaboration("johns-electricians", "Need Plumber for Joint Project", 
                    "Looking for licensed plumber to collaborate on residential renovation", 
                    Arrays.asList("Plumbing", "HVAC"), "Residential Renovation", "Mumbai", "$5000-$10000", "OPEN"),
                createCollaboration("alifebot", "Pool & Landscaping Partnership",
                    "Seeking landscaping expert for comprehensive outdoor projects",
                    Arrays.asList("Landscaping", "Fencing"), "Commercial Project", "Mumbai", "$10000+", "OPEN")
        );

        collaborationRepository.saveAll(collaborations);
        log.info("Successfully seeded {} collaborations", collaborations.size());
    }

    private Collaboration createCollaboration(String postedBy, String title, String description,
                                            List<String> lookingFor, String projectType, 
                                            String location, String budget, String status) {
        Collaboration collaboration = new Collaboration();
        collaboration.setPostedByVendorSlug(postedBy);
        collaboration.setTitle(title);
        collaboration.setDescription(description);
        collaboration.setLookingFor(lookingFor);
        collaboration.setProjectType(projectType);
        collaboration.setLocation(location);
        collaboration.setBudget(budget);
        collaboration.setStatus(status);
        collaboration.setCreatedAt(LocalDateTime.now().minusDays(5));
        return collaboration;
    }
}
