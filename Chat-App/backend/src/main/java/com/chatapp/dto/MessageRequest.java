package com.chatapp.dto;

public class MessageRequest {
    private String text;

    public MessageRequest() {}
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
}
