package com.marketplace.controller.admin;

import com.marketplace.dto.admin.AdminCategoryDto;
import com.marketplace.model.Category;
import com.marketplace.model.vendor.Vendor;
import com.marketplace.repository.CategoryRepository;
import com.marketplace.repository.VendorRepository;
import com.marketplace.util.SlugGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Service-category management. */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryRepository categoryRepository;
    private final VendorRepository vendorRepository;

    @GetMapping("/categories")
    public ResponseEntity<?> getAllCategories() {
        List<Vendor> vendors = vendorRepository.findAll();
        List<AdminCategoryDto> result = categoryRepository.findAll().stream()
                .sorted(Comparator.comparing(Category::getDisplayOrder, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(c -> AdminCategoryDto.from(c, countVendorsIn(c, vendors)))
                .toList();
        return ResponseEntity.ok(result);
    }

    /**
     * Vendor types present in the data that no category matches.
     *
     * <p>Exists because the two are currently disconnected: every vendor has a
     * free-text {@code vendorType} and none of those strings equals any
     * category name or slug, so every category legitimately reports 0 vendors.
     * Showing the unmatched types lets an admin actually fix the mismatch
     * instead of staring at twenty zeroes.
     */
    @GetMapping("/categories/unmatched-vendor-types")
    public ResponseEntity<?> getUnmatchedVendorTypes() {
        List<Category> categories = categoryRepository.findAll();

        Map<String, Long> unmatched = new LinkedHashMap<>();
        vendorRepository.findAll().stream()
                .map(Vendor::getVendorType)
                .filter(t -> t != null && !t.isBlank())
                .filter(type -> categories.stream().noneMatch(c -> matches(c, type)))
                .forEach(type -> unmatched.merge(type, 1L, Long::sum));

        List<Map<String, Object>> result = unmatched.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(e -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("vendorType", e.getKey());
                    row.put("vendorCount", e.getValue());
                    return row;
                })
                .toList();

        return ResponseEntity.ok(result);
    }

    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(@RequestBody Category category) {
        if (category.getName() == null || category.getName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Category name is required"));
        }

        String slug = resolveSlug(category);
        if (categoryRepository.findBySlug(slug).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "A category with that name already exists"));
        }

        category.setId(null);
        category.setName(category.getName().trim());
        category.setSlug(slug);
        if (category.getVisible() == null) category.setVisible(true);
        if (category.getDisplayOrder() == null) category.setDisplayOrder(nextDisplayOrder());
        category.setCreatedAt(Instant.now());
        category.setUpdatedAt(Instant.now());

        Category saved = categoryRepository.save(category);
        return ResponseEntity.ok(Map.of("message", "Category created",
                "category", AdminCategoryDto.from(saved, countVendorsIn(saved, vendorRepository.findAll()))));
    }

    @PutMapping("/categories/{categoryId}")
    public ResponseEntity<?> updateCategory(@PathVariable String categoryId, @RequestBody Category updates) {
        return categoryRepository.findById(categoryId)
                .<ResponseEntity<?>>map(category -> {
                    if (updates.getName() != null && !updates.getName().isBlank()) {
                        category.setName(updates.getName().trim());
                        // The slug follows the name unless one was given
                        // explicitly — otherwise renaming a category leaves a
                        // slug that no longer resembles it.
                        String slug = updates.getSlug() != null && !updates.getSlug().isBlank()
                                ? SlugGenerator.generateSlug(updates.getSlug())
                                : SlugGenerator.generateSlug(updates.getName());
                        var clash = categoryRepository.findBySlug(slug);
                        if (clash.isPresent() && !clash.get().getId().equals(categoryId)) {
                            return ResponseEntity.badRequest()
                                    .body(Map.of("error", "Another category already uses that name"));
                        }
                        category.setSlug(slug);
                    }
                    if (updates.getDescription() != null) category.setDescription(updates.getDescription());
                    if (updates.getIcon() != null) category.setIcon(updates.getIcon());
                    if (updates.getDisplayOrder() != null) category.setDisplayOrder(updates.getDisplayOrder());
                    if (updates.getVisible() != null) category.setVisible(updates.getVisible());
                    category.setUpdatedAt(Instant.now());

                    Category saved = categoryRepository.save(category);
                    return ResponseEntity.ok(Map.of("message", "Category updated",
                            "category", AdminCategoryDto.from(saved, countVendorsIn(saved, vendorRepository.findAll()))));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /** Reorders categories in one call, so a drag-and-drop doesn't fire N requests. */
    @PutMapping("/categories/reorder")
    public ResponseEntity<?> reorderCategories(@RequestBody List<String> orderedIds) {
        if (orderedIds == null || orderedIds.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No categories supplied"));
        }

        int order = 1;
        int updated = 0;
        for (String id : orderedIds) {
            var found = categoryRepository.findById(id);
            if (found.isPresent()) {
                Category category = found.get();
                category.setDisplayOrder(order);
                category.setUpdatedAt(Instant.now());
                categoryRepository.save(category);
                updated++;
            }
            order++;
        }
        return ResponseEntity.ok(Map.of("message", "Order updated", "updated", updated));
    }

    /**
     * Deleting a category that vendors sit under would orphan them, so it is
     * refused unless the caller explicitly confirms.
     */
    @DeleteMapping("/categories/{categoryId}")
    public ResponseEntity<?> deleteCategory(@PathVariable String categoryId,
                                            @RequestParam(defaultValue = "false") boolean force) {
        return categoryRepository.findById(categoryId)
                .<ResponseEntity<?>>map(category -> {
                    long inUse = countVendorsIn(category, vendorRepository.findAll());
                    if (inUse > 0 && !force) {
                        return ResponseEntity.badRequest().body(Map.of(
                                "error", inUse + " vendor(s) are still listed under \"" + category.getName()
                                        + "\". Reassign them first, or confirm to delete anyway.",
                                "vendorCount", inUse));
                    }
                    categoryRepository.deleteById(categoryId);
                    return ResponseEntity.ok(Map.of("message", "Category deleted"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /** Vendors matching this category on either field, by name or slug, case-insensitively. */
    private long countVendorsIn(Category category, List<Vendor> vendors) {
        return vendors.stream().filter(v -> matchesVendor(category, v)).count();
    }

    private boolean matchesVendor(Category category, Vendor vendor) {
        return matches(category, vendor.getVendorType()) || matches(category, vendor.getCategory());
    }

    private boolean matches(Category category, String value) {
        if (value == null || value.isBlank()) return false;
        return value.equalsIgnoreCase(category.getName()) || value.equalsIgnoreCase(category.getSlug());
    }

    private String resolveSlug(Category category) {
        String source = (category.getSlug() != null && !category.getSlug().isBlank())
                ? category.getSlug()
                : category.getName();
        return SlugGenerator.generateSlug(source);
    }

    private int nextDisplayOrder() {
        return categoryRepository.findAll().stream()
                .map(Category::getDisplayOrder)
                .filter(java.util.Objects::nonNull)
                .max(Integer::compareTo)
                .orElse(0) + 1;
    }
}
