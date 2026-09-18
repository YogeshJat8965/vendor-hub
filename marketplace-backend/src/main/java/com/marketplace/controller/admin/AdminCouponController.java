package com.marketplace.controller.admin;

import com.marketplace.model.Coupon;
import com.marketplace.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

/** Admin CRUD for discount coupons — every rule a coupon enforces is a field here the admin sets. */
@RestController
@RequestMapping("/api/admin/coupons")
@RequiredArgsConstructor
public class AdminCouponController {

    private final CouponService couponService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        List<Coupon> coupons = couponService.getAll().stream()
                .sorted(Comparator.comparing(Coupon::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
        return ResponseEntity.ok(coupons);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Coupon incoming, Authentication authentication) {
        try {
            return ResponseEntity.ok(couponService.create(incoming, actor(authentication)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Coupon incoming) {
        try {
            return ResponseEntity.ok(couponService.update(id, incoming));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/active")
    public ResponseEntity<?> setActive(@PathVariable String id, @RequestBody Map<String, Boolean> payload) {
        try {
            couponService.setActive(id, Boolean.TRUE.equals(payload.get("active")));
            return ResponseEntity.ok(Map.of("message", "Updated"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        try {
            couponService.delete(id);
            return ResponseEntity.ok(Map.of("message", "Deleted"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private String actor(Authentication authentication) {
        return authentication != null ? authentication.getName() : "unknown";
    }
}
