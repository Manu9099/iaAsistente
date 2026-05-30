import { useRef } from "react";

const SESSION_ID = crypto.randomUUID();

export function useMemory() {
  const sessionId = useRef(SESSION_ID);

  async function saveMessage(role: string, content: string) {
    await fetch("http://localhost:8000/api/memory/conversation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId.current,
        role,
        content,
      }),
    });
  }

  async function loadHistory() {
    const res = await fetch(
      `http://localhost:8000/api/memory/conversation/${sessionId.current}`
    );
    return await res.json();
  }

  async function clearHistory() {
    await fetch(
      `http://localhost:8000/api/memory/conversation/${sessionId.current}`,
      { method: "DELETE" }
    );
  }

  return { sessionId: sessionId.current, saveMessage, loadHistory, clearHistory };
}
