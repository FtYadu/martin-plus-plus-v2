import { useState } from "react";
import { makeApiCall } from "../helpers/api";

export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export type UIState = {
  query: string;
  messages: Message[];
  isLoading: boolean;
  isVoiceListening: boolean;
};

export const useUIState = () => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const handleApiCall = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Add user message
    const userMessage: Message = { role: 'user', content: searchQuery };
    setMessages(prev => [...prev, userMessage]);
    setQuery("");

    // Create assistant message placeholder
    const assistantMessage: Message = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, assistantMessage]);

    await makeApiCall({
      searchQuery,
      setMessages,
      setIsLoading,
      abortController,
      setAbortController,
    });
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    state: {
      query,
      messages,
      isLoading,
      isVoiceListening,
    },
    actions: {
      setQuery,
      setMessages,
      setIsVoiceListening,
      makeApiCall: handleApiCall,
      clearMessages,
    },
  };
};

