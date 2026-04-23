package com.chatapp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "conversations")
public class Conversation {

    @Id
    private String id;
    private String name;
    private boolean isGroup = false;
    private List<String> participantIds = new ArrayList<>();
    private String lastMessage;
    private Instant lastMessageTime;
    private String avatarColor = "#0891B2";
    private Instant createdAt = Instant.now();

    public Conversation() {}

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public boolean isGroup() { return isGroup; }
    public void setGroup(boolean group) { isGroup = group; }

    public List<String> getParticipantIds() { return participantIds; }
    public void setParticipantIds(List<String> ids) { this.participantIds = ids; }

    public String getLastMessage() { return lastMessage; }
    public void setLastMessage(String lastMessage) { this.lastMessage = lastMessage; }

    public Instant getLastMessageTime() { return lastMessageTime; }
    public void setLastMessageTime(Instant t) { this.lastMessageTime = t; }

    public String getAvatarColor() { return avatarColor; }
    public void setAvatarColor(String avatarColor) { this.avatarColor = avatarColor; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    // ── Builder ───────────────────────────────────────────────────────────────

    public static Builder builder() { return new Builder(); }

    public static final class Builder {
        private final Conversation c = new Conversation();

        public Builder name(String v)              { c.name = v;             return this; }
        public Builder isGroup(boolean v)          { c.isGroup = v;          return this; }
        public Builder participantIds(List<String> v) { c.participantIds = v; return this; }
        public Builder avatarColor(String v)       { c.avatarColor = v;      return this; }
        public Conversation build() { return c; }
    }
}
