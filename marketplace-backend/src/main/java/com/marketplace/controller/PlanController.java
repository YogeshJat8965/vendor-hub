package com.marketplace.controller;

import com.marketplace.service.PlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public plan listing, for the pricing page.
 *
 * <p>Returns only purchasable plans, so an admin retiring a tier removes it
 * from the pricing page without affecting anyone already subscribed to it.
 */
@RestController
@RequestMapping("/api/plans")
@RequiredArgsConstructor
public class PlanController {

    private final PlanService planService;

    @GetMapping
    public ResponseEntity<?> getPurchasablePlans() {
        return ResponseEntity.ok(planService.getPurchasable());
    }
}
