// ─── ICONS ───────────────────────────────────────────────────────────────────
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function DoubleCheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 6 7 17 2 12" />
      <polyline points="22 10 16 16" />
    </svg>
  );
}

// ─── MESSAGE BUBBLE ───────────────────────────────────────────────────────────
export function MessageBubble({ msg, isMe, showName }) {
  const attachments = msg.attachmentUrls || msg.images || [];
  const hasImages   = attachments.length > 0;
  const hasText     = msg.text && msg.text.trim();
  const isOptimistic = Boolean(msg._optimistic);

  return (
    <div className={`flex flex-col mb-1 transition-opacity duration-200 ${isMe ? 'items-end' : 'items-start'} ${isOptimistic ? 'opacity-75' : 'opacity-100'}`}>
      {showName && !isMe && (
        <span className="text-[12px] text-blue-500 ml-1 mb-1 font-semibold font-sans">
          {msg.senderName}
        </span>
      )}
      <div className="max-w-[68%]">
        {hasImages && (
          <div className={`flex flex-wrap gap-1 ${isMe ? 'justify-end' : 'justify-start'} ${hasText ? 'mb-1' : 'mb-0'}`}>
            {attachments.map((src, i) => (
              <img key={i} src={src} alt="attachment" className={`max-h-[200px] rounded-xl object-cover border border-blue-600/10 cursor-pointer block ${attachments.length === 1 ? 'max-w-[240px]' : 'max-w-[130px]'}`} />
            ))}
          </div>
        )}
        {hasText && (
          <div className={`py-2.5 px-3.5 text-[14px] leading-relaxed font-sans break-words ${isMe ? 'rounded-[18px_18px_4px_18px] bg-gradient-to-br from-blue-700 to-blue-500 text-white shadow-[0_2px_12px_rgba(37,99,235,0.25)] border-none' : 'rounded-[18px_18px_18px_4px] bg-blue-600/5 text-slate-800 border border-blue-600/10 shadow-none'}`}>
            {msg.text}
          </div>
        )}
      </div>
      <div className={`flex items-center gap-1 mt-[3px] ${isMe ? 'mr-0.5 ml-0' : 'mr-0 ml-0.5'}`}>
        <span className="text-[11px] text-slate-400 font-sans">
          {msg.time || (msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "")}
        </span>
        {isMe && (
          <span className={`${msg.status === "READ" ? 'text-blue-500' : 'text-slate-400'}`}>
            {msg.status === "SENT" ? <CheckIcon /> : <DoubleCheckIcon />}
          </span>
        )}
        {isOptimistic && <span className="text-[10px] text-slate-400">sending…</span>}
      </div>
    </div>
  );
}

// ─── TYPING INDICATOR ─────────────────────────────────────────────────────────
export function TypingIndicator({ name }) {
  return (
    <div className="flex items-end gap-2 mb-2">
      <div className="flex flex-col gap-1">
        {name && <span className="text-[11px] text-slate-400 ml-1 font-sans">{name} is typing</span>}
        <div className="flex items-center gap-[5px] bg-blue-600/5 border border-blue-600/10 rounded-[18px_18px_18px_4px] py-2.5 px-4">
          <div className="w-[7px] h-[7px] rounded-full bg-blue-600 animate-bounce-soft" style={{ animationDelay: '0s' }} />
          <div className="w-[7px] h-[7px] rounded-full bg-blue-600 animate-bounce-soft" style={{ animationDelay: '0.2s' }} />
          <div className="w-[7px] h-[7px] rounded-full bg-blue-600 animate-bounce-soft" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
}
