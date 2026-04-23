import { useState, useRef, useEffect, useCallback } from "react";
import { EMOJI_CATEGORIES } from "../constants/data";

// ─── ICONS ───────────────────────────────────────────────────────────────────
function ImageIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}
function EmojiIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  );
}
function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="-ml-0.5">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// ─── EMOJI PICKER ─────────────────────────────────────────────────────────────
function EmojiPicker({ onSelect, onClose }) {
  const [activeCategory, setActiveCategory] = useState(Object.keys(EMOJI_CATEGORIES)[0]);
  const [emojiSearch, setEmojiSearch] = useState("");
  const pickerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) onClose();
    };
    setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const filteredEmojis = emojiSearch
    ? Object.values(EMOJI_CATEGORIES).flat().filter((e) => e.includes(emojiSearch))
    : EMOJI_CATEGORIES[activeCategory];

  return (
    <div ref={pickerRef} className="absolute bottom-[calc(100%+10px)] right-0 w-[320px] bg-[#f8fbff] border border-blue-600/10 rounded-2xl shadow-[0_8px_32px_rgba(37,99,235,0.18)] overflow-hidden z-[100] animate-pop-up">
      <div className="p-2.5 pb-1.5">
        <div className="flex items-center gap-2 bg-blue-600/5 rounded-[10px] py-[7px] px-2.5">
          <span className="text-slate-400"><SearchIcon /></span>
          <input
            value={emojiSearch} onChange={(e) => setEmojiSearch(e.target.value)}
            placeholder="Search emoji..."
            className="flex-1 bg-transparent border-none outline-none text-slate-800 text-[13px] font-sans"
          />
        </div>
      </div>
      {!emojiSearch && (
        <div className="flex gap-0.5 py-1 px-2 overflow-x-auto border-b border-blue-600/5 scrollbar-none">
          {Object.keys(EMOJI_CATEGORIES).map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`rounded-lg py-1 px-2 cursor-pointer text-[18px] leading-none shrink-0 transition-all duration-100 ${activeCategory === cat ? 'bg-blue-600/15 border border-blue-600/25' : 'bg-transparent border border-transparent'}`} title={cat}>
              {cat.split(" ")[0]}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-8 gap-0.5 p-2 max-h-[220px] overflow-y-auto">
        {filteredEmojis.map((emoji, i) => (
          <button key={i} onClick={() => onSelect(emoji)} className="bg-transparent border-none rounded-lg p-1 text-[22px] cursor-pointer leading-none transition-colors duration-100 flex items-center justify-center hover:bg-blue-600/10">
            {emoji}
          </button>
        ))}
        {filteredEmojis.length === 0 && (
          <div className="col-span-full text-center text-slate-400 py-6 text-[13px] font-sans">
            No emoji found
          </div>
        )}
      </div>
    </div>
  );
}

// ─── IMAGE PREVIEW STRIP ──────────────────────────────────────────────────────
function ImagePreviewStrip({ images, onRemove }) {
  if (!images.length) return null;
  return (
    <div className="flex gap-2 pt-2.5 px-3.5 pb-1.5 flex-wrap border-b border-blue-600/5">
      {images.map((img, i) => (
        <div key={i} className="relative">
          <img src={img.preview} alt="preview" className="w-[68px] h-[68px] object-cover rounded-[10px] border-2 border-blue-600/35 block" />
          <button onClick={() => onRemove(i)} className="absolute -top-[7px] -right-[7px] w-5 h-5 rounded-full bg-red-500 border-2 border-white text-white cursor-pointer flex items-center justify-center p-0">
            <CloseIcon />
          </button>
        </div>
      ))}
      {images.length < 5 && (
        <div className="w-[68px] h-[68px] rounded-[10px] border-2 border-dashed border-blue-600/25 flex items-center justify-center text-slate-400 text-[22px]">
          +
        </div>
      )}
    </div>
  );
}

// ─── CHAT INPUT ───────────────────────────────────────────────────────────────
export default function ChatInput({ input, setInput, pendingImages, setPendingImages, showEmojiPicker, setShowEmojiPicker, onSend, onEmojiSelect, onImageSelect, onRemoveImage, onTyping, sending }) {
  const inputRef = useRef(null);
  const imageInputRef = useRef(null);
  const typingThrottle = useRef(null);

  const canSend = (input.trim() || pendingImages.length > 0) && !sending;

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
  };

  const handleChange = useCallback((e) => {
    setInput(e.target.value);
    if (!typingThrottle.current) {
      onTyping?.();
      typingThrottle.current = setTimeout(() => { typingThrottle.current = null; }, 1500);
    }
  }, [setInput, onTyping]);

  return (
    <div className="border-t border-blue-600/5 bg-white">
      <ImagePreviewStrip images={pendingImages} onRemove={onRemoveImage} />
      <div className="pt-2.5 px-4 pb-3">
        <div className="flex items-center justify-between gap-2 bg-blue-600/5 border border-blue-600/10 rounded-2xl py-2 px-2.5">
          <button
            onClick={() => imageInputRef.current?.click()} title={`Attach image (${pendingImages.length}/5)`} disabled={pendingImages.length >= 5}
            className={`rounded-lg p-1.5 shrink-0 flex items-center transition-all duration-150 relative ${pendingImages.length > 0 ? 'bg-blue-600/10 border border-blue-600/20 text-blue-500' : 'bg-transparent border border-transparent text-slate-500 hover:text-blue-500'} ${pendingImages.length >= 5 ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
          >
            <ImageIcon />
            {pendingImages.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center font-sans">
                {pendingImages.length}
              </span>
            )}
          </button>
          <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onImageSelect} />

          <textarea
            ref={inputRef} value={input} onChange={handleChange} onKeyDown={handleKeyDown}
            placeholder={pendingImages.length ? "Add a caption..." : "Message..."} rows={1}
            className="flex-1 bg-transparent border-none outline-none text-slate-800 text-[14px] font-sans leading-relaxed overflow-y-auto pt-[3px] scrollbar-none flex items-center"
            onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px"; }}
          />

          <div className="relative shrink-0">
            <button
              onClick={() => setShowEmojiPicker((p) => !p)}
              className={`rounded-lg p-1.5 cursor-pointer flex items-center transition-colors duration-150 ${showEmojiPicker ? 'bg-blue-600/15 border border-blue-600/25 text-blue-500' : 'bg-transparent border border-transparent text-slate-500 hover:text-blue-500'}`}
            >
              <EmojiIcon />
            </button>
            {showEmojiPicker && <EmojiPicker onSelect={onEmojiSelect} onClose={() => setShowEmojiPicker(false)} />}
          </div>

          <button onClick={onSend} disabled={!canSend} className={`w-9 h-9 rounded-[10px] border-none flex items-center justify-center shrink-0 transition-all duration-150 ${canSend ? 'bg-gradient-to-br from-blue-700 to-blue-500 text-white cursor-pointer shadow-[0_2px_12px_rgba(37,99,235,0.3)]' : 'bg-blue-600/5 text-slate-400 cursor-default shadow-none'}`}>
            {sending ? <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <SendIcon />}
          </button>
        </div>
        <div className="mt-[7px] text-center">
          <span className="text-[11px] text-slate-300 font-sans">
            Enter to send · Shift+Enter for new line · Up to 5 images per message
          </span>
        </div>
      </div>
    </div>
  );
}
