package com.marketplace.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
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
    private final Cloudinary cloudinary;
    
    @PostMapping("/customer/upload/photo")
    public ResponseEntity<?> uploadCustomerPhoto(
            @RequestParam("file") MultipartFile file,
            @RequestParam("email") String email) {
        try {
            // Upload to Cloudinary
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("resource_type", "auto"));
            String fileUrl = uploadResult.get("url").toString();
            
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
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("resource_type", "auto"));
            String fileUrl = uploadResult.get("url").toString();
            
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
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("resource_type", "auto"));
            String fileUrl = uploadResult.get("url").toString();
            
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
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("resource_type", "auto"));
            String fileUrl = uploadResult.get("url").toString();
            
            Vendor vendor = vendorRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Vendor not found"));
            
            List<String> gallery = vendor.getGallery();
            if (gallery == null) {
                gallery = new ArrayList<>();
            }
            
            if (gallery.size() >= 5) {
                return ResponseEntity.badRequest().body(Map.of("error", "Maximum 5 gallery photos allowed"));
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
    
    @PostMapping("/vendor/upload/catalogue-file")
    public ResponseEntity<?> uploadCatalogueFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("email") String email) {
        try {
            // Check if vendor exists
            vendorRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Vendor not found"));
                    
            String originalFileName = file.getOriginalFilename();
            String extension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                extension = originalFileName.substring(originalFileName.lastIndexOf(".")).toLowerCase();
            }
            
            // Validate file type (basic validation)
            if (!extension.matches("\\.(jpg|jpeg|png|webp|mp4|pdf)$")) {
                throw new RuntimeException("Invalid file type. Only images, MP4, and PDF are allowed.");
            }
            
            // Note: In production, enforce size limits based on type and vendor plan.

            // PDFs must upload as "raw", not "auto" (which Cloudinary treats
            // as "image" for PDFs): recent Cloudinary accounts block public
            // delivery of non-image files served through the image endpoint
            // by default, which makes the resulting URL 401. "raw" delivery
            // isn't subject to that restriction.
            //
            // NOTE: passing format:"pdf" here (tried and reverted) makes
            // Cloudinary recognize and block the file the same way, even as
            // "raw" — the restriction is keyed on recognized format, not
            // resource_type. So this stays plain "raw" with no format hint:
            // it works, but Cloudinary always serves it as
            // application/octet-stream with Content-Disposition: attachment
            // and no file extension. The only way to get correct content-type
            // and inline display is enabling "Allow delivery of PDF and ZIP
            // files" in the Cloudinary console's Security settings.
            String resourceType = ".pdf".equals(extension) ? "raw" : "auto";
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("resource_type", resourceType));
            String fileUrl = uploadResult.get("url").toString();

            return ResponseEntity.ok(Map.of(
                "message", "Catalogue file uploaded successfully",
                "url", fileUrl
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
