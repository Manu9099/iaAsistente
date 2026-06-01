"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import JarvisChat from "@/componets/JarvisChat";
import LeftSidebar from "@/componets/LeftSidebar";
import { useMemory } from "@/hooks/useMemory";

export default function Home() {
  const { sessionId } = useMemory();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const safeSessionId = sessionId || "jarvis-local-session";

  return (
    <main className="min-h-screen overflow-hidden bg-[#030712] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.25),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.28),transparent_38%),linear-gradient(135deg,rgba(2,6,23,0.98),rgba(15,23,42,0.98))]" />

      <div className="relative flex min-h-screen w-full">
        <AnimatePresence initial={false}>
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: -420, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -420, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="z-30 shrink-0"
            >
              <LeftSidebar
                sessionId={safeSessionId}
                onClose={() => setIsSidebarOpen(false)}
              />
            </motion.aside>
          )}
        </AnimatePresence>

        <section className="relative z-10 flex min-w-0 flex-1 flex-col px-5 py-5 lg:px-7">
          <header className="mb-5 flex items-center justify-between rounded-4xl border border-cyan-300/15 bg-[#111827]/90 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-4">
              {!isSidebarOpen && (
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(true)}
                  className="rounded-2xl border border-cyan-300/40 bg-cyan-400/15 px-5 py-3 text-lg font-black text-cyan-100 shadow-lg shadow-cyan-500/10 transition hover:bg-cyan-400/25"
                >
                  ☰ Panel
                </button>
              )}

              <div>
                <p className="text-base font-black uppercase tracking-[0.45em] text-cyan-300">
                  IA PERSONAL FULL STACK
                </p>
                <h1 className="mt-2 text-4xl font-black tracking-tight text-white lg:text-6xl">
                  Jarvis AI Assistant
                </h1>
              </div>
            </div>
          </header>

          <div className="flex min-h-0 flex-1 rounded-4xl border border-cyan-300/15 bg-[#020817]/95 p-0 shadow-[0_0_70px_rgba(34,211,238,0.13)] backdrop-blur-xl">
            <JarvisChat />
          </div>
        </section>
      </div>
    </main>
  );
}