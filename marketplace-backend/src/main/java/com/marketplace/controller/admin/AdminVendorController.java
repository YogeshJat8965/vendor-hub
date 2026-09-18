package com.marketplace.controller.admin;

import com.marketplace.dto.admin.AdminVendorDto;
import com.marketplace.repository.VendorRepository;
import com.marketplace.service.AdminPeopleService;
import com.marketplace.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Vendor lifecycle: approval, rejection and suspension.
 *
 * <p>Vendors live in their own {@code vendors} collection and are never
 * {@code User} documents, so none of this overlaps {@link AdminUserController}.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminVendorController {

    private final VendorRepository vendorRepository;
    private final NotificationService notificationService;
    private final AdminPeopleService adminPeopleService;

    /**
     * Every vendor, mapped through {@link AdminVendorDto} so the stored
     * {@code passwordHash} stays on the server.
     */
    @GetMapping("/vendors")
    public ResponseEntity<?> getAllVendors() {
        List<AdminVendorDto> vendors = vendorRepository.findAll().stream()
                .map(AdminVendorDto::from)
                .toList();
        return ResponseEntity.ok(vendors);
    }

    /** One vendor plus their quote pipeline, ratings, catalogue and subscription. */
    @GetMapping("/vendors/{vendorId}/detail")
    public ResponseEntity<?> getVendorDetail(@PathVariable String vendorId) {
        return adminPeopleService.getVendorDetail(vendorId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** Distinct vendor types present in the data, for the directory filter. */
    @GetMapping("/vendors/types")
    public ResponseEntity<?> getVendorTypes() {
        return ResponseEntity.ok(adminPeopleService.getVendorTypes());
    }

    @PutMapping("/vendors/{vendorId}/approve")
    public ResponseEntity<?> approveVendor(@PathVariable String vendorId) {
        return vendorRepository.findById(vendorId)
                .<ResponseEntity<?>>map(vendor -> {
                    vendor.setStatus("ACTIVE");
                    // A previous rejection no longer applies once approved.
                    vendor.setRejectionReason(null);
                    vendorRepository.save(vendor);
                    notificationService.notify(vendor.getId(), "ACCOUNT", "Account approved",
                            "Your vendor account has been approved. You're live on VendorHub.", "/dashboard/vendor");
                    return ResponseEntity.ok(Map.of("message", "Vendor approved"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/vendors/{vendorId}/reject")
    public ResponseEntity<?> rejectVendor(@PathVariable String vendorId,
                                          @RequestBody(required = false) Map<String, String> payload) {
        String reason = payload != null ? payload.get("reason") : null;

        return vendorRepository.findById(vendorId)
                .<ResponseEntity<?>>map(vendor -> {
                    vendor.setStatus("REJECTED");
                    // The admin UI has always collected a reason; until now it
                    // was discarded, so the vendor was told nothing.
                    vendor.setRejectionReason(reason);
                    vendorRepository.save(vendor);
                    notificationService.notify(vendor.getId(), "ACCOUNT", "Account rejected",
                            messageWithReason("Your vendor account application was rejected.", reason),
                            "/dashboard/vendor");
                    return ResponseEntity.ok(Map.of("message", "Vendor rejected"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/vendors/{vendorId}/suspend")
    public ResponseEntity<?> suspendVendor(@PathVariable String vendorId,
                                           @RequestBody(required = false) Map<String, String> payload) {
        String reason = payload != null ? payload.get("reason") : null;

        return vendorRepository.findById(vendorId)
                .<ResponseEntity<?>>map(vendor -> {
                    vendor.setStatus("SUSPENDED");
                    vendor.setRejectionReason(reason);
                    vendorRepository.save(vendor);
                    notificationService.notify(vendor.getId(), "ACCOUNT", "Account suspended",
                            messageWithReason("Your vendor account has been suspended. Contact support for details.", reason),
                            "/dashboard/vendor");
                    return ResponseEntity.ok(Map.of("message", "Vendor suspended"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /** Reinstates a suspended or rejected vendor without re-running approval. */
    @PutMapping("/vendors/{vendorId}/reinstate")
    public ResponseEntity<?> reinstateVendor(@PathVariable String vendorId) {
        return vendorRepository.findById(vendorId)
                .<ResponseEntity<?>>map(vendor -> {
                    vendor.setStatus("ACTIVE");
                    vendor.setRejectionReason(null);
                    vendorRepository.save(vendor);
                    notificationService.notify(vendor.getId(), "ACCOUNT", "Account reinstated",
                            "Your vendor account has been reinstated. You're live on VendorHub again.",
                            "/dashboard/vendor");
                    return ResponseEntity.ok(Map.of("message", "Vendor reinstated"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Applies one lifecycle action to several vendors at once — the approval
     * queue is the case that matters, where an admin clears a backlog rather
     * than opening each vendor in turn.
     *
     * <p>Partial success is reported rather than failing the whole batch: one
     * missing id should not discard the other nine decisions.
     */
    @PutMapping("/vendors/bulk")
    public ResponseEntity<?> bulkAction(@RequestBody Map<String, Object> payload) {
        String action = String.valueOf(payload.get("action"));
        String reason = payload.get("reason") != null ? String.valueOf(payload.get("reason")) : null;

        @SuppressWarnings("unchecked")
        List<String> vendorIds = (List<String>) payload.get("vendorIds");

        if (vendorIds == null || vendorIds.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No vendors selected"));
        }
        if (!List.of("approve", "reject", "suspend", "reinstate").contains(action)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Unknown action: " + action));
        }
        if ("reject".equals(action) && (reason == null || reason.isBlank())) {
            return ResponseEntity.badRequest().body(Map.of("error", "A reason is required when rejecting"));
        }

        List<String> succeeded = new ArrayList<>();
        List<String> failed = new ArrayList<>();

        for (String vendorId : vendorIds) {
            vendorRepository.findById(vendorId).ifPresentOrElse(vendor -> {
                switch (action) {
                    case "approve", "reinstate" -> {
                        vendor.setStatus("ACTIVE");
                        vendor.setRejectionReason(null);
                        vendorRepository.save(vendor);
                        notificationService.notify(vendor.getId(), "ACCOUNT",
                                "approve".equals(action) ? "Account approved" : "Account reinstated",
                                "Your vendor account is active. You're live on VendorHub.", "/dashboard/vendor");
                    }
                    case "reject" -> {
                        vendor.setStatus("REJECTED");
                        vendor.setRejectionReason(reason);
                        vendorRepository.save(vendor);
                        notificationService.notify(vendor.getId(), "ACCOUNT", "Account rejected",
                                messageWithReason("Your vendor account application was rejected.", reason),
                                "/dashboard/vendor");
                    }
                    case "suspend" -> {
                        vendor.setStatus("SUSPENDED");
                        vendor.setRejectionReason(reason);
                        vendorRepository.save(vendor);
                        notificationService.notify(vendor.getId(), "ACCOUNT", "Account suspended",
                                messageWithReason("Your vendor account has been suspended. Contact support for details.", reason),
                                "/dashboard/vendor");
                    }
                    default -> failed.add(vendorId);
                }
                succeeded.add(vendorId);
            }, () -> failed.add(vendorId));
        }

        return ResponseEntity.ok(Map.of(
                "action", action,
                "succeeded", succeeded.size(),
                "failed", failed.size(),
                "failedIds", failed
        ));
    }

    private String messageWithReason(String base, String reason) {
        return (reason == null || reason.isBlank()) ? base : base + " Reason: " + reason;
    }
}
