"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useJarvisChat } from "@/hooks/useJarvisChat";
import { useVoice } from "@/hooks/useVoice";
import JarvisAvatar from "./JarvisAvatar";
import ChatHistory from "./ChatHistory";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  agent?: string;
};

const CHIPS = [
  "¿Qué puedes hacer?",
  "Escribe un post para LinkedIn sobre IA",
  "Explícame Clean Architecture en .NET",
  "Organiza mis tareas de hoy",
];

const AGENTS = [
  { id: "chat", label: "CHAT" },
  { id: "auto", label: "AUTO" },
  { id: "research", label: "RESEARCH" },
  { id: "coding", label: "CODING" },
  { id: "content", label: "CONTENT" },
  { id: "productivity", label: "PRODUCTIVITY" },
  { id: "career", label: "CAREER" },
];

const DEMO_COMMANDS = [
  "manda un correo a manucht51@gmail.com con asunto 'Demo Jarvis' y dile que Jarvis AI está en línea",
  "crea un Excel llamado 'Demo Jarvis' con columnas Módulo, Estado y agrega 5 filas con las funciones de Jarvis",
  "pon música de Bruno Mars en Spotify",
  "evalúa esta oferta: Senior Developer en Globant, Lima, stack .NET y React, salario $4000, remoto",
];

