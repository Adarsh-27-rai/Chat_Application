package com.chatapp.dto;

import java.time.Instant;
import java.util.List;

public class WebSocketMessagePayload {
    private String id;
    private String conversationId;
    private String senderId;
    private String senderName;
    private String text;
    private List<String> attachmentUrls;
    private String status;
    private Instant createdAt;
    private String time;
    private String type;

    public WebSocketMessagePayload() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getConversationId() { return conversationId; }
    public void setConversationId(String v) { this.conversationId = v; }

    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public List<String> getAttachmentUrls() { return attachmentUrls; }
    public void setAttachmentUrls(List<String> urls) { this.attachmentUrls = urls; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    // ── Builder ───────────────────────────────────────────────────────────────

    public static Builder builder() { return new Builder(); }

    public static final class Builder {
        private final WebSocketMessagePayload r = new WebSocketMessagePayload();
        public Builder id(String v)              { r.id = v;             return this; }
        public Builder conversationId(String v)  { r.conversationId = v; return this; }
        public Builder senderId(String v)        { r.senderId = v;       return this; }
        public Builder senderName(String v)      { r.senderName = v;     return this; }
        public Builder text(String v)            { r.text = v;           return this; }
        public Builder attachmentUrls(List<String> v) { r.attachmentUrls = v; return this; }
        public Builder status(String v)          { r.status = v;         return this; }
        public Builder createdAt(Instant v)      { r.createdAt = v;      return this; }
        public Builder time(String v)            { r.time = v;           return this; }
        public Builder type(String v)            { r.type = v;           return this; }
        public WebSocketMessagePayload build()   { return r; }
    }
}
