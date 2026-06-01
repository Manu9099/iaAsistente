"use client";

import DocumentChat from "@/componets/DocumentChat";
import VisionPanel from "@/componets/VisionPanel";

interface LeftSidebarProps {
  sessionId: string;
  onClose: () => void;
}

const modules = [
  {
    title: "Chat IA",
    description: "Conversación principal con agentes.",
    status: "Activo",
  },
  {
    title: "RAG",
    description: "Consulta documentos PDF.",
    status: "Listo",
  },
  {
    title: "Vision",
    description: "Análisis de imágenes con IA.",
    status: "Listo",
  },
  {
    title: "Memory",
    description: "Sesión persistente del usuario.",
    status: "Online",
  },
];

export default function LeftSidebar({ sessionId, onClose }: LeftSidebarProps) {
  return (
    <aside className="flex h-screen w-97.5 max-w-[88vw] flex-col border-r border-cyan-300/20 bg-[#07111f]/95 shadow-[20px_0_70px_rgba(34,211,238,0.14)] backdrop-blur-2xl">
      <div className="border-b border-white/10 p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-cyan-300">
              Control Center
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white">
              Jarvis Panel
            </h2>
            <p className="mt-2 text-base leading-relaxed text-slate-300">
              Panel lateral para mostrar módulos, estado del sistema y funciones
              IA durante la demo.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-red-300/30 bg-red-400/10 px-4 py-3 text-lg font-black text-red-100 transition hover:bg-red-400/20"
            aria-label="Ocultar barra lateral"
          >
            ×
          </button>
        </div>

        <div className="rounded-3xl border border-cyan-300/20 bg-cyan-400/10 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">
            Sesión activa
          </p>
          <p className="mt-2 truncate text-lg font-bold text-white">
            {sessionId}
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-black text-white">Módulos IA</h3>
            <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-sm font-bold text-emerald-300">
              4 activos
            </span>
          </div>

          <div className="space-y-3">
            {modules.map((module) => (
              <div
                key={module.title}
                className="rounded-2xl border border-white/10 bg-[#0d1b2f] p-4 transition hover:border-cyan-300/40 hover:bg-[#10243d]"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-black text-white">
                    {module.title}
                  </p>
                  <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-black uppercase tracking-widest text-cyan-200">
                    {module.status}
                  </span>
                </div>

                <p className="mt-2 text-base leading-relaxed text-slate-300">
                  {module.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-violet-300/20 bg-violet-400/10 p-5">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-violet-300">
            Roadmap
          </p>
          <h3 className="mt-2 text-2xl font-black text-white">
            Próximas mejoras
          </h3>

          <div className="mt-4 space-y-3 text-base text-slate-200">
            <div className="rounded-2xl bg-black/20 p-4">
              Automatización de tareas personales
            </div>
            <div className="rounded-2xl bg-black/20 p-4">
              Agentes especializados por contexto
            </div>
            <div className="rounded-2xl bg-black/20 p-4">
              Integración con productividad y documentos
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-cyan-300/20 bg-[#081827] p-4 text-base **:text-base [&_button]:text-base [&_input]:text-base">
          <DocumentChat sessionId={sessionId} />
        </section>

        <section className="rounded-3xl border border-fuchsia-300/20 bg-[#120b24] p-4 text-base **:text-base [&_button]:text-base [&_input]:text-base">
          <VisionPanel sessionId={sessionId} />
        </section>
      </div>
    </aside>
  );
}