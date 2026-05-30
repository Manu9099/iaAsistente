"use client";

import { useState, useRef } from "react";

interface Props {
  sessionId: string;
}

export default function DocumentChat({ sessionId }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploaded, setUploaded] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filename, setFilename] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", f);

    try {
      const res = await fetch(
        `http://localhost:8000/api/documents/upload/${sessionId}`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      setUploaded(true);
      setFilename(data.filename);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleQuery() {
    if (!question.trim()) return;
    setIsLoading(true);

    try {
      const res = await fetch(
        `http://localhost:8000/api/documents/query/${sessionId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, history }),
        }
      );
      const data = await res.json();
      setAnswer(data.answer);
      setHistory([
        ...history,
        { role: "user", content: question },
        { role: "assistant", content: data.answer },
      ]);
      setQuestion("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleClear() {
    await fetch(
      `http://localhost:8000/api/documents/document/${sessionId}`,
      { method: "DELETE" }
    );
    setUploaded(false);
    setFile(null);
    setAnswer("");
    setHistory([]);
    setFilename("");
  }

  return (
    <div className="doc-panel">
      <div className="doc-header">
        <span className="doc-title">RAG — DOCUMENTOS</span>
        {uploaded && (
          <button className="clear-btn" onClick={handleClear}>
            LIMPIAR
          </button>
        )}
      </div>

      {!uploaded ? (
        <div className="doc-upload" onClick={() => fileInputRef.current?.click()}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleUpload}
            style={{ display: "none" }}
          />
          {isLoading ? (
            <div className="typing-indicator">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          ) : (
            <>
              <span className="doc-upload-icon">📄</span>
              <span className="doc-upload-text">SUBIR PDF</span>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="doc-filename">📄 {filename}</div>
          <div className="doc-answers">
            {history.map((m, i) => (
              <div key={i} className={`doc-msg ${m.role}`}>
                <span className="doc-msg-label">
                  {m.role === "user" ? "USR" : "JAR"}
                </span>
                <span className="doc-msg-content">{m.content}</span>
              </div>
            ))}
          </div>
          <div className="doc-input-area">
            <input
              className="chat-input"
              placeholder="pregunta sobre el documento..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQuery()}
            />
            <button
              className="send-btn"
              onClick={handleQuery}
              disabled={isLoading}
            >
              {isLoading ? "..." : "ASK"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
