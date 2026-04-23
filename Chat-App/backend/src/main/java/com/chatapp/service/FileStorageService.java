package com.chatapp.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    @Value("${upload.dir}")
    private String uploadDir;

    @PostConstruct
    public void init() throws IOException {
        Files.createDirectories(Path.of(uploadDir));
        log.info("Upload directory ready: {}", Path.of(uploadDir).toAbsolutePath());
    }

    public List<String> storeFiles(MultipartFile[] files, String baseUrl) {
        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;
            try {
                String ext = getExtension(file.getOriginalFilename());
                String filename = UUID.randomUUID() + ext;
                Path target = Path.of(uploadDir, filename);
                Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
                urls.add(baseUrl + "/uploads/" + filename);
                log.debug("Stored file: {}", target.toAbsolutePath());
            } catch (IOException e) {
                log.error("Failed to store file: {}", e.getMessage());
                throw new RuntimeException("Could not store file: " + file.getOriginalFilename(), e);
            }
        }
        return urls;
    }

    private String getExtension(String filename) {
        if (filename == null) return "";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot) : "";
    }
}
