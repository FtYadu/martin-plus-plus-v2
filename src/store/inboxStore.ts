import { create } from 'zustand';
import type { Email } from '../types';

interface InboxState {
    emails: Email[];
    loading: boolean;
    error: string | null;
}

interface InboxActions {
    setEmails: (emails: Email[]) => void;
    addEmail: (email: Email) => void;
    updateEmail: (id: string, updates: Partial<Email>) => void;
    updateEmailStatus: (id: string, status: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
}

type InboxStore = InboxState & InboxActions;

export const useInboxStore = create<InboxStore>((set, get) => ({
    // Initial state
    emails: [],
    loading: false,
    error: null,

    // Actions
    setEmails: (emails) => set({ emails }),

    addEmail: (email) => set((state) => ({
        emails: [email, ...state.emails]
    })),

    updateEmail: (id, updates) => set((state) => ({
        emails: state.emails.map(email =>
            email.id === id ? { ...email, ...updates } : email
        )
    })),

    updateEmailStatus: (id, status) => set((state) => ({
        emails: state.emails.map(email =>
            email.id === id ? { ...email, status } : email
        )
    })),

    setLoading: (loading) => set({ loading }),

    setError: (error) => set({ error, loading: false }),

    clearError: () => set({ error: null }),
}));
