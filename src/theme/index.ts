import { useEffect, useMemo } from 'react';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  type Theme,
} from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import * as SystemUI from 'expo-system-ui';

import { useAppStore } from '@/store/useAppStore';
import { darkThemeColors, lightThemeColors, type ThemeColors } from './colors';

export type ResolvedScheme = 'light' | 'dark';

const createNavigationTheme = (scheme: ResolvedScheme, colors: ThemeColors): Theme => {
  const base = scheme === 'dark' ? NavigationDarkTheme : NavigationDefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.accent,
      background: colors.background,
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.border,
      notification: colors.accent,
    },
  };
};

export const useAppTheme = () => {
  const systemScheme = useColorScheme() ?? 'dark';
  const themePreference = useAppStore((state) => state.themePreference);

  const scheme: ResolvedScheme =
    themePreference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themePreference;

  const colors = scheme === 'dark' ? darkThemeColors : lightThemeColors;

  useEffect(() => {
    // keep native system UI background in sync with theme
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => {
      // no-op: helps avoid unhandled promise rejections on unsupported platforms
    });
  }, [colors.background]);

  const navigationTheme = useMemo(() => createNavigationTheme(scheme, colors), [scheme, colors]);

  return {
    scheme,
    colors,
    navigationTheme,
  };
};

export { darkThemeColors, lightThemeColors } from './colors';
export type { ThemeColors } from './colors';