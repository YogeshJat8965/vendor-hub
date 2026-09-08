package com.marketplace.controller;

import com.marketplace.model.Catalogue;
import com.marketplace.service.CatalogueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CatalogueController {

    private final CatalogueService catalogueService;

    @PostMapping("/vendor/catalogues")
    public ResponseEntity<?> createCatalogue(@RequestParam String email, @RequestBody Catalogue catalogue) {
        try {
            Catalogue created = catalogueService.createCatalogue(email, catalogue);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/vendor/catalogues/{id}")
    public ResponseEntity<?> updateCatalogue(
            @RequestParam String email,
            @PathVariable String id,
            @RequestBody Catalogue catalogue) {
        try {
            Catalogue updated = catalogueService.updateCatalogue(email, id, catalogue);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/vendor/catalogues")
    public ResponseEntity<?> getVendorCataloguesByEmail(@RequestParam String email) {
        try {
            return ResponseEntity.ok(catalogueService.getCataloguesByEmail(email));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/vendor/catalogues/{id}")
    public ResponseEntity<?> deleteCatalogue(@RequestParam String email, @PathVariable String id) {
        try {
            catalogueService.deleteCatalogue(email, id);
            return ResponseEntity.ok(Map.of("message", "Catalogue deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/catalogues/vendor/{vendorId}")
    public ResponseEntity<?> getCataloguesPublic(@PathVariable String vendorId) {
        try {
            return ResponseEntity.ok(catalogueService.getVendorCatalogues(vendorId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/catalogues/{id}")
    public ResponseEntity<?> getCatalogueById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(catalogueService.getCatalogueById(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
