import { create } from 'zustand';
import type { ChatMessage } from '@/types';

type ChatState = {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
};

type ChatActions = {
  setMessages: (messages: ChatMessage[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
};

export const useChatStore = create<ChatState & ChatActions>((set) => ({
  messages: [],
  isLoading: false,
  error: null,
  
  setMessages: (messages) => set({ messages, isLoading: false, error: null }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error, isLoading: false }),
  
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  
  clearMessages: () => set({ messages: [] }),
}));