import { create } from 'zustand';
import type { CalendarEvent } from '@/types';

type CalendarState = {
  events: CalendarEvent[];
  selectedDate: Date;
  isLoading: boolean;
  error: string | null;
};

type CalendarActions = {
  setEvents: (events: CalendarEvent[]) => void;
  setSelectedDate: (date: Date) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  removeEvent: (id: string) => void;
};

export const useCalendarStore = create<CalendarState & CalendarActions>((set) => ({
  events: [],
  selectedDate: new Date(),
  isLoading: false,
  error: null,
  
  setEvents: (events) => set({ events, isLoading: false, error: null }),
  
  setSelectedDate: (date) => set({ selectedDate: date }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error, isLoading: false }),
  
  addEvent: (event) => set((state) => ({ 
    events: [...state.events, event] 
  })),
  
  updateEvent: (id, updates) => set((state) => ({
    events: state.events.map((event) =>
      event.id === id ? { ...event, ...updates } : event
    ),
  })),
  
  removeEvent: (id) => set((state) => ({
    events: state.events.filter((event) => event.id !== id),
  })),
}));