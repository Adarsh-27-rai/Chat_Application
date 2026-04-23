package com.chatapp.service;

import com.chatapp.dto.ConversationResponse;
import com.chatapp.model.Conversation;
import com.chatapp.model.User;
import com.chatapp.repository.ConversationRepository;
import com.chatapp.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;

    public ConversationService(ConversationRepository conversationRepository,
                               UserRepository userRepository) {
        this.conversationRepository = conversationRepository;
        this.userRepository = userRepository;
    }

    public List<ConversationResponse> getConversationsForUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return conversationRepository
                .findByParticipantIdsContainingOrderByLastMessageTimeDesc(user.getId())
                .stream()
                .map(conv -> toResponse(conv, user))
                .collect(Collectors.toList());
    }

    public ConversationResponse getOrCreateDirectConversation(String myUsername, String otherUserId) {
        User me = userRepository.findByUsername(myUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return conversationRepository
                .findByParticipantIdsContainingOrderByLastMessageTimeDesc(me.getId())
                .stream()
                .filter(c -> !c.isGroup() && c.getParticipantIds().contains(otherUserId))
                .findFirst()
                .map(conv -> toResponse(conv, me))
                .orElseGet(() -> {
                    User other = userRepository.findById(otherUserId)
                            .orElseThrow(() -> new IllegalArgumentException("Other user not found"));

                    Conversation newConv = Conversation.builder()
                            .name(other.getDisplayName())
                            .isGroup(false)
                            .participantIds(List.of(me.getId(), otherUserId))
                            .avatarColor(other.getAvatarColor())
                            .build();

                    Conversation saved = conversationRepository.save(newConv);
                    return toResponse(saved, me);
                });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private ConversationResponse toResponse(Conversation conv, User currentUser) {
        String displayName  = conv.getName();
        String avatarColor  = conv.getAvatarColor();
        boolean online      = false;

        // For DMs, always resolve name/avatar from the OTHER participant
        // so both sides see the correct recipient name regardless of who created the conv.
        if (!conv.isGroup()) {
            String otherId = conv.getParticipantIds().stream()
                    .filter(id -> !id.equals(currentUser.getId()))
                    .findFirst()
                    .orElse(null);

            if (otherId != null) {
                User other = userRepository.findById(otherId).orElse(null);
                if (other != null) {
                    displayName = other.getDisplayName() != null
                            ? other.getDisplayName() : other.getUsername();
                    avatarColor = other.getAvatarColor() != null
                            ? other.getAvatarColor() : avatarColor;
                    online      = other.isOnline();
                }
            }
        }

        return ConversationResponse.builder()
                .id(conv.getId())
                .name(displayName)
                .isGroup(conv.isGroup())
                .participantIds(conv.getParticipantIds())
                .lastMessage(conv.getLastMessage())
                .lastMessageTime(conv.getLastMessageTime())
                .avatarColor(avatarColor)
                .online(online)
                .unread(0)
                .build();
    }
}
