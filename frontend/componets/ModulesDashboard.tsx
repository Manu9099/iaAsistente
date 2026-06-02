"use client";

type ModuleStatus = "Activo" | "Disponible" | "Beta" | "Local";

const modules: {
  name: string;
  description: string;
  status: ModuleStatus;
  metric: string;
}[] = [
  {
    name: "Chat IA",
    description: "Conversación principal con el asistente.",
    status: "Activo",
    metric: "Core",
  },
  {
    name: "Voz",
    description: "Entrada por micrófono y respuesta hablada.",
    status: "Activo",
    metric: "Speech",
  },
  {
    name: "Memoria",
    description: "Persistencia por sesión del usuario.",
    status: "Local",
    metric: "Session",
  },
  {
    name: "Documentos",
    description: "Consulta sobre archivos PDF usando RAG.",
    status: "Disponible",
    metric: "RAG",
  },
  {
    name: "Visión",
    description: "Análisis de imágenes con IA.",
    status: "Beta",
    metric: "Vision",
  },
  {
    name: "Agentes",
    description: "Especialistas para tareas concretas.",
    status: "Disponible",
    metric: "Multi-agent",
  },
];

const statusStyles: Record<ModuleStatus, string> = {
  Activo: "border-emerald-300/40 bg-emerald-400/10 text-emerald-200",
  Disponible: "border-cyan-300/40 bg-cyan-400/10 text-cyan-200",
  Beta: "border-violet-300/40 bg-violet-400/10 text-violet-200",
  Local: "border-amber-300/40 bg-amber-400/10 text-amber-200",
};

export default function ModulesDashboard() {
  const activeModules = modules.filter(
    (module) => module.status === "Activo" || module.status === "Disponible"
  ).length;

  return (
    <section className="rounded-3xl border border-cyan-300/20 bg-white/4.5 p-5 shadow-[0_0_30px_rgba(34,211,238,0.06)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
            System Dashboard
          </p>
          <h3 className="mt-2 text-2xl font-black text-white">
            Módulos Jarvis
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Vista rápida de capacidades activas para mostrar el alcance del
            asistente.
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-300/25 bg-cyan-400/10 px-4 py-3 text-center">
          <p className="text-2xl font-black text-white">{activeModules}</p>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300">
            Ready
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {modules.map((module) => (
          <article
            key={module.name}
            className="group rounded-2xl border border-white/10 bg-[#07111f] p-4 transition hover:border-cyan-300/35 hover:bg-[#0b1c31]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-lg font-black text-white">
                  {module.name}
                </h4>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">
                  {module.description}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${
                  statusStyles[module.status]
                }`}
              >
                {module.status}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                Capability
              </span>
              <span className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
                {module.metric}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}