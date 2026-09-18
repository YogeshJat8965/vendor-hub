package com.marketplace.service;

import com.marketplace.model.Catalogue;
import com.marketplace.model.CatalogueItem;
import com.marketplace.model.Plan;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Decides what a vendor's plan lets the public actually see.
 *
 * <p>Downgrading never destroys anything. A vendor who drops from a 7-catalogue
 * plan to a 1-catalogue plan keeps all seven rows in the database; six simply
 * stop being served publicly, and every one of them comes back intact the
 * moment they upgrade again or an admin raises the limit.
 *
 * <p>Which catalogues survive is deliberately <em>oldest-first</em>. An
 * arbitrary or newest-first rule would mean a vendor could not predict what
 * their customers see; oldest-first is stable, so the same catalogue stays
 * visible from one day to the next.
 */
@Service
@RequiredArgsConstructor
public class PlanVisibilityService {

    /** The catalogues this plan permits to be shown publicly, oldest first. */
    public List<Catalogue> visibleCatalogues(List<Catalogue> catalogues, Plan plan) {
        List<Catalogue> ordered = orderedOldestFirst(catalogues);
        if (Plan.isUnlimited(plan.getMaxCatalogues())) {
            return ordered;
        }
        int allowed = Math.max(0, plan.getMaxCatalogues());
        return ordered.stream().limit(allowed).toList();
    }

    /** True when this catalogue is beyond what the plan allows to be public. */
    public boolean isCatalogueLocked(Catalogue catalogue, List<Catalogue> allOfVendor, Plan plan) {
        return visibleCatalogues(allOfVendor, plan).stream()
                .noneMatch(visible -> visible.getId().equals(catalogue.getId()));
    }

    /**
     * A copy of the catalogue safe to serve publicly: over-limit items trimmed
     * and any field the plan doesn't include removed.
     *
     * <p>Returns a copy rather than mutating, so stripping a response can never
     * write the loss back to the database.
     */
    public Catalogue publicView(Catalogue catalogue, Plan plan) {
        Catalogue view = copyOf(catalogue);

        List<CatalogueItem> items = view.getItems() == null ? List.of() : view.getItems();
        if (!Plan.isUnlimited(plan.getMaxItemsPerCatalogue())) {
            items = items.stream().limit(Math.max(0, plan.getMaxItemsPerCatalogue())).toList();
        }

        view.setItems(items.stream().map(item -> publicItemView(item, plan)).toList());
        return view;
    }

    /** Applies the same trimming to a whole list of catalogues. */
    public List<Catalogue> publicViews(List<Catalogue> catalogues, Plan plan) {
        return visibleCatalogues(catalogues, plan).stream()
                .map(catalogue -> publicView(catalogue, plan))
                .toList();
    }

    private CatalogueItem publicItemView(CatalogueItem item, Plan plan) {
        CatalogueItem view = copyOf(item);

        if (!Plan.isUnlimited(plan.getMaxImagesPerItem()) && view.getImages() != null) {
            view.setImages(view.getImages().stream()
                    .limit(Math.max(0, plan.getMaxImagesPerItem()))
                    .toList());
        }

        if (!plan.isAllowsPriceRange()) view.setPriceRange(null);
        if (!plan.isAllowsMaterialsDetails()) view.setMaterialsDetails(null);
        if (!plan.isAllowsProjectTimeline()) view.setProjectTimeline(null);
        if (!plan.isAllowsBeforeAfterImages()) view.setBeforeAfterImages(null);
        if (!plan.isAllowsVideo()) view.setVideoUrl(null);
        if (!plan.isAllowsPdfBrochure()) view.setPdfBrochureUrl(null);

        return view;
    }

    /**
     * Oldest first, with catalogues lacking a creation date last — they are
     * pre-existing records from before the field was populated, and putting
     * them at the end keeps the ordering total and stable.
     */
    private List<Catalogue> orderedOldestFirst(List<Catalogue> catalogues) {
        if (catalogues == null) return List.of();
        return catalogues.stream()
                .sorted(Comparator.comparing(Catalogue::getCreatedAt,
                                Comparator.nullsLast(Comparator.<Instant>naturalOrder()))
                        .thenComparing(Catalogue::getId, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

    private Catalogue copyOf(Catalogue source) {
        Catalogue copy = new Catalogue();
        copy.setId(source.getId());
        copy.setVendorId(source.getVendorId());
        copy.setName(source.getName());
        copy.setType(source.getType());
        copy.setDescription(source.getDescription());
        copy.setCoverImage(source.getCoverImage());
        copy.setItems(source.getItems() == null ? new ArrayList<>() : new ArrayList<>(source.getItems()));
        copy.setCreatedAt(source.getCreatedAt());
        copy.setUpdatedAt(source.getUpdatedAt());
        return copy;
    }

    private CatalogueItem copyOf(CatalogueItem source) {
        CatalogueItem copy = new CatalogueItem();
        copy.setId(source.getId());
        copy.setTitle(source.getTitle());
        copy.setDescription(source.getDescription());
        copy.setItemType(source.getItemType());
        copy.setStartingPrice(source.getStartingPrice());
        copy.setPriceRange(source.getPriceRange());
        copy.setImages(source.getImages() == null ? null : new ArrayList<>(source.getImages()));
        copy.setMaterialsDetails(source.getMaterialsDetails());
        copy.setProjectTimeline(source.getProjectTimeline());
        copy.setStockStatus(source.getStockStatus());
        copy.setStockQuantity(source.getStockQuantity());
        copy.setBeforeAfterImages(source.getBeforeAfterImages() == null
                ? null : new ArrayList<>(source.getBeforeAfterImages()));
        copy.setVideoUrl(source.getVideoUrl());
        copy.setPdfBrochureUrl(source.getPdfBrochureUrl());
        return copy;
    }
}
