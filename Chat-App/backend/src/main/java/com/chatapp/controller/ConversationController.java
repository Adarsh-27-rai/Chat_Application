package com.chatapp.controller;

import com.chatapp.dto.ConversationResponse;
import com.chatapp.service.ConversationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    private final ConversationService conversationService;

    public ConversationController(ConversationService conversationService) {
        this.conversationService = conversationService;
    }

    @GetMapping
    public ResponseEntity<List<ConversationResponse>> getConversations(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(
                conversationService.getConversationsForUser(userDetails.getUsername())
        );
    }

    @PostMapping("/direct/{userId}")
    public ResponseEntity<ConversationResponse> getOrCreateDirect(
            @PathVariable String userId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(
                conversationService.getOrCreateDirectConversation(
                        userDetails.getUsername(), userId)
        );
    }
}
