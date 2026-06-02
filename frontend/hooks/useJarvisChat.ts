import { useState } from "react";
import { useMemory } from "./useMemory";

interface Message {
  role: "user" | "assistant";
  content: string;
  agent?: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_JARVIS_API_URL || "http://localhost:8000";

export function useJarvisChat(onAssistantReply?: (text: string) => void) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState("chat");

  const { saveMessage, clearHistory } = useMemory();

  async function sendMessage(text: string, forcedAgent?: string) {
    const cleanText = text.trim();

    if (!cleanText || isLoading) return;

    const selectedAgent = forcedAgent || activeAgent;

    if (forcedAgent) {
      setActiveAgent(forcedAgent);
    }

    const userMessage: Message = {
      role: "user",
      content: cleanText,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setIsLoading(true);

    await saveMessage("user", cleanText);

    try {
      const isAgentTask = selectedAgent !== "chat";

      const endpoint =
        selectedAgent === "career"
          ? `${API_BASE_URL}/api/career/chat`
          : isAgentTask
            ? `${API_BASE_URL}/api/agents/run`
            : `${API_BASE_URL}/api/chat`;

      const history = messages.map((message) => ({
        role: message.role,
        content: message.content,
      }));

      const body =
        selectedAgent === "career"
          ? {
              message: cleanText,
              history,
            }
          : isAgentTask
            ? {
                message: cleanText,
                history,
                agent: selectedAgent,
              }
            : {
                message: cleanText,
                history,
              };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let fullContent = "";

      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: "",
          agent: selectedAgent,
        },
      ]);

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        fullContent += decoder.decode(value);

        setMessages([
          ...updatedMessages,
          {
            role: "assistant",
            content: fullContent,
            agent: selectedAgent,
          },
        ]);
      }

      await saveMessage("assistant", fullContent);

      if (onAssistantReply && fullContent.trim()) {
        onAssistantReply(fullContent);
      }
    } catch (error) {
      console.error("Jarvis connection error:", error);

      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content:
            "No pude conectar con el núcleo IA. Verifica que el backend esté activo en http://localhost:8000 y que la ruta correspondiente exista.",
          agent: selectedAgent,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleClear() {
    await clearHistory();
    setMessages([]);
  }

  return {
    messages,
    isLoading,
    sendMessage,
    handleClear,
    activeAgent,
    setActiveAgent,
  };
}