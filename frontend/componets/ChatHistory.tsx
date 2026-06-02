"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Session {
  session_id: string;
  started_at: string;
  last_at: string;
  message_count: number;
  preview?: string;
}

interface Props {
  currentSessionId: string;
  onLoadSession: (sessionId: string, messages: any[]) => void;
}

export default function ChatHistory({ currentSessionId, onLoadSession }: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function loadSessions() {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/memory/sessions");
      const data = await res.json();

      const withPreviews = await Promise.all(
        data.map(async (s: Session) => {
          const prev = await fetch(
            `http://localhost:8000/api/memory/session/preview/${s.session_id}`
          );
          const prevData = await prev.json();
          return { ...s, preview: prevData.preview };
        })
      );

      setSessions(withPreviews);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadSession(sessionId: string) {
    const res = await fetch(
      `http://localhost:8000/api/memory/conversation/${sessionId}`
    );
    const messages = await res.json();
    onLoadSession(sessionId, messages);
    setIsOpen(false);
  }

  async function deleteSession(sessionId: string, e: React.MouseEvent) {
    e.stopPropagation();
    await fetch(
      `http://localhost:8000/api/memory/conversation/${sessionId}`,
      { method: "DELETE" }
    );
    setSessions(sessions.filter((s) => s.session_id !== sessionId));
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  useEffect(() => {
    if (isOpen) loadSessions();
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-xl border border-cyan-300/25 bg-cyan-400/10 px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-cyan-200 transition hover:bg-cyan-400/20"
      >
        📋 HISTORIAL
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-14 z-50 w-96 rounded-2xl border border-cyan-300/20 bg-[#020b16] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-cyan-400/20 px-5 py-4">
              <span className="text-sm font-black uppercase tracking-widest text-cyan-300">
                Historial de Chats
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white"
              >✕</button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex gap-1">
                    <span className="animate-bounce text-cyan-400">●</span>
                    <span className="animate-bounce text-cyan-400 [animation-delay:0.2s]">●</span>
                    <span className="animate-bounce text-cyan-400 [animation-delay:0.4s]">●</span>
                  </div>
                </div>
              ) : sessions.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  No hay sesiones guardadas
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.session_id}
                    onClick={() => loadSession(session.session_id)}
                    className={`group flex cursor-pointer items-start justify-between border-b border-cyan-400/10 px-5 py-4 transition hover:bg-cyan-400/5 ${
                      session.session_id === currentSessionId
                        ? "bg-cyan-400/10"
                        : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {session.preview}
                      </p>
                      <div className="mt-1 flex items-center gap-3">
                        <span className="text-xs text-slate-400">
                          {formatDate(session.last_at)}
                        </span>
                        <span className="text-xs text-cyan-400">
                          {session.message_count} msgs
                        </span>
                        {session.session_id === currentSessionId && (
                          <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-xs font-bold text-cyan-300">
                            ACTUAL
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => deleteSession(session.session_id, e)}
                      className="ml-3 shrink-0 text-slate-500 opacity-0 transition hover:text-red-400 group-hover:opacity-100"
                    >
                      🗑
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}