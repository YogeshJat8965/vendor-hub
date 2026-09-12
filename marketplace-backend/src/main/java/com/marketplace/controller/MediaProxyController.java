package com.marketplace.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.net.URI;

/**
 * Re-serves a PDF we already uploaded to Cloudinary as "raw" (see
 * MessageController / UploadController), with correct headers.
 *
 * Cloudinary's "raw" resource type is the only way to avoid its default
 * block on publicly delivering PDF/ZIP files, but it always serves the
 * bytes as application/octet-stream with Content-Disposition: attachment
 * and no filename extension — which is why a raw PDF URL won't render
 * inline in a browser and trips Chrome's "unverified file" download
 * warning. Tagging the upload's format as "pdf" to fix that instead makes
 * Cloudinary recognize and block it again (confirmed by testing) — the
 * restriction is keyed on recognized format, not resource_type.
 *
 * Fetching the (unblocked, working) raw URL server-side and re-serving it
 * with the real content-type and a proper filename sidesteps that
 * restriction entirely, since it's applied at Cloudinary's edge only to the
 * public delivery URL, not to a plain server-to-server fetch of the
 * unrecognized-format raw bytes.
 */
@Slf4j
@RestController
public class MediaProxyController {

    @Value("${cloudinary.cloud-name}")
    private String cloudinaryCloudName;

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/api/media/pdf")
    public ResponseEntity<byte[]> proxyPdf(
            @RequestParam String url,
            @RequestParam(defaultValue = "false") boolean download) {
        try {
            URI uri = URI.create(url);
            String expectedPathPrefix = "/" + cloudinaryCloudName + "/raw/upload/";
            if (!"res.cloudinary.com".equals(uri.getHost()) || !uri.getPath().startsWith(expectedPathPrefix)) {
                return ResponseEntity.badRequest().build();
            }

            ResponseEntity<byte[]> upstream = restTemplate.getForEntity(uri, byte[].class);
            if (!upstream.getStatusCode().is2xxSuccessful() || upstream.getBody() == null) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.set(HttpHeaders.CONTENT_DISPOSITION,
                    (download ? "attachment" : "inline") + "; filename=\"document.pdf\"");

            return new ResponseEntity<>(upstream.getBody(), headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Failed to proxy PDF from {}: {}", url, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
        }
    }
}
