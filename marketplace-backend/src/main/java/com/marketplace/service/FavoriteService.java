package com.marketplace.service;

import com.marketplace.model.Favorite;
import com.marketplace.model.Plan;
import com.marketplace.model.vendor.Vendor;
import com.marketplace.repository.FavoriteRepository;
import com.marketplace.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Customers favoriting vendors — server-side, so it survives across devices
 * and so a Premium vendor can actually be told about it in real time.
 *
 * <p>Replaces what used to live only in the browser's {@code localStorage}: a
 * favorite the server never knew about could never notify anyone.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final VendorRepository vendorRepository;
    private final SubscriptionService subscriptionService;
    private final NotificationService notificationService;

    /** Toggles the favorite, returning {@code true} if the vendor is now favorited, {@code false} if it was just removed. */
    public boolean toggle(String customerId, String customerName, String vendorId) {
        Optional<Favorite> existing = favoriteRepository.findByCustomerIdAndVendorId(customerId, vendorId);
        if (existing.isPresent()) {
            favoriteRepository.deleteByCustomerIdAndVendorId(customerId, vendorId);
            return false;
        }

        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found"));

        Favorite favorite = new Favorite();
        favorite.setCustomerId(customerId);
        favorite.setCustomerName(customerName);
        favorite.setVendorId(vendorId);
        favorite.setVendorSlug(vendor.getSlug());
        favorite.setCreatedAt(Instant.now());
        try {
            favoriteRepository.save(favorite);
        } catch (DuplicateKeyException e) {
            // Two clicks raced each other — already favorited, nothing more to do.
            return true;
        }

        notifyVendorIfEntitled(vendor, customerId, customerName);
        return true;
    }

    /**
     * A Premium vendor gets a real-time nudge whenever someone favorites
     * them — Free and Basic vendors still gain the favorite itself (it still
     * counts, and still surfaces once they upgrade), they just aren't
     * notified about it as it happens.
     *
     * <p>The link deep-links straight into a chat with that customer
     * ({@code InboxUI}'s {@code customerId} param starts/reuses the
     * conversation via {@code POST /api/vendor/conversations/start-with-customer})
     * so a Premium vendor can act on the favorite immediately, not just see it.
     */
    private void notifyVendorIfEntitled(Vendor vendor, String customerId, String customerName) {
        Plan plan = subscriptionService.getEffectivePlan(vendor);
        if (!plan.isAllowsFavoritesInsights()) {
            return;
        }
        String displayName = (customerName == null || customerName.isBlank()) ? "Someone" : customerName;
        notificationService.notify(vendor.getId(), "FAVORITE", "New favorite",
                displayName + " added your business to their favorites.",
                "/dashboard/vendor/inbox?customerId=" + customerId);
    }

    public boolean isFavorited(String customerId, String vendorId) {
        return favoriteRepository.findByCustomerIdAndVendorId(customerId, vendorId).isPresent();
    }

    public List<Favorite> listForCustomer(String customerId) {
        return favoriteRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    public List<Favorite> listForVendor(String vendorId) {
        return favoriteRepository.findByVendorIdOrderByCreatedAtDesc(vendorId);
    }

    public long countForVendor(String vendorId) {
        return favoriteRepository.countByVendorId(vendorId);
    }
}
