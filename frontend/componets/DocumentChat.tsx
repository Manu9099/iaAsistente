"use client";

import { useRef, useState } from "react";

interface Props {
  sessionId: string;
}

type HistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

type UploadStatus = "idle" | "dragging" | "uploading" | "ready" | "error";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_JARVIS_API_URL || "http://localhost:8000";

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentChat({ sessionId }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploaded, setUploaded] = useState(false);
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<HistoryMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filename, setFilename] = useState("");
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function uploadFile(selectedFile: File) {
    setErrorMessage("");

    if (!selectedFile) return;

    const isSupported =
      selectedFile.type === "application/pdf" ||
      selectedFile.name.toLowerCase().endsWith(".pdf") ||
      selectedFile.name.toLowerCase().endsWith(".txt") ||
      selectedFile.name.toLowerCase().endsWith(".docx");

    if (!isSupported) {
      setStatus("error");
      setErrorMessage("Formato no soportado. Usa PDF, TXT o DOCX.");
      return;
    }

    setFile(selectedFile);
    setIsLoading(true);
    setStatus("uploading");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/documents/upload/${sessionId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      setUploaded(true);
      setFilename(data.filename || selectedFile.name);
      setStatus("ready");
    } catch (error) {
      console.error("Document upload error:", error);
      setUploaded(false);
      setStatus("error");
      setErrorMessage(
        "No se pudo subir el documento. Verifica que el backend esté activo."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    await uploadFile(selectedFile);
  }

  async function handleQuery(customQuestion?: string) {
    const finalQuestion = (customQuestion || question).trim();

    if (!finalQuestion || isLoading || !uploaded) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/documents/query/${sessionId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: finalQuestion,
            history,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const answer = data.answer || "No encontré una respuesta clara.";

      setHistory((currentHistory) => [
        ...currentHistory,
        {
          role: "user",
          content: finalQuestion,
        },
        {
          role: "assistant",
          content: answer,
        },
      ]);

      setQuestion("");
    } catch (error) {
      console.error("Document query error:", error);
      setErrorMessage(
        "No pude consultar el documento. Verifica la conexión con el backend."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleClear() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      await fetch(`${API_BASE_URL}/api/documents/document/${sessionId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Document clear error:", error);
    } finally {
      setUploaded(false);
      setFile(null);
      setHistory([]);
      setFilename("");
      setQuestion("");
      setStatus("idle");
      setIsLoading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    setStatus("idle");

    const selectedFile = event.dataTransfer.files?.[0];

    if (selectedFile) {
      void uploadFile(selectedFile);
    }
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!uploaded && !isLoading) {
      setStatus("dragging");
    }
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!uploaded && !isLoading) {
      setStatus("idle");
    }
  }

  const statusLabel = {
    idle: "Esperando documento",
    dragging: "Suelta el archivo aquí",
    uploading: "Analizando documento",
    ready: "Documento listo",
    error: "Requiere atención",
  }[status];

  return (
    <section className="rounded-3xl border border-cyan-300/20 bg-[#06111f] p-5 shadow-[0_0_35px_rgba(34,211,238,0.07)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
            Document Intelligence
          </p>

          <h3 className="mt-2 text-2xl font-black text-white">
            Análisis de documentos
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Sube un documento y haz preguntas sobre su contenido usando Jarvis.
          </p>
        </div>

        {uploaded && (
          <button
            type="button"
            onClick={() => void handleClear()}
            className="rounded-xl border border-red-300/35 bg-red-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.25em] text-red-200 transition hover:bg-red-500/20"
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="mb-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">
              Estado
            </p>
            <p className="mt-1 text-lg font-black text-white">{statusLabel}</p>
          </div>

          <span
            className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${
              status === "ready"
                ? "border-emerald-300/40 bg-emerald-400/10 text-emerald-200"
                : status === "uploading"
                  ? "border-amber-300/40 bg-amber-400/10 text-amber-200"
                  : status === "error"
                    ? "border-red-300/40 bg-red-400/10 text-red-200"
                    : "border-cyan-300/40 bg-cyan-400/10 text-cyan-200"
            }`}
          >
            {status === "ready"
              ? "Ready"
              : status === "uploading"
                ? "Loading"
                : status === "error"
                  ? "Error"
                  : "RAG"}
          </span>
        </div>
      </div>

      {!uploaded ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`group cursor-pointer rounded-3xl border border-dashed p-6 text-center transition ${
            status === "dragging"
              ? "border-cyan-300 bg-cyan-400/15"
              : "border-cyan-300/30 bg-cyan-400/5 hover:border-cyan-300/60 hover:bg-cyan-400/10"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.docx"
            className="hidden"
            onChange={handleUpload}
          />

          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-300/30 bg-cyan-400/10 text-4xl shadow-[0_0_30px_rgba(34,211,238,0.12)]">
            {isLoading ? "⏳" : "📄"}
          </div>

          <h4 className="text-2xl font-black text-white">
            {isLoading ? "Procesando archivo..." : "Sube un documento"}
          </h4>

          <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-slate-400">
            Arrastra tu archivo aquí o haz clic para seleccionarlo desde tu
            equipo.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {["PDF", "TXT", "DOCX"].map((format) => (
              <span
                key={format}
                className="rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3 py-1 text-xs font-black tracking-[0.2em] text-cyan-200"
              >
                {format}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <article className="rounded-3xl border border-emerald-300/25 bg-emerald-400/10 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">
                  Documento cargado
                </p>

                <h4 className="mt-2 truncate text-xl font-black text-white">
                  {filename}
                </h4>

                {file && (
                  <p className="mt-1 text-sm font-semibold text-slate-300">
                    {formatFileSize(file.size)}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-center">
                <p className="text-xl font-black text-white">✓</p>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-300">
                  Indexed
                </p>
              </div>
            </div>
          </article>

          <div className="grid grid-cols-1 gap-3">
            <button
              type="button"
              onClick={() =>
                void handleQuery(
                  "Resume este documento en puntos clave y menciona las ideas más importantes."
                )
              }
              disabled={isLoading}
              className="rounded-2xl border border-cyan-300/25 bg-cyan-400/10 px-4 py-3 text-left text-sm font-bold text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Resumir puntos clave
            </button>

            <button
              type="button"
              onClick={() =>
                void handleQuery(
                  "Identifica posibles conclusiones, recomendaciones o acciones importantes del documento."
                )
              }
              disabled={isLoading}
              className="rounded-2xl border border-violet-300/25 bg-violet-400/10 px-4 py-3 text-left text-sm font-bold text-violet-100 transition hover:border-violet-300/60 hover:bg-violet-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Detectar conclusiones
            </button>
          </div>

          <div className="max-h-72 space-y-3 overflow-y-auto rounded-3xl border border-white/10 bg-black/20 p-4">
            {history.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-lg font-black text-white">
                  Listo para preguntar
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Haz una pregunta sobre el documento o usa una acción rápida.
                </p>
              </div>
            ) : (
              history.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`rounded-2xl border px-4 py-3 ${
                    message.role === "user"
                      ? "border-violet-300/25 bg-violet-400/10"
                      : "border-cyan-300/25 bg-cyan-400/10"
                  }`}
                >
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300">
                    {message.role === "user" ? "Usuario" : "Jarvis"}
                  </p>

                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                    {message.content}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-cyan-300/25 bg-black/25 p-2">
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void handleQuery();
                }
              }}
              placeholder="Pregunta algo sobre el documento..."
              className="min-w-0 flex-1 bg-transparent px-3 py-3 text-base font-semibold text-white outline-none placeholder:text-slate-500"
            />

            <button
              type="button"
              onClick={() => void handleQuery()}
              disabled={!question.trim() || isLoading}
              className="rounded-xl border border-cyan-300/35 bg-cyan-400/15 px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-cyan-100 transition hover:bg-cyan-400/25 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isLoading ? "..." : "Ask"}
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 rounded-2xl border border-red-300/30 bg-red-500/10 p-4 text-sm font-semibold leading-relaxed text-red-100">
          {errorMessage}
        </div>
      )}
    </section>
  );
}