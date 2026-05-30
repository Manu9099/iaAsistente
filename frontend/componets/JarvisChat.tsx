"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useJarvisChat } from "@/hooks/useJarvisChat";
import { useVoice } from "@/hooks/useVoice";
import JarvisAvatar from "./JarvisAvatar";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, sendMessage, handleClear, activeAgent, setActiveAgent } =
    useJarvisChat((reply) => speak(reply));

  const { isRecording, isSpeaking, startRecording, stopRecording, speak } =
    useVoice((transcript) => sendMessage(transcript));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  }

  function handleMic() {
    if (isRecording) stopRecording();
    else startRecording();
  }

  return (
    <div className="jarvis-root">
      <div className="scan-line" />
      <div className="corner corner-tl" />
      <div className="corner corner-tr" />
      <div className="corner corner-bl" />
      <div className="corner corner-br" />

      <div className="header">
        <div className="header-left">
          <div className="pulse-ring">
            <div className="pulse-dot" />
          </div>
          <span className="header-title">JARVIS</span>
        </div>
        <div className="status-bar">
          <span className="status-item active">
            {isRecording ? "ESCUCHANDO" : isSpeaking ? "HABLANDO" : isLoading ? "PROCESANDO" : "ONLINE"}
          </span>
          <div className="divider" />
          <span className="status-item">AI CORE v1.0</span>
          <div className="divider" />
          <span className="status-item">{messages.length} MSGS</span>
          <div className="divider" />
          <button className="clear-btn" onClick={handleClear}>LIMPIAR</button>
        </div>
      </div>

      <JarvisAvatar
        isSpeaking={isSpeaking}
        isListening={isRecording}
        isThinking={isLoading}
      />

      <div className="agent-selector">
        {AGENTS.map((agent) => (
          <button
            key={agent.id}
            className={`agent-btn ${activeAgent === agent.id ? "active" : ""}`}
            onClick={() => setActiveAgent(agent.id)}
          >
            {agent.label}
          </button>
        ))}
      </div>

      <div className="messages">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="msg jarvis-msg"
        >
          <div className="msg-avatar jarvis">JAR</div>
          <div>
            <div className="msg-label">JARVIS — SISTEMA</div>
            <div className="msg-bubble">
              Sistemas en línea. Selecciona un agente o usa AUTO para detección automática.
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`msg ${msg.role === "user" ? "user" : "jarvis-msg"}`}
            >
              <div className={`msg-avatar ${msg.role === "user" ? "user-av" : "jarvis"}`}>
                {msg.role === "user" ? "USR" : "JAR"}
              </div>
              <div>
                <div className="msg-label">
                  {msg.role === "user" ? "USUARIO" : `JARVIS — ${(msg.agent || "IA").toUpperCase()}`}
                </div>
                <div className="msg-bubble">
                  {msg.content || (
                    <div className="typing-indicator">
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {messages.length === 0 && (
        <div className="quick-chips">
          {CHIPS.map((chip) => (
            <button key={chip} className="chip" onClick={() => sendMessage(chip)}>
              {chip.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      <div className="input-area">
        <span className="input-prefix">&gt;_</span>
        <input
          className="chat-input"
          type="text"
          placeholder="ingresa comando..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          autoComplete="off"
        />
        <button
          className={`mic-btn ${isRecording ? "recording" : ""}`}
          onClick={handleMic}
          title={isRecording ? "Detener grabación" : "Hablar con Jarvis"}
        >
          {isRecording ? "⏹" : "🎤"}
        </button>
        <button className="send-btn" onClick={handleSend} disabled={isLoading || isRecording}>
          ENVIAR
        </button>
      </div>
    </div>
  );
}
