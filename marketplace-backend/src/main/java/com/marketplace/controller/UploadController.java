package com.marketplace.controller;

import com.marketplace.model.CustomerProfile;
import com.marketplace.model.vendor.Vendor;
import com.marketplace.repository.CustomerProfileRepository;
import com.marketplace.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UploadController {
    
    private final CustomerProfileRepository customerProfileRepository;
    private final VendorRepository vendorRepository;
    
    @PostMapping("/customer/upload/photo")
    public ResponseEntity<?> uploadCustomerPhoto(
            @RequestParam("file") MultipartFile file,
            @RequestParam("email") String email) {
        try {
            // Simulate file upload - in production, upload to cloud storage
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            String fileUrl = "/uploads/customers/" + fileName;
            
            // Update customer profile with photo URL
            CustomerProfile profile = customerProfileRepository.findByEmail(email)
                    .orElseGet(() -> {
                        CustomerProfile newProfile = new CustomerProfile();
                        newProfile.setEmail(email);
                        return newProfile;
                    });
            profile.setPhotoUrl(fileUrl);
            customerProfileRepository.save(profile);
            
            return ResponseEntity.ok(Map.of(
                "message", "Photo uploaded successfully",
                "url", fileUrl
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/vendor/upload/logo")
    public ResponseEntity<?> uploadVendorLogo(
            @RequestParam("file") MultipartFile file,
            @RequestParam("email") String email) {
        try {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            String fileUrl = "/uploads/vendors/logos/" + fileName;
            
            Vendor vendor = vendorRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Vendor not found"));
            vendor.setLogoUrl(fileUrl);
            vendorRepository.save(vendor);
            
            return ResponseEntity.ok(Map.of(
                "message", "Logo uploaded successfully",
                "url", fileUrl
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/vendor/upload/banner")
    public ResponseEntity<?> uploadVendorBanner(
            @RequestParam("file") MultipartFile file,
            @RequestParam("email") String email) {
        try {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            String fileUrl = "/uploads/vendors/banners/" + fileName;
            
            Vendor vendor = vendorRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Vendor not found"));
            vendor.setBannerUrl(fileUrl);
            vendorRepository.save(vendor);
            
            return ResponseEntity.ok(Map.of(
                "message", "Banner uploaded successfully",
                "url", fileUrl
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/vendor/upload/gallery")
    public ResponseEntity<?> uploadGalleryImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("email") String email) {
        try {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            String fileUrl = "/uploads/vendors/gallery/" + fileName;
            
            Vendor vendor = vendorRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Vendor not found"));
            
            List<String> gallery = vendor.getGallery();
            if (gallery == null) {
                gallery = new ArrayList<>();
            }
            gallery.add(fileUrl);
            vendor.setGallery(gallery);
            vendorRepository.save(vendor);
            
            return ResponseEntity.ok(Map.of(
                "message", "Gallery image uploaded successfully",
                "url", fileUrl,
                "id", fileUrl
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @DeleteMapping("/vendor/gallery/{imageId}")
    public ResponseEntity<?> deleteGalleryImage(
            @PathVariable String imageId,
            @RequestParam String email) {
        try {
            Vendor vendor = vendorRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Vendor not found"));
            
            List<String> gallery = vendor.getGallery();
            if (gallery != null) {
                gallery.removeIf(url -> url.contains(imageId));
                vendor.setGallery(gallery);
                vendorRepository.save(vendor);
            }
            
            return ResponseEntity.ok(Map.of("message", "Image deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
