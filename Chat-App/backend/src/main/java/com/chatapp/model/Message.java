package com.chatapp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "messages")
public class Message {

    @Id
    private String id;

    @Indexed
    private String conversationId;

    private String senderId;
    private String senderName;
    private String text;
    private List<String> attachmentUrls = new ArrayList<>();
    private MessageStatus status = MessageStatus.SENT;
    private Instant createdAt = Instant.now();

    public Message() {}

    public enum MessageStatus { SENT, DELIVERED, READ }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getConversationId() { return conversationId; }
    public void setConversationId(String conversationId) { this.conversationId = conversationId; }

    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public List<String> getAttachmentUrls() { return attachmentUrls; }
    public void setAttachmentUrls(List<String> urls) { this.attachmentUrls = urls; }

    public MessageStatus getStatus() { return status; }
    public void setStatus(MessageStatus status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    // ── Builder ───────────────────────────────────────────────────────────────

    public static Builder builder() { return new Builder(); }

    public static final class Builder {
        private final Message m = new Message();

        public Builder conversationId(String v) { m.conversationId = v; return this; }
        public Builder senderId(String v)       { m.senderId = v;       return this; }
        public Builder senderName(String v)     { m.senderName = v;     return this; }
        public Builder text(String v)           { m.text = v;           return this; }
        public Builder attachmentUrls(List<String> v) { m.attachmentUrls = v; return this; }
        public Builder status(MessageStatus v)  { m.status = v;         return this; }
        public Message build() { return m; }
    }
}
