"use client";

import { useState, useRef } from "react";

interface Props {
  sessionId: string;
}

export default function VisionPanel({ sessionId }: Props) {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState("");
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    const url = URL.createObjectURL(f);
    setImage(url);
    setAnalysis("");
    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", f);

    const q = question || "¿Qué ves en esta imagen? Describe detalladamente.";

    try {
      const res = await fetch(
        `http://localhost:8000/api/vision/analyze?question=${encodeURIComponent(q)}`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (err) {
      setAnalysis("Error al analizar la imagen.");
    } finally {
      setIsLoading(false);
    }
  }

  async function reanalyze() {
    if (!fileInputRef.current?.files?.[0]) return;
    setIsLoading(true);
    setAnalysis("");

    const formData = new FormData();
    formData.append("file", fileInputRef.current.files[0]);
    const q = question || "¿Qué ves en esta imagen?";

    try {
      const res = await fetch(
        `http://localhost:8000/api/vision/analyze?question=${encodeURIComponent(q)}`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (err) {
      setAnalysis("Error al analizar la imagen.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="doc-panel">
      <div className="doc-header">
        <span className="doc-title">AI VISION — ANÁLISIS DE IMÁGENES</span>
        {image && (
          <button className="clear-btn" onClick={() => { setImage(null); setAnalysis(""); }}>
            LIMPIAR
          </button>
        )}
      </div>

      {!image ? (
        <div className="doc-upload" onClick={() => fileInputRef.current?.click()}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImage}
            style={{ display: "none" }}
          />
          <span className="doc-upload-icon">🔍</span>
          <span className="doc-upload-text">SUBIR IMAGEN PARA ANALIZAR</span>
        </div>
      ) : (
        <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <img
            src={image}
            alt="análisis"
            style={{ maxHeight: "200px", objectFit: "contain", borderRadius: "4px", border: "0.5px solid #0d3a5a" }}
          />
          <div className="doc-input-area">
            <input
              className="chat-input"
              placeholder="pregunta sobre la imagen..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && reanalyze()}
            />
            <button className="send-btn" onClick={reanalyze} disabled={isLoading}>
              {isLoading ? "..." : "ASK"}
            </button>
          </div>
          {isLoading ? (
            <div className="typing-indicator" style={{ padding: "8px 0" }}>
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          ) : analysis ? (
            <div style={{ fontSize: "13px", color: "#a8deff", lineHeight: "1.6", padding: "10px 14px", background: "#040d18", border: "0.5px solid #0d3a5a", borderRadius: "4px" }}>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", letterSpacing: "2px", color: "#00b4ff88", marginBottom: "6px" }}>JARVIS — VISION</div>
              {analysis}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}