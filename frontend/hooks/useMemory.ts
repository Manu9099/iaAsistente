import { useRef, useEffect, useState } from "react";

export function useMemory() {
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    const existing = localStorage.getItem("jarvis_session_id");
    if (existing) {
      setSessionId(existing);
    } else {
      const newId = crypto.randomUUID();
      localStorage.setItem("jarvis_session_id", newId);
      setSessionId(newId);
    }
  }, []);

  async function saveMessage(role: string, content: string) {
    if (!sessionId) return;
    await fetch("http://localhost:8000/api/memory/conversation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, role, content }),
    });
  }

  async function loadHistory() {
    if (!sessionId) return [];
    const res = await fetch(`http://localhost:8000/api/memory/conversation/${sessionId}`);
    return await res.json();
  }

  async function clearHistory() {
    if (!sessionId) return;
    await fetch(`http://localhost:8000/api/memory/conversation/${sessionId}`, { method: "DELETE" });
  }

  return { sessionId, saveMessage, loadHistory, clearHistory };
}