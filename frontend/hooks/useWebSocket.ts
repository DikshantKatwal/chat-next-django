"use client";
import { useEffect, useRef, useState } from "react";

export function useWebSocket(baseUrl: string) {
  const [event, setEvent] = useState<any>(null); // 🔥 single event per message
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!baseUrl || !token) return;

    // Ensure token is appended correctly
    const separator = baseUrl.includes("?") ? "&" : "?";
    const url = `${baseUrl}${separator}token=${token}`;

    const socket = new WebSocket(url);
    ws.current = socket;
    socket.onopen = () => {
      // console.log("✅ WebSocket Connected:", url);
    };

    socket.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        setEvent(msg); // 🔥 emit single event
      } catch {
        console.warn("Received non-JSON:", e.data);
      }
    };

    socket.onerror = (e) => console.error("⚠️ WebSocket error:", e);
    socket.onclose = () => console.log("❌ WebSocket closed");

    return () => socket.close();
  }, [baseUrl]);

  const send = (payload: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(payload));
    }
  };

  return { event, send };
}
