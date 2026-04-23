package com.chatapp.controller;

import com.chatapp.dto.MessageRequest;
import com.chatapp.service.MessageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;

import java.util.List;

/**
 * STOMP WebSocket controller.
 *
 * Client connection flow:
 *  1. Connect to /ws/chat with STOMP (SockJS)
 *     connectHeaders: { Authorization: "Bearer <token>" }
 *  2. Subscribe to /topic/conversations/{convId}
 *  3. Send messages to /app/chat/{convId}/send
 *  4. Send typing events to /app/chat/{convId}/typing
 */
@Controller
public class ChatWebSocketController {

    private static final Logger log = LoggerFactory.getLogger(ChatWebSocketController.class);

    private final MessageService messageService;

    public ChatWebSocketController(MessageService messageService) {
        this.messageService = messageService;
    }

    @MessageMapping("/chat/{convId}/send")
    public void sendMessage(
            @DestinationVariable String convId,
            @Payload MessageRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        log.debug("WS send → conv={} from={}", convId, userDetails.getUsername());
        messageService.sendMessage(
                convId,
                userDetails.getUsername(),
                request.getText(),
                List.of()
        );
    }

    @MessageMapping("/chat/{convId}/typing")
    public void typing(
            @DestinationVariable String convId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        log.debug("WS typing → conv={} from={}", convId, userDetails.getUsername());
        messageService.broadcastTyping(convId, userDetails.getUsername());
    }
}
