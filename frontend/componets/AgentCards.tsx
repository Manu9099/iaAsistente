"use client";

type AgentId =
  | "chat"
  | "research"
  | "coding"
  | "content"
  | "productivity"
  | "career";

const agents: {
  id: AgentId;
  title: string;
  tag: string;
  description: string;
  prompt: string;
}[] = [
  {
    id: "content",
    title: "Content Agent",
    tag: "LinkedIn",
    description: "Crea posts, guiones, copies y contenido profesional.",
    prompt:
      "Escribe un post profesional para LinkedIn sobre mi proyecto Jarvis AI, mencionando que integra Next.js, FastAPI, voz, agentes, documentos y visión artificial.",
  },
  {
    id: "coding",
    title: "Coding Agent",
    tag: "Code",
    description: "Ayuda a revisar errores, explicar código y proponer mejoras.",
    prompt:
      "Revisa mi arquitectura de Jarvis AI y dame 5 mejoras técnicas para hacerlo más escalable como proyecto full stack.",
  },
  {
    id: "research",
    title: "Research Agent",
    tag: "Research",
    description: "Resume información y estructura ideas complejas.",
    prompt:
      "Explícame cómo funciona un asistente IA modular con agentes especializados, memoria y análisis de documentos.",
  },
  {
    id: "career",
    title: "Career Agent",
    tag: "CV",
    description: "Ayuda con CV, entrevistas, LinkedIn y perfil profesional.",
    prompt:
      "Ayúdame a explicar Jarvis AI en una entrevista para una práctica de desarrollo de software o inteligencia artificial.",
  },
  {
    id: "productivity",
    title: "Productivity Agent",
    tag: "Tasks",
    description: "Organiza tareas, prioridades y planes de trabajo.",
    prompt:
      "Organiza un roadmap de 7 días para mejorar Jarvis AI y prepararlo para mostrarlo en LinkedIn.",
  },
];

function runAgentDemo(agentId: AgentId, prompt: string) {
  window.dispatchEvent(
    new CustomEvent("jarvis-run-agent-demo", {
      detail: {
        agentId,
        prompt,
      },
    })
  );
}

export default function AgentCards() {
  return (
    <section className="rounded-3xl border border-violet-300/20 bg-violet-400/[0.07] p-5 shadow-[0_0_30px_rgba(168,85,247,0.07)]">
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-violet-300">
          Agent Layer
        </p>
        <h3 className="mt-2 text-2xl font-black text-white">
          Agentes especializados
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Cada agente está pensado para una tarea concreta y puede ejecutarse
          desde el panel.
        </p>
      </div>

      <div className="space-y-3">
        {agents.map((agent) => (
          <article
            key={agent.id}
            className="rounded-2xl border border-white/10 bg-[#0b1020] p-4 transition hover:border-violet-300/40 hover:bg-[#111a33]"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h4 className="text-lg font-black text-white">
                  {agent.title}
                </h4>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">
                  {agent.description}
                </p>
              </div>

              <span className="rounded-full border border-violet-300/35 bg-violet-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-violet-200">
                {agent.tag}
              </span>
            </div>

            <button
              type="button"
              onClick={() => runAgentDemo(agent.id, agent.prompt)}
              className="w-full rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-4 py-3 text-sm font-black uppercase tracking-[0.25em] text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-400/20"
            >
              Probar agente
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}