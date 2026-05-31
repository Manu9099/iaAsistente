"use client";

import JarvisChat from "@/componets/JarvisChat";
import DocumentChat from "@/componets/DocumentChat";
import VisionPanel from "@/componets/VisionPanel";
import { useMemory } from "@/hooks/useMemory";

export default function Home() {
  const { sessionId } = useMemory();

  return (
    <main style={{
      minHeight: "100vh",
      background: "#03080f",
      display: "flex",
      alignItems: "stretch",
      gap: "12px",
      padding: "16px",
    }}>
      {/* Chat principal */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <JarvisChat />
      </div>

      {/* Barra lateral derecha */}
      <div style={{
        width: "360px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        overflowY: "auto",
        maxHeight: "100vh",
        paddingBottom: "16px",
      }}>
        <DocumentChat sessionId={sessionId} />
        <VisionPanel sessionId={sessionId} />
      </div>
    </main>
  );
}