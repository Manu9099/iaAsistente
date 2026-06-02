"use client";

import AgentCards from "@/componets/AgentCards";
import DocumentChat from "@/componets/DocumentChat";
import ModulesDashboard from "@/componets/ModulesDashboard";
import VisionPanel from "@/componets/VisionPanel";

interface LeftSidebarProps {
  sessionId: string;
  onClose: () => void;
}

export default function LeftSidebar({ sessionId, onClose }: LeftSidebarProps) {
  return (
    <aside className="flex h-screen w-107.5 max-w-[90vw] flex-col border-r border-cyan-300/20 bg-[#07111f]/95 shadow-[20px_0_70px_rgba(34,211,238,0.14)] backdrop-blur-2xl">
      <div className="border-b border-white/10 p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-cyan-300">
              Control Center
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-white">
              Jarvis Panel
            </h2>

            <p className="mt-2 text-base leading-relaxed text-slate-300">
              Panel lateral para controlar módulos, agentes y funciones
              multimodales durante la demo.
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
          <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">
            Sesión activa
          </p>

          <p className="mt-2 truncate text-lg font-bold text-white">
            {sessionId}
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
        <ModulesDashboard />

        <AgentCards />

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