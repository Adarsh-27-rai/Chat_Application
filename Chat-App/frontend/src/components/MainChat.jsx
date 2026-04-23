import { useRef, useEffect } from "react";
import ChatInput from "./ChatInput";
import { MessageBubble, TypingIndicator } from "./MessageBubble";

// ─── ICONS ───────────────────────────────────────────────────────────────────
function VideoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}
function MoreIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

// ─── AVATAR ───────────────────────────────────────────────────────────────────
const getInitials = (name) => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

function Avatar({ name, color, size = 40, online = false }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div 
        className="w-full h-full rounded-full flex items-center justify-center font-semibold text-white font-sans tracking-[0.02em]"
        style={{ background: color || "#2563eb", fontSize: size * 0.35 }}
      >
        {getInitials(name)}
      </div>
      {online && (
        <div 
          className="absolute bottom-0.5 right-0.5 rounded-full bg-green-500 border-2 border-[#f0f6ff]"
          style={{ width: size * 0.28, height: size * 0.28 }}
        />
      )}
    </div>
  );
}

// ─── LOADING SKELETON ─────────────────────────────────────────────────────────
function MessageSkeleton() {
  const bar = (w, align) => (
    <div 
      className={`h-[14px] rounded-lg bg-blue-600/10 mb-2 ${align === "right" ? "self-end" : "self-start"}`} 
      style={{ width: w }} 
    />
  );
  return (
    <div className="flex flex-col gap-3 py-5 px-6">
      {bar("55%", "left")}
      {bar("38%", "right")}
      {bar("62%", "left")}
      {bar("45%", "right")}
      {bar("70%", "left")}
    </div>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function NavBar({ activeConv }) {
  return (
    <div className="py-3.5 px-6 border-b border-blue-600/10 flex items-center justify-between bg-white">
      <div className="flex items-center gap-3">
        <Avatar name={activeConv.name} color={activeConv.avatarColor} size={40} online={activeConv.online} />
        <div>
          <div className="text-[15px] font-bold text-slate-900 tracking-[-0.01em]">{activeConv.name}</div>
          <div className={`text-[12px] ${activeConv.online ? 'text-green-500' : 'text-slate-400'}`}>
            {activeConv.isGroup ? "Group chat" : activeConv.online ? "Online" : "Offline"}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        {[VideoIcon, MoreIcon].map((Ic, i) => (
          <button key={i} className="w-9 h-9 rounded-[10px] bg-blue-600/5 border border-blue-600/10 text-slate-500 cursor-pointer flex items-center justify-center hover:bg-blue-600/10 transition-colors">
            <Ic />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN CHAT ────────────────────────────────────────────────────────────────
export default function MainChat({
  activeConv, messages, isTyping, loadingMsgs,
  input, setInput, pendingImages, setPendingImages,
  showEmojiPicker, setShowEmojiPicker,
  onSend, onEmojiSelect, onImageSelect, onRemoveImage,
  onTyping, currentUserId, sending,
}) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {activeConv ? (
        <>
          <NavBar activeConv={activeConv} />
          <div className="flex-1 overflow-y-auto py-5 px-6 flex flex-col gap-0.5">
            {loadingMsgs ? (
              <MessageSkeleton />
            ) : messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center flex-col gap-2 text-slate-300 text-[14px] font-sans">
                <div className="text-4xl">💬</div>
                <div>No messages yet. Say hello!</div>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMe = msg.senderId === currentUserId;
                const prevMsg = messages[i - 1];
                const showName = !isMe && msg.senderName && (!prevMsg || prevMsg.senderId !== msg.senderId);
                return (
                  <div key={msg.id || msg._optimistic || i} className="animate-fade-slide">
                    <MessageBubble msg={msg} isMe={isMe} showName={showName} />
                  </div>
                );
              })
            )}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
          <ChatInput
            input={input} setInput={setInput} pendingImages={pendingImages} setPendingImages={setPendingImages}
            showEmojiPicker={showEmojiPicker} setShowEmojiPicker={setShowEmojiPicker}
            onSend={onSend} onEmojiSelect={onEmojiSelect} onImageSelect={onImageSelect} onRemoveImage={onRemoveImage}
            onTyping={onTyping} sending={sending}
          />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center flex-col gap-3 text-slate-400 font-sans">
          <div className="text-5xl">💬</div>
          <div className="text-[16px] font-medium text-slate-900">Select a conversation to start chatting</div>
          <div className="text-[13px]">Your messages are end-to-end encrypted</div>
        </div>
      )}
    </div>
  );
}
