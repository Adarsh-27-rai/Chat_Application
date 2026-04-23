package com.chatapp.dto;

public class AuthResponse {
    private String token;
    private String userId;
    private String username;
    private String displayName;
    private String avatarColor;
    private String email;

    public AuthResponse() {}

    public AuthResponse(String token, String userId, String username,
                        String displayName, String avatarColor, String email) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.displayName = displayName;
        this.avatarColor = avatarColor;
        this.email = email;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getAvatarColor() { return avatarColor; }
    public void setAvatarColor(String avatarColor) { this.avatarColor = avatarColor; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    // ── Builder ───────────────────────────────────────────────────────────────

    public static Builder builder() { return new Builder(); }

    public static final class Builder {
        private final AuthResponse r = new AuthResponse();
        public Builder token(String v)       { r.token = v;       return this; }
        public Builder userId(String v)      { r.userId = v;      return this; }
        public Builder username(String v)    { r.username = v;    return this; }
        public Builder displayName(String v) { r.displayName = v; return this; }
        public Builder avatarColor(String v) { r.avatarColor = v; return this; }
        public Builder email(String v)       { r.email = v;       return this; }
        public AuthResponse build() { return r; }
    }
}
