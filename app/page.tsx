"use client";

import JarvisChat from "@/components/JarvisChat";
import DocumentChat from "@/components/DocumentChat";
import VisionPanel from "@/components/VisionPanel";
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