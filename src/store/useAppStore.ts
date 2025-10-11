import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemePreference = 'light' | 'dark' | 'system';
export type PersonaStyle = 'formal' | 'casual' | 'concise' | 'adaptive';

type AppState = {
  themePreference: ThemePreference;
  persona: PersonaStyle;
  voiceEnabled: boolean;
  isOnboarded: boolean;
};

type AppActions = {
  setThemePreference: (value: ThemePreference) => void;
  setPersona: (persona: PersonaStyle) => void;
  toggleVoice: (value?: boolean) => void;
  completeOnboarding: () => void;
};

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set) => ({
      themePreference: 'system',
      persona: 'adaptive',
      voiceEnabled: true, // Enable voice by default for demo
      isOnboarded: false,
      setThemePreference: (value) => set({ themePreference: value }),
      setPersona: (persona) => set({ persona }),
      toggleVoice: (value) =>
        set((state) => ({
          voiceEnabled: typeof value === 'boolean' ? value : !state.voiceEnabled,
        })),
      completeOnboarding: () => set({ isOnboarded: true }),
    }),
    {
      name: 'martin-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
