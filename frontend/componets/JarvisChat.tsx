"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useJarvisChat } from "@/hooks/useJarvisChat";
import { useVoice } from "@/hooks/useVoice";
import JarvisAvatar from "./JarvisAvatar";

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

export default function JarvisChat() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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
    speak(reply);
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

    void sendMessage(input);
    setInput("");
  }

  function handleMic() {
    if (isRecording) {
      stopRecording();
      return;
    }

    void startRecording();
  }

  return (
    <section className="flex h-full min-h-[calc(100vh-190px)] w-full flex-1 flex-col overflow-hidden rounded-4xl border border-cyan-400/25 bg-[#010812] text-white">
      <div className="flex items-center justify-between border-b border-cyan-400/20 bg-[#020b16] px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-400/10 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
            <div className="h-4 w-4 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.9)]" />
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.5em] text-cyan-300">
              JARVIS
            </p>
            <h2 className="mt-1 text-2xl font-black text-white">
              Asistente IA activo
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handleClear()}
          className="rounded-xl border border-red-400/40 bg-red-500/10 px-5 py-3 text-sm font-black uppercase tracking-[0.25em] text-red-200 transition hover:bg-red-500/20"
        >
          Limpiar
        </button>
      </div>

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

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 ? (
          <div className="flex min-h-full flex-col items-center justify-center gap-8 text-center">
            <JarvisAvatar
              isSpeaking={isSpeaking}
              isListening={isRecording}
              isThinking={isLoading}
            />

            <div className="max-w-3xl">
              <p className="text-base font-black uppercase tracking-[0.45em] text-cyan-300">
                Esperando comando
              </p>

              <h3 className="mt-4 text-4xl font-black tracking-tight text-white lg:text-5xl">
                Sistema en línea
              </h3>

              <p className="mt-4 text-xl leading-relaxed text-slate-300">
                Selecciona un agente o escribe una instrucción para iniciar la
                demo del asistente.
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
                className={`flex gap-4 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-400/10 text-sm font-black text-cyan-200">
                    JAR
                  </div>
                )}

                <div
                  className={`max-w-[78%] rounded-2xl border px-5 py-4 text-lg leading-relaxed ${
                    msg.role === "user"
                      ? "border-violet-300/30 bg-violet-500/15 text-violet-50"
                      : "border-cyan-300/30 bg-[#071827] text-cyan-50"
                  }`}
                >
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.35em] text-cyan-300/80">
                    {msg.role === "user"
                      ? "Usuario"
                      : `Jarvis — ${(msg.agent || "IA").toUpperCase()}`}
                  </p>

                  <p className="whitespace-pre-wrap">
                    {msg.content || "Procesando respuesta..."}
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

      <div className="border-t border-cyan-400/20 bg-[#020b16] p-5">
        <div className="flex items-center gap-3 rounded-2xl border border-cyan-300/25 bg-[#010812] p-3">
          <span className="px-2 text-2xl font-black text-cyan-300">
            &gt;_
          </span>

          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSend();
            }}
            autoComplete="off"
            placeholder="Escribe un comando para Jarvis..."
            className="min-w-0 flex-1 bg-transparent px-2 py-4 text-xl font-semibold text-white outline-none placeholder:text-slate-500"
          />

          <button
            type="button"
            onClick={handleMic}
            className={`rounded-xl border px-5 py-4 text-lg font-black transition ${
              isRecording
                ? "border-red-300 bg-red-500/20 text-red-100"
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