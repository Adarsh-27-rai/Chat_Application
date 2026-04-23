import { useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { WS_URL } from "../constants/data";

/**
 * Manages a single STOMP/SockJS connection to the backend.
 *
 * @param {string|null} token  - JWT token; null = not connected
 * @param {string|null} convId - Active conversation ID to subscribe to
 * @param {(payload) => void} onMessage - Called for incoming MESSAGE/TYPING payloads
 * @returns {{ wsStatus, publish }}
 */
export function useWebSocket({ token, convId, onMessage, wsStatusRef }) {
  const clientRef      = useRef(null);
  const subscriptionRef = useRef(null);
  const convIdRef      = useRef(convId);

  // Keep convId ref in sync without reconnecting
  useEffect(() => { convIdRef.current = convId; }, [convId]);

  // ── Connect / disconnect when token changes ──────────────────────────────
  useEffect(() => {
    if (!token) {
      clientRef.current?.deactivate();
      clientRef.current = null;
      wsStatusRef.current = "disconnected";
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,

      onConnect: () => {
        wsStatusRef.current = "connected";
        // Subscribe to the current conversation if already selected
        if (convIdRef.current) {
          resubscribe(client, convIdRef.current);
        }
      },

      onDisconnect: () => {
        wsStatusRef.current = "disconnected";
      },

      onStompError: (frame) => {
        console.error("STOMP error:", frame);
        wsStatusRef.current = "error";
      },
    });

    client.activate();
    clientRef.current = client;

    return () => { client.deactivate(); };
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Re-subscribe when active conversation changes ────────────────────────
  useEffect(() => {
    const client = clientRef.current;
    if (!client || !client.connected || !convId) return;
    resubscribe(client, convId);
  }, [convId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers ──────────────────────────────────────────────────────────────
  function resubscribe(client, id) {
    // Unsubscribe from previous conversation
    subscriptionRef.current?.unsubscribe();
    subscriptionRef.current = client.subscribe(
      `/topic/conversations/${id}`,
      (stompMsg) => {
        try {
          const payload = JSON.parse(stompMsg.body);
          onMessage(payload);
        } catch (e) {
          console.error("Failed to parse WS message", e);
        }
      }
    );
  }

  // ── Publish helper ────────────────────────────────────────────────────────
  const publish = useCallback((destination, body) => {
    const client = clientRef.current;
    if (client?.connected) {
      client.publish({ destination, body: JSON.stringify(body) });
    }
  }, []);

  return { publish };
}
