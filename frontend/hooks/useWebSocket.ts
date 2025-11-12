"use client";
import { useEffect, useRef, useState } from "react";

export function useWebSocket(baseUrl: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!baseUrl || !token) return;

    const urlWithToken = `${baseUrl}&token=${token}`;
    const socket = new WebSocket(urlWithToken);
    ws.current = socket;

    socket.onopen = () => console.log("✅ Connected:", urlWithToken);

    socket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);

        if (data.type === "history" && Array.isArray(data.messages)) {
          // Replace with old messages
          setMessages(data.messages);
        } else if (data.type === "chat_message") {
          // Append single message
          setMessages((prev) => [...prev, data]);
        } else if (data.message && typeof data.message === "string") {
          // Fallback for plain text messages
          setMessages((prev) => [
            ...prev,
            {
              type: "chat_message",
              message: data.message,
              username: data.username || "System",
              timestamp: data.timestamp || new Date().toISOString(),
            },
          ]);
        }
      } catch (err) {
        console.warn("Non-JSON message:", e.data);
      }
    };

    socket.onclose = () => console.log("❌ Disconnected");
    socket.onerror = (e) => console.error("⚠️ WebSocket error:", e);

    return () => socket.close();
  }, [baseUrl]);

  const send = (data: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    }
  };

  return { messages, send };
}
