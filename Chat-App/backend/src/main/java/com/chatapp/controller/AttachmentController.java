package com.chatapp.controller;

import com.chatapp.dto.MessageResponse;
import com.chatapp.service.FileStorageService;
import com.chatapp.service.MessageService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/conversations/{convId}/attachments")
public class AttachmentController {

    private final FileStorageService fileStorageService;
    private final MessageService messageService;

    public AttachmentController(FileStorageService fileStorageService,
                                MessageService messageService) {
        this.fileStorageService = fileStorageService;
        this.messageService = messageService;
    }

    @PostMapping
    public ResponseEntity<MessageResponse> uploadAttachments(
            @PathVariable String convId,
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "text", required = false, defaultValue = "") String text,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request
    ) {
        String baseUrl = request.getScheme() + "://" + request.getServerName()
                + ":" + request.getServerPort();

        List<String> urls = fileStorageService.storeFiles(files, baseUrl);

        MessageResponse response = messageService.sendMessage(
                convId, userDetails.getUsername(), text, urls);

        return ResponseEntity.ok(response);
    }
}
