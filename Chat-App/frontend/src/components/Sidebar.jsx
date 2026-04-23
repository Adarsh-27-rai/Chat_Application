import { useState, useEffect, useRef, useCallback } from "react";
import { searchUsers } from "../services/api";

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function NewChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

// AVATAR
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

// NEW CHAT MODAL
function NewChatModal({ onClose, onStartChat }) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(null);
  const inputRef = useRef(null);
  const debounce = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    doSearch("");
  }, []);

  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(debounce.current);
  }, [query]);

  async function doSearch(q) {
    setLoading(true);
    setError("");
    try {
      const results = await searchUsers(q);
      setUsers(results);
    } catch (e) {
      console.error("User search failed:", e);
      setError(e?.response?.data?.message || "Search failed — is the backend running?");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  const handleUserClick = useCallback(async (user) => {
    setStarting(user.id);
    try {
      await onStartChat(user.id);
      onClose();
    } finally {
      setStarting(null);
    }
  }, [onStartChat, onClose]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/45 z-50 backdrop-blur-[2px] animate-fade-slide"
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] bg-white rounded-[20px] shadow-[0_24px_64px_rgba(37,99,235,0.18),0_4px_16px_rgba(0,0,0,0.08)] z-[51] overflow-hidden animate-pop-up font-sans">

        {/* Header */}
        <div className="p-5 pb-4 border-b border-blue-600/10 flex items-center justify-between">
          <div>
            <h2 className="text-[17px] font-bold text-slate-900 m-0">New Conversation</h2>
            <p className="text-[12px] text-slate-400 mt-0.5">Search for a user to start chatting</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border-none bg-blue-600/5 hover:bg-red-500/10 text-slate-500 cursor-pointer flex items-center justify-center text-lg transition-all duration-150"
          >✕</button>
        </div>

        <div className="pt-3.5 px-5 pb-2.5">
          <div className="flex items-center gap-2.5 bg-blue-600/5 border-[1.5px] border-blue-600/10 focus-within:border-blue-500 rounded-xl py-2.5 px-3.5 transition-colors duration-150">
            <div className="text-slate-400"><SearchIcon /></div>
            <input
              ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by username or name…"
              className="flex-1 bg-transparent border-none outline-none text-[14px] text-slate-900 font-sans"
            />
            {loading && <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-600/20 border-t-blue-500 animate-spin shrink-0" />}
          </div>
        </div>

        <div className="max-h-[340px] overflow-y-auto px-2 pt-1 pb-3">
          {error ? (
            <div className="m-3 p-3 bg-red-500/10 border border-red-500/20 rounded-[10px] text-red-600 text-[13px]">
              ⚠️ {error}
            </div>
          ) : users.length === 0 && !loading ? (
            <div className="p-8 text-center text-slate-400 text-[13px]">
              <div className="text-[28px] mb-2">👤</div>
              {query ? `No users found for "${query}"` : "No other users registered yet"}
            </div>
          ) : (
            users.map((user) => (
              <button
                key={user.id} onClick={() => handleUserClick(user)} disabled={starting === user.id}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl border-none bg-transparent hover:bg-blue-600/5 transition-colors duration-150 text-left ${starting === user.id ? 'cursor-wait' : 'cursor-pointer'} ${starting && starting !== user.id ? 'opacity-50' : 'opacity-100'}`}
              >
                <Avatar name={user.displayName} color={user.avatarColor} size={42} online={user.online === "true" || user.online === true} />
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-slate-900">{user.displayName}</div>
                  <div className="text-[12px] text-slate-400">@{user.username}</div>
                </div>
                {starting === user.id ? (
                  <div className="w-[18px] h-[18px] rounded-full border-2 border-blue-600/20 border-t-blue-500 animate-spin shrink-0" />
                ) : (
                  <div className="text-[11px] text-blue-500 font-semibold bg-blue-600/10 py-[3px] px-2.5 rounded-full shrink-0">Message</div>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}

// CONVERSATION ITEM
function ConversationItem({ conv, isActive, onClick }) {
  const timeLabel = (() => {
    if (!conv.lastMessageTime) return "";
    const d = new Date(conv.lastMessageTime);
    const now = new Date();
    const diffDays = Math.floor((now - d) / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return d.toLocaleDateString([], { weekday: "long" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  })();

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 py-3 px-4 cursor-pointer rounded-xl mx-2 my-0.5 transition-colors duration-150 ${isActive ? 'bg-blue-600/10 hover:bg-blue-600/10' : 'bg-transparent hover:bg-blue-600/5'}`}
    >
      <Avatar name={conv.name} color={conv.avatarColor} size={44} online={conv.online} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-[3px]">
          <span className="text-[14px] font-semibold text-slate-900 font-sans">{conv.name}</span>
          <span className={`text-[11px] font-sans shrink-0 ${conv.unread > 0 ? 'text-blue-500' : 'text-slate-400'}`}>{timeLabel}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className={`text-[13px] font-sans overflow-hidden text-ellipsis whitespace-nowrap flex-1 mr-1.5 ${conv.unread > 0 ? 'text-blue-600' : 'text-slate-500'}`}>
            {conv.lastMessage || "No messages yet"}
          </span>
          {conv.unread > 0 && (
            <div className="bg-blue-600 text-white rounded-full text-[11px] font-bold py-[1px] px-[7px] min-w-[20px] text-center font-sans shrink-0">
              {conv.unread}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// SIDEBAR
export default function Sidebar({ conversations, activeConvId, search, onSearch, onSelect, wsStatus, currentUser, onLogout, onNewChat }) {
  const [showNewChat, setShowNewChat] = useState(false);
  const filteredConvs = conversations.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="w-[300px] shrink-0 flex flex-col border-r border-blue-600/10 bg-[#eef4ff]">

      <div className="pt-5 px-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-[34px] h-[34px] rounded-[10px] bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          </div>
          <span className="text-[16px] font-bold text-slate-900 tracking-[-0.02em]">PulseChat</span>
        </div>
        <button
          onClick={() => setShowNewChat(true)}
          title="New conversation"
          className="w-[34px] h-[34px] rounded-[10px] bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/15 text-blue-500 cursor-pointer flex items-center justify-center transition-colors duration-150"
        >
          <NewChatIcon />
        </button>
        {showNewChat && <NewChatModal onClose={() => setShowNewChat(false)} onStartChat={async (userId) => { await onNewChat(userId); setShowNewChat(false); }} />}
      </div>

      <div className="px-3 pb-3">
        <div className="flex items-center gap-2 bg-blue-600/5 border border-blue-600/10 rounded-[10px] py-2 px-3">
          <span className="text-slate-400"><SearchIcon /></span>
          <input
            value={search} onChange={(e) => onSearch(e.target.value)}
            placeholder="Search conversations..."
            className="flex-1 bg-transparent border-none outline-none text-slate-800 text-[13px] font-sans"
          />
        </div>
      </div>

      <div className="px-4 pb-2.5 flex items-center gap-1.5">
        <div className={`w-[7px] h-[7px] rounded-full ${wsStatus === "connected" ? "bg-green-500" : wsStatus === "error" ? "bg-amber-500" : "bg-red-500"}`} />
        <span className="text-[11px] text-slate-400 font-sans">
          {wsStatus === "connected" ? "Live" : wsStatus === "error" ? "Reconnecting…" : "Connecting…"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pl-4 pb-1 mb-1">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-[0.08em]">Messages</span>
        </div>
        {filteredConvs.length === 0 ? (
          <div className="p-5 text-center text-slate-400 text-[13px]">
            {search ? "No results" : "No conversations yet"}
          </div>
        ) : (
          filteredConvs.map((conv) => <ConversationItem key={conv.id} conv={conv} isActive={conv.id === activeConvId} onClick={() => onSelect(conv.id)} />)
        )}
      </div>

      <div className="py-3 px-4 border-t border-blue-600/5 flex items-center gap-2.5">
        <Avatar name={currentUser?.displayName || "You"} color={currentUser?.avatarColor || "#2563eb"} size={36} online />
        <div className="flex-1">
          <div className="text-[13px] font-semibold text-slate-900">{currentUser?.displayName || "You"}</div>
          <div className="text-[11px] text-slate-400">@{currentUser?.username}</div>
        </div>
        <button
          onClick={onLogout} title="Sign out"
          className="bg-transparent border-none text-slate-400 hover:text-red-500 cursor-pointer p-1 rounded-md transition-colors duration-150"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
        </button>
      </div>
    </div>
  );
}
