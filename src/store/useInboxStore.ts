import { create } from 'zustand';
import type { Email, InboxCategory } from '@/types';

type InboxState = {
  emails: Email[];
  filter: InboxCategory | 'all';
  isLoading: boolean;
  error: string | null;
};

type InboxActions = {
  setEmails: (emails: Email[]) => void;
  setFilter: (filter: InboxCategory | 'all') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addEmail: (email: Email) => void;
  updateEmail: (id: string, updates: Partial<Email>) => void;
  removeEmail: (id: string) => void;
};

export const useInboxStore = create<InboxState & InboxActions>((set) => ({
  emails: [],
  filter: 'all',
  isLoading: false,
  error: null,
  
  setEmails: (emails) => set({ emails, isLoading: false, error: null }),
  
  setFilter: (filter) => set({ filter }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error, isLoading: false }),
  
  addEmail: (email) => set((state) => ({ 
    emails: [email, ...state.emails] 
  })),
  
  updateEmail: (id, updates) => set((state) => ({
    emails: state.emails.map((email) =>
      email.id === id ? { ...email, ...updates } : email
    ),
  })),
  
  removeEmail: (id) => set((state) => ({
    emails: state.emails.filter((email) => email.id !== id),
  })),
}));