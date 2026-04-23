import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import MainChat from "../components/MainChat";
import { fetchConversations, fetchMessages, sendMessageRest, uploadAttachments, startDirectConversation } from "../services/api";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { WS_URL } from "../constants/data";

function Spinner() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#f0f6ff]">
      <div className="w-10 h-10 rounded-full border-[3px] border-blue-600/15 border-t-blue-500 animate-spin-slow" />
    </div>
  );
}

export default function ChatDashboard({ authUser, onLogout }) {
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authUser) navigate("/login");
  }, [authUser, navigate]);

  // ── Chat state ───────────────────────────────────────────────────────────────
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pendingImages, setPendingImages] = useState([]);
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [wsStatus, setWsStatus] = useState("disconnected");

  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);
  const typingTimerRef = useRef(null);
  const typingThrottle = useRef(null);
  const authUserRef = useRef(authUser);
  const activeConvIdRef = useRef(activeConvId);

  useEffect(() => { authUserRef.current = authUser; }, [authUser]);
  useEffect(() => { activeConvIdRef.current = activeConvId; }, [activeConvId]);

  // ── WebSocket setup ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authUser?.token) {
      stompClientRef.current?.deactivate();
      stompClientRef.current = null;
      setWsStatus("disconnected");
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${authUser.token}` },
      reconnectDelay: 5000,

      onConnect: () => {
        setWsStatus("connected");
        const cid = activeConvIdRef.current;
        if (cid) subscribeToConversation(client, cid);
      },

      onDisconnect: () => setWsStatus("disconnected"),
      onStompError: () => setWsStatus("error"),
    });

    client.activate();
    stompClientRef.current = client;

    return () => { client.deactivate(); };
  }, [authUser?.token]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Re-subscribe when conversation changes ───────────────────────────────────
  useEffect(() => {
    const client = stompClientRef.current;
    if (!client || !client.connected || !activeConvId) return;
    subscribeToConversation(client, activeConvId);
  }, [activeConvId]);

  function subscribeToConversation(client, convId) {
    subscriptionRef.current?.unsubscribe();
    subscriptionRef.current = client.subscribe(
      `/topic/conversations/${convId}`,
      (stompMsg) => {
        try {
          const payload = JSON.parse(stompMsg.body);
          handleIncomingWsMessage(payload);
        } catch (e) {
          console.error("WS parse error", e);
        }
      }
    );
  }

  function handleIncomingWsMessage(payload) {
    if (payload.type === "TYPING") {
      if (payload.senderId !== authUserRef.current?.userId) {
        setIsTyping(true);
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => setIsTyping(false), 2500);
      }
      return;
    }

    if (payload.type === "MESSAGE") {
      if (payload.senderId === authUserRef.current?.userId) return;

      setMessages((prev) => {
        const existing = prev[payload.conversationId] || [];
        if (existing.some((m) => m.id === payload.id)) return prev;
        return { ...prev, [payload.conversationId]: [...existing, payload] };
      });

      setConversations((prev) =>
        prev.map((c) =>
          c.id === payload.conversationId
            ? { ...c, lastMessage: payload.text || "📷 Photo", lastMessageTime: payload.createdAt }
            : c
        )
      );
    }
  }

  // ── Publish helper ───────────────────────────────────────────────────────────
  const publish = useCallback((destination, body) => {
    const client = stompClientRef.current;
    if (client?.connected) {
      client.publish({ destination, body: JSON.stringify(body) });
    }
  }, []);

  // ── Load conversations ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!authUser) return;
    setLoadingConvs(true);
    fetchConversations()
      .then((data) => {
        setConversations(data);
        if (data.length > 0) setActiveConvId(data[0].id);
      })
      .catch(console.error)
      .finally(() => setLoadingConvs(false));
  }, [authUser?.token]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load messages when conversation changes ──────────────────────────────────
  useEffect(() => {
    if (!activeConvId) return;
    if (messages[activeConvId]) return;

    setLoadingMsgs(true);
    fetchMessages(activeConvId)
      .then((data) => setMessages((prev) => ({ ...prev, [activeConvId]: data })))
      .catch(console.error)
      .finally(() => setLoadingMsgs(false));
  }, [activeConvId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Reset transient UI on switch ────────────────────────────────────────────
  useEffect(() => {
    setShowEmojiPicker(false);
    setPendingImages([]);
    setInput("");
    setIsTyping(false);
  }, [activeConvId]);

  // ── Emoji ───────────────────────────────────────────────────────────────────
  const handleEmojiSelect = useCallback((emoji) => {
    setInput((prev) => prev + emoji);
    setShowEmojiPicker(false);
  }, []);

  // ── Image selection ─────────────────────────────────────────────────────────
  const handleImageSelect = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    files.slice(0, 5 - pendingImages.length).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) =>
        setPendingImages((prev) => [...prev, { preview: ev.target.result, name: file.name, file }]);
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }, [pendingImages.length]);

  const removeImage = useCallback((i) => setPendingImages((prev) => prev.filter((_, idx) => idx !== i)), []);

  // ── Typing signal ────────────────────────────────────────────────────────────
  const handleTyping = useCallback(() => {
    if (!activeConvId) return;
    if (!typingThrottle.current) {
      publish(`/app/chat/${activeConvId}/typing`, {});
      typingThrottle.current = setTimeout(() => { typingThrottle.current = null; }, 1500);
    }
  }, [activeConvId, publish]);

  // ── Send message ─────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    if ((!input.trim() && !pendingImages.length) || sending || !activeConvId) return;
    setSending(true);

    const optId = `opt_${Date.now()}`;
    const optimistic = {
      id: optId,
      _optimistic: optId,
      conversationId: activeConvId,
      senderId: authUser.userId,
      senderName: authUser.displayName,
      text: input.trim(),
      attachmentUrls: pendingImages.map((img) => img.preview),
      status: "SENT",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] || []), optimistic],
    }));

    const savedText = input.trim();
    const savedImages = [...pendingImages];
    setInput("");
    setPendingImages([]);
    setShowEmojiPicker(false);

    try {
      const saved = savedImages.length
        ? await uploadAttachments(activeConvId, savedImages, savedText)
        : await sendMessageRest(activeConvId, savedText);

      setMessages((prev) => ({
        ...prev,
        [activeConvId]: (prev[activeConvId] || []).map((m) =>
          m._optimistic === optId ? { ...saved } : m
        ),
      }));
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? { ...c, lastMessage: saved.text || "📷 Photo", lastMessageTime: saved.createdAt }
            : c
        )
      );
    } catch (err) {
      console.error("Send failed:", err);
      setMessages((prev) => ({
        ...prev,
        [activeConvId]: (prev[activeConvId] || []).filter((m) => m._optimistic !== optId),
      }));
      setInput(savedText);
      setPendingImages(savedImages);
    } finally {
      setSending(false);
    }
  }, [input, pendingImages, activeConvId, authUser, sending]);

  // ── New DM ───────────────────────────────────────────────────────────────────
  const handleNewChat = useCallback(async (userId) => {
    const conv = await startDirectConversation(userId);
    setConversations((prev) => {
      if (prev.find((c) => c.id === conv.id)) return prev;
      return [conv, ...prev];
    });
    setActiveConvId(conv.id);
    return conv;
  }, []);

  const activeConv = conversations.find((c) => c.id === activeConvId) || null;
  const activeMessages = messages[activeConvId] || [];

  if (!authUser) return null; // Wait for redirect
  if (loadingConvs) return <Spinner />;

  return (
    <div className="flex h-screen w-full bg-[#f0f6ff] font-sans overflow-hidden">
      <Sidebar
        conversations={conversations}
        activeConvId={activeConvId}
        search={search}
        onSearch={setSearch}
        onSelect={setActiveConvId}
        wsStatus={wsStatus}
        currentUser={authUser}
        onLogout={onLogout}
        onNewChat={handleNewChat}
      />
      <MainChat
        activeConv={activeConv}
        messages={activeMessages}
        isTyping={isTyping}
        loadingMsgs={loadingMsgs}
        input={input}
        setInput={setInput}
        pendingImages={pendingImages}
        setPendingImages={setPendingImages}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
        onSend={sendMessage}
        onEmojiSelect={handleEmojiSelect}
        onImageSelect={handleImageSelect}
        onRemoveImage={removeImage}
        onTyping={handleTyping}
        currentUserId={authUser.userId}
        sending={sending}
      />
    </div>
  );
}
