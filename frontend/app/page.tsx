"use client";

import JarvisChat from "@/componets/JarvisChat";
import DocumentChat from "@/componets/DocumentChat";
import VisionPanel from "@/componets/VisionPanel";
import { useMemory } from "@/hooks/useMemory";

export default function Home() {
  const { sessionId } = useMemory();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <JarvisChat />
      <DocumentChat sessionId={sessionId} />
      <VisionPanel sessionId={sessionId} />
    </main>
  );
}