export default function JarvisChat() {
  const [input, setInput] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [error, setError] = useState("");
  const [demoIndex, setDemoIndex] = useState(0);
  const [sessionId, setSessionId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const storedSessionId = localStorage.getItem("jarvis_session_id");
    if (storedSessionId) setSessionId(storedSessionId);
  }, []);

  const { isRecording, isSpeaking, startRecording, stopRecording, speak } =
    useVoice((transcript: string) => {
      void sendMessage(transcript);
    }) as {
      isRecording: boolean;
      isSpeaking: boolean;
      startRecording: () => void | Promise<void>;
      stopRecording: () => void;
      speak: (text: string) => void;
    };

  const {
    messages,
    isLoading,
    sendMessage,
    handleClear,
    activeAgent,
    setActiveAgent,
  } = useJarvisChat((reply: string) => {
    if (voiceEnabled) speak(reply);
  }) as {
    messages: ChatMessage[];
    isLoading: boolean;
    sendMessage: (text: string) => void | Promise<void>;
    handleClear: () => void | Promise<void>;
    activeAgent: string;
    setActiveAgent: (agent: string) => void;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    if (!input.trim()) return;
    setError("");
    void sendMessage(input);
    setInput("");
  }

  async function handleMic() {
    try {
      setError("");
      if (isRecording) stopRecording();
      else await startRecording();
    } catch {
      setError("No se pudo acceder al micrófono. Verifica los permisos del navegador.");
    }
  }

  function handleDemoNext() {
    const cmd = DEMO_COMMANDS[demoIndex % DEMO_COMMANDS.length];
    setInput(cmd);
    setDemoIndex(demoIndex + 1);
  }

  const statusLabel = isRecording
    ? "ESCUCHANDO"
    : isSpeaking
    ? "HABLANDO"
    : isLoading
    ? "PROCESANDO"
    : "ONLINE";

  const statusColor = isRecording
    ? "text-green-300"
    : isSpeaking
    ? "text-yellow-300"
    : isLoading
    ? "text-blue-300"
    : "text-cyan-300";

  const statusDot = isRecording
    ? "bg-green-300 shadow-[0_0_18px_rgba(74,222,128,0.9)]"
    : isSpeaking
    ? "bg-yellow-300 shadow-[0_0_18px_rgba(253,224,71,0.9)]"
    : isLoading
    ? "bg-blue-300 shadow-[0_0_18px_rgba(147,197,253,0.9)] animate-pulse"
    : "bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.9)]";

    function handleLoadSession(sessionId: string, msgs: any[]) {
    const formatted = msgs.map((m: any) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
      agent: "chat",
    }));
    // reload page with session - simplest approach
    localStorage.setItem("jarvis_session_id", sessionId);
    window.location.reload();
  }

  return (
    <section className="flex h-full min-h-[calc(100vh-190px)] w-full flex-1 flex-col overflow-hidden rounded-4xl border border-cyan-400/25 bg-[#010812] text-white">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-400/20 bg-[#020b16] px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-400/10 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
            <div className={`h-4 w-4 rounded-full ${statusDot}`} />
          </div>
          <div>
            <p className={`text-sm font-black uppercase tracking-[0.5em] ${statusColor}`}>
              JARVIS — {statusLabel}
            </p>
            <h2 className="mt-1 text-2xl font-black text-white">
              Asistente IA activo
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Voice toggle */}
          <button
            type="button"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            title={voiceEnabled ? "Desactivar voz" : "Activar voz"}
            className={`rounded-xl border px-4 py-3 text-sm font-black uppercase tracking-[0.2em] transition ${
              voiceEnabled
                ? "border-cyan-300/40 bg-cyan-400/15 text-cyan-100"
                : "border-slate-500/40 bg-slate-500/10 text-slate-400"
            }`}
          >
            {voiceEnabled ? "🔊 VOZ ON" : "🔇 VOZ OFF"}
          </button>
                  <ChatHistory
            currentSessionId={sessionId || ""}
            onLoadSession={handleLoadSession}
          />
          {/* Demo mode */}
          <button
            type="button"
            onClick={() => setDemoMode(!demoMode)}
            className={`rounded-xl border px-4 py-3 text-sm font-black uppercase tracking-[0.2em] transition ${
              demoMode
                ? "border-violet-300/60 bg-violet-500/20 text-violet-100"
                : "border-violet-300/25 bg-violet-400/10 text-violet-300 hover:bg-violet-400/20"
            }`}
          >
            {demoMode ? "⚡ DEMO ON" : "⚡ DEMO"}
          </button>

          <button
            type="button"
            onClick={() => void handleClear()}
            className="rounded-xl border border-red-400/40 bg-red-500/10 px-5 py-3 text-sm font-black uppercase tracking-[0.25em] text-red-200 transition hover:bg-red-500/20"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between border-b border-red-400/30 bg-red-500/10 px-6 py-3 text-sm font-bold text-red-300"
          >
            <span>⚠ {error}</span>
            <button
              onClick={() => setError("")}
              className="ml-4 text-red-400 hover:text-red-200"
            >✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Demo mode banner */}
      <AnimatePresence>
        {demoMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between border-b border-violet-400/30 bg-violet-500/10 px-6 py-3"
          >
            <span className="text-sm font-bold text-violet-200">
              ⚡ MODO DEMO — Comandos de demostración precargados
            </span>
            <button
              type="button"
              onClick={handleDemoNext}
              className="rounded-lg border border-violet-300/40 bg-violet-400/20 px-4 py-2 text-sm font-black uppercase tracking-wider text-violet-100 transition hover:bg-violet-400/30"
            >
              SIGUIENTE DEMO →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agent selector */}
      <div className="flex flex-wrap gap-3 border-b border-cyan-400/20 bg-[#020b16]/80 px-6 py-4">
        {AGENTS.map((agent) => (
          <button
            key={agent.id}
            type="button"
            onClick={() => setActiveAgent(agent.id)}
            className={`rounded-xl border px-5 py-3 text-sm font-black uppercase tracking-[0.25em] transition ${
              activeAgent === agent.id
                ? "border-cyan-300 bg-cyan-400/20 text-cyan-100 shadow-[0_0_25px_rgba(34,211,238,0.16)]"
                : "border-cyan-400/20 bg-[#07111f] text-cyan-300/80 hover:border-cyan-300/50 hover:bg-cyan-400/10"
            }`}
          >
            {agent.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 ? (
          <div className="flex min-h-full flex-col items-center justify-center gap-8 text-center">
            <JarvisAvatar isSpeaking={isSpeaking} isListening={isRecording} isThinking={isLoading} />
            <div className="max-w-3xl">
              <p className={`text-base font-black uppercase tracking-[0.45em] ${statusColor}`}>
                {statusLabel}
              </p>
              <h3 className="mt-4 text-4xl font-black tracking-tight text-white lg:text-5xl">
                Sistema en línea
              </h3>
              <p className="mt-4 text-xl leading-relaxed text-slate-300">
                Selecciona un agente o escribe una instrucción para iniciar.
              </p>
            </div>
            <div className="flex max-w-5xl flex-wrap justify-center gap-3">
              {CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => void sendMessage(chip)}
                  className="rounded-2xl border border-cyan-300/25 bg-cyan-400/10 px-5 py-3 text-base font-bold text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-400/20"
                >
                  {chip}
                </button>
                
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((msg, index) => (
              <motion.div
                key={`${msg.role}-${index}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-400/10 text-sm font-black text-cyan-200">
                    JAR
                  </div>
                )}
                <div className={`max-w-[78%] rounded-2xl border px-5 py-4 text-lg leading-relaxed ${
                  msg.role === "user"
                    ? "border-violet-300/30 bg-violet-500/15 text-violet-50"
                    : "border-cyan-300/30 bg-[#071827] text-cyan-50"
                }`}>
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.35em] text-cyan-300/80">
                    {msg.role === "user" ? "Usuario" : `Jarvis — ${(msg.agent || "IA").toUpperCase()}`}
                  </p>
                  <p className="whitespace-pre-wrap">
                    {msg.content || (
                      <span className="flex gap-1 items-center text-cyan-400">
                        <span className="animate-bounce">●</span>
                        <span className="animate-bounce [animation-delay:0.2s]">●</span>
                        <span className="animate-bounce [animation-delay:0.4s]">●</span>
                      </span>
                    )}
                  </p>
                </div>
                {msg.role === "user" && (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-300/30 bg-violet-400/10 text-sm font-black text-violet-200">
                    USR
                  </div>
                )}
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
        
      {/* Input */}
      <div className="border-t border-cyan-400/20 bg-[#020b16] p-5">
        <div className="flex items-center gap-3 rounded-2xl border border-cyan-300/25 bg-[#010812] p-3">
          <span className="px-2 text-2xl font-black text-cyan-300">&gt;_</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
            autoComplete="off"
            placeholder="Escribe un comando para Jarvis..."
            className="min-w-0 flex-1 bg-transparent px-2 py-4 text-xl font-semibold text-white outline-none placeholder:text-slate-500"
          />
          <button
            type="button"
            onClick={handleMic}
            className={`rounded-xl border px-5 py-4 text-lg font-black transition ${
              isRecording
                ? "border-red-300 bg-red-500/20 text-red-100 animate-pulse"
                : "border-cyan-300/30 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/20"
            }`}
          >
            {isRecording ? "⏹" : "🎙"}
            
          </button>
          
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="rounded-xl border border-cyan-300/40 bg-cyan-400/20 px-6 py-4 text-lg font-black uppercase tracking-[0.2em] text-cyan-50 transition hover:bg-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Enviar
          </button>
          
        </div>
      </div>
    </section>
  );
}