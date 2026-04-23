package com.chatapp.controller;

import com.chatapp.dto.*;
import com.chatapp.service.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations/{convId}/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping
    public ResponseEntity<List<MessageResponse>> getMessages(
            @PathVariable String convId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return ResponseEntity.ok(messageService.getMessages(convId, page, size));
    }

    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(
            @PathVariable String convId,
            @RequestBody MessageRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        MessageResponse response = messageService.sendMessage(
                convId,
                userDetails.getUsername(),
                request.getText(),
                List.of()
        );
        return ResponseEntity.ok(response);
    }
}
