package com.marketplace.controller;

import com.marketplace.model.Collaboration;
import com.marketplace.repository.CollaborationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/collaboration")
@RequiredArgsConstructor
public class CollaborationController {
    
    private final CollaborationRepository collaborationRepository;
    
    @PostMapping("/post")
    public ResponseEntity<?> createCollaboration(@RequestBody Collaboration collab) {
        collab.setStatus("OPEN");
        collab.setCreatedAt(LocalDateTime.now());
        Collaboration saved = collaborationRepository.save(collab);
        return ResponseEntity.ok(Map.of("collaboration", saved, "message", "Posted successfully"));
    }
    
    @GetMapping("/search")
    public ResponseEntity<?> searchCollaborations() {
        return ResponseEntity.ok(collaborationRepository.findByStatus("OPEN"));
    }
    
    @GetMapping("/vendor/{vendorSlug}")
    public ResponseEntity<?> getVendorCollaborations(@PathVariable String vendorSlug) {
        return ResponseEntity.ok(collaborationRepository.findByPostedByVendorSlug(vendorSlug));
    }
}
