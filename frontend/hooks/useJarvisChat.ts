import { useState } from "react";
import { useMemory } from "./useMemory";

interface Message {
  role: "user" | "assistant";
  content: string;
  agent?: string;
}

export function useJarvisChat(onAssistantReply?: (text: string) => void) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState("auto");
  const { saveMessage, clearHistory } = useMemory();

  async function sendMessage(text: string) {
    if (!text.trim()) return;

    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    await saveMessage("user", text);

    const assistantMessage: Message = { role: "assistant", content: "", agent: activeAgent };
    setMessages([...updatedMessages, assistantMessage]);

    try {
      const isAgentTask = activeAgent !== "chat";
      const endpoint = isAgentTask
        ? "http://localhost:8000/api/agents/run"
        : "http://localhost:8000/api/chat";

      const body = isAgentTask
        ? { message: text, history: messages.map(m => ({ role: m.role, content: m.content })), agent: activeAgent }
        : { message: text, history: messages.map(m => ({ role: m.role, content: m.content })) };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullContent += decoder.decode(value);
        setMessages([
          ...updatedMessages,
          { role: "assistant", content: fullContent, agent: activeAgent },
        ]);
      }

      await saveMessage("assistant", fullContent);
      if (onAssistantReply) onAssistantReply(fullContent);
    } catch (error) {
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: "Error de conexión con el núcleo IA." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleClear() {
    await clearHistory();
    setMessages([]);
  }

  return { messages, isLoading, sendMessage, handleClear, activeAgent, setActiveAgent };
}
