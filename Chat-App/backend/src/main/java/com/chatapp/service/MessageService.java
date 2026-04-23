package com.chatapp.service;

import com.chatapp.dto.MessageResponse;
import com.chatapp.dto.WebSocketMessagePayload;
import com.chatapp.model.Message;
import com.chatapp.model.User;
import com.chatapp.repository.ConversationRepository;
import com.chatapp.repository.MessageRepository;
import com.chatapp.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageService {

    private static final Logger log = LoggerFactory.getLogger(MessageService.class);

    private static final DateTimeFormatter TIME_FMT =
            DateTimeFormatter.ofPattern("hh:mm a").withZone(ZoneId.systemDefault());

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public MessageService(MessageRepository messageRepository,
                          ConversationRepository conversationRepository,
                          UserRepository userRepository,
                          SimpMessagingTemplate messagingTemplate) {
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    // ── Paginated history ─────────────────────────────────────────────────────

    public List<MessageResponse> getMessages(String conversationId, int page, int size) {
        assertConversationExists(conversationId);
        Page<Message> msgPage = messageRepository.findByConversationIdOrderByCreatedAtAsc(
                conversationId, PageRequest.of(page, size));
        return msgPage.stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── Send (persist + broadcast) ────────────────────────────────────────────

    public MessageResponse sendMessage(String conversationId, String senderUsername,
                                       String text, List<String> attachmentUrls) {
        assertConversationExists(conversationId);

        User sender = userRepository.findByUsername(senderUsername)
                .orElseThrow(() -> new UsernameNotFoundException("Sender not found"));

        Message msg = Message.builder()
                .conversationId(conversationId)
                .senderId(sender.getId())
                .senderName(sender.getDisplayName())
                .text(text)
                .attachmentUrls(attachmentUrls != null ? attachmentUrls : List.of())
                .status(Message.MessageStatus.SENT)
                .build();

        msg = messageRepository.save(msg);

        updateConversationPreview(conversationId, msg);

        MessageResponse response = toResponse(msg);
        broadcastMessage(conversationId, response);
        return response;
    }

    // ── Typing indicator ──────────────────────────────────────────────────────

    public void broadcastTyping(String conversationId, String senderUsername) {
        User sender = userRepository.findByUsername(senderUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        WebSocketMessagePayload payload = WebSocketMessagePayload.builder()
                .conversationId(conversationId)
                .senderId(sender.getId())
                .senderName(sender.getDisplayName())
                .type("TYPING")
                .build();

        messagingTemplate.convertAndSend("/topic/conversations/" + conversationId, payload);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void broadcastMessage(String conversationId, MessageResponse msg) {
        WebSocketMessagePayload payload = WebSocketMessagePayload.builder()
                .id(msg.getId())
                .conversationId(msg.getConversationId())
                .senderId(msg.getSenderId())
                .senderName(msg.getSenderName())
                .text(msg.getText())
                .attachmentUrls(msg.getAttachmentUrls())
                .status(msg.getStatus())
                .createdAt(msg.getCreatedAt())
                .time(msg.getTime())
                .type("MESSAGE")
                .build();

        messagingTemplate.convertAndSend("/topic/conversations/" + conversationId, payload);
        log.debug("Broadcast to /topic/conversations/{}", conversationId);
    }

    private void updateConversationPreview(String conversationId, Message msg) {
        conversationRepository.findById(conversationId).ifPresent(conv -> {
            boolean hasAttachments = msg.getAttachmentUrls() != null && !msg.getAttachmentUrls().isEmpty();
            String preview = hasAttachments
                    ? "📷 Photo" + (msg.getText() != null && !msg.getText().isBlank()
                        ? " · " + msg.getText() : "")
                    : msg.getText();
            conv.setLastMessage(preview);
            conv.setLastMessageTime(msg.getCreatedAt());
            conversationRepository.save(conv);
        });
    }

    private MessageResponse toResponse(Message msg) {
        return MessageResponse.builder()
                .id(msg.getId())
                .conversationId(msg.getConversationId())
                .senderId(msg.getSenderId())
                .senderName(msg.getSenderName())
                .text(msg.getText())
                .attachmentUrls(msg.getAttachmentUrls())
                .status(msg.getStatus().name())
                .createdAt(msg.getCreatedAt())
                .time(TIME_FMT.format(msg.getCreatedAt()))
                .build();
    }

    private void assertConversationExists(String conversationId) {
        if (!conversationRepository.existsById(conversationId)) {
            throw new IllegalArgumentException("Conversation not found: " + conversationId);
        }
    }
}
