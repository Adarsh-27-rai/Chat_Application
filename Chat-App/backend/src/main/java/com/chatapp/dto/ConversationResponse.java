package com.chatapp.dto;

import java.time.Instant;
import java.util.List;

public class ConversationResponse {
    private String id;
    private String name;
    private boolean isGroup;
    private List<String> participantIds;
    private String lastMessage;
    private Instant lastMessageTime;
    private String avatarColor;
    private int unread;
    private boolean online;

    public ConversationResponse() {}

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

    public int getUnread() { return unread; }
    public void setUnread(int unread) { this.unread = unread; }

    public boolean isOnline() { return online; }
    public void setOnline(boolean online) { this.online = online; }

    // ── Builder ───────────────────────────────────────────────────────────────

    public static Builder builder() { return new Builder(); }

    public static final class Builder {
        private final ConversationResponse r = new ConversationResponse();
        public Builder id(String v)                   { r.id = v;              return this; }
        public Builder name(String v)                 { r.name = v;            return this; }
        public Builder isGroup(boolean v)             { r.isGroup = v;         return this; }
        public Builder participantIds(List<String> v) { r.participantIds = v;  return this; }
        public Builder lastMessage(String v)          { r.lastMessage = v;     return this; }
        public Builder lastMessageTime(Instant v)     { r.lastMessageTime = v; return this; }
        public Builder avatarColor(String v)          { r.avatarColor = v;     return this; }
        public Builder unread(int v)                  { r.unread = v;          return this; }
        public Builder online(boolean v)              { r.online = v;          return this; }
        public ConversationResponse build() { return r; }
    }
}
