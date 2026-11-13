"use client";
import { useEffect, useRef, useState, useCallback } from "react";

interface SocketMessage {
  type: string;
  [key: string]: any;
}

export function useBankerSocket(
  currentUserId?: string,
  currentUserName?: string,
  currentUserBank?: string,
  onMessageReceived?: (msg: any, sender: { id: string; name: string; bank: string }) => void,
  onConnectionRequestReceived?: (data: any) => void,
  onConnectionAccepted?: (data: any) => void
) {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const pingIntervalRef = useRef<any>(null);

  // Request browser notification permission once
  const requestNotificationPermission = useCallback(async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        try {
          await Notification.requestPermission();
        } catch (e) {
          console.warn("Notification permission request failed:", e);
        }
      }
    }
  }, []);

  const triggerBrowserNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        try {
          const n = new Notification(title, {
            icon: "/images/logo.webp",
            badge: "/images/logo.webp",
            ...options,
          });
          n.onclick = () => {
            window.focus();
            n.close();
          };
        } catch (e) {
          console.warn("Error displaying desktop notification:", e);
        }
      }
    }
  }, []);

  const connect = useCallback(() => {
    if (!currentUserId || typeof window === "undefined") return;

    // Determine WS URL
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.hostname;
    const wsUrl = `${protocol}//${host}:3002?userId=${currentUserId}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        console.log("[Bankers WS] Connected successfully to", wsUrl);

        // Keep-alive heartbeat
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        try {
          const data: SocketMessage = JSON.parse(event.data);

          if (data.type === "connected") {
            if (Array.isArray(data.onlineUsers)) {
              setOnlineUsers(data.onlineUsers);
            }
          }

          if (data.type === "presence_change") {
            setOnlineUsers((prev) => {
              if (data.isOnline) {
                return Array.from(new Set([...prev, data.userId]));
              } else {
                return prev.filter((id) => id !== data.userId);
              }
            });
          }

          if (data.type === "new_message") {
            if (onMessageReceived) {
              onMessageReceived(data.message, {
                id: data.senderId,
                name: data.senderName,
                bank: data.senderBank,
              });
            }

            // Trigger Desktop Notification if tab is inactive or hidden
            if (document.hidden) {
              triggerBrowserNotification(`New Message from ${data.senderName}`, {
                body: data.message?.content || "Sent you a message on Bankers Connect",
                tag: `msg_${data.senderId}`,
              });
            }
          }

          if (data.type === "new_connection_request") {
            if (onConnectionRequestReceived) {
              onConnectionRequestReceived(data);
            }
            triggerBrowserNotification(`Connection Request from ${data.senderName}`, {
              body: `${data.senderBank ? `${data.senderBank} • ` : ""}${data.introMessage || "Would like to connect with you on Bankers Connect."}`,
              tag: `conn_${data.senderId}`,
            });
          }

          if (data.type === "connection_accepted") {
            if (onConnectionAccepted) {
              onConnectionAccepted(data);
            }
            triggerBrowserNotification(`Connection Accepted!`, {
              body: `${data.responderName} (${data.responderBank}) accepted your connection request. You can now chat in real-time.`,
              tag: `accepted_${data.responderId}`,
            });
          }
        } catch (e) {
          console.error("[Bankers WS] Message error:", e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        clearInterval(pingIntervalRef.current);
        // Attempt reconnect in 4 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 4000);
      };

      ws.onerror = (err) => {
        console.warn("[Bankers WS] Connection notice: WebSocket server offline or reconnecting.");
        ws.close();
      };
    } catch (e) {
      console.warn("[Bankers WS] Init error:", e);
    }
  }, [
    currentUserId,
    onMessageReceived,
    onConnectionRequestReceived,
    onConnectionAccepted,
    triggerBrowserNotification,
  ]);

  useEffect(() => {
    connect();
    requestNotificationPermission();

    return () => {
      clearInterval(pingIntervalRef.current);
      clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect, requestNotificationPermission]);

  const sendChatMessage = useCallback(
    (recipientId: string, message: any) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "chat_message",
            recipientId,
            message,
            senderName: currentUserName,
            senderBank: currentUserBank,
          })
        );
      }
    },
    [currentUserName, currentUserBank]
  );

  const sendConnectionRequestNotification = useCallback(
    (recipientId: string, introMessage?: string) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "connection_request",
            recipientId,
            senderName: currentUserName,
            senderBank: currentUserBank,
            introMessage,
          })
        );
      }
    },
    [currentUserName, currentUserBank]
  );

  const sendConnectionAcceptedNotification = useCallback(
    (requesterId: string) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "connection_accepted",
            requesterId,
            responderName: currentUserName,
            responderBank: currentUserBank,
          })
        );
      }
    },
    [currentUserName, currentUserBank]
  );

  return {
    isConnected,
    onlineUsers,
    sendChatMessage,
    sendConnectionRequestNotification,
    sendConnectionAcceptedNotification,
    triggerBrowserNotification,
    requestNotificationPermission,
  };
}
