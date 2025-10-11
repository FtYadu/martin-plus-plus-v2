export const palette = {
  amber: {
    50: '#FFF6E5',
    100: '#FFE7BF',
    200: '#FFD18E',
    300: '#FFB945',
    400: '#FFA21A',
    500: '#FF8C00',
  },
  gray: {
    50: '#F4F6FB',
    100: '#E5E8F5',
    200: '#C6CCE2',
    300: '#9BA1BE',
    400: '#6D7393',
    500: '#3E425C',
    600: '#2C3043',
    700: '#1E2130',
    800: '#141623',
    900: '#0B0C16',
  },
  green: {
    400: '#3ECD8F',
    500: '#27AE60',
  },
  red: {
    400: '#FF6B6B',
    500: '#E53935',
  },
  blue: {
    400: '#4D9FFF',
  },
};

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  overlay: string;
  accent: string;
  accentMuted: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  success: string;
  warning: string;
  danger: string;
  destructive: string;
};

export const darkThemeColors: ThemeColors = {
  background: palette.gray[900],
  surface: palette.gray[800],
  surfaceElevated: '#1A1C2A',
  border: '#24273A',
  overlay: 'rgba(11,12,22,0.8)',
  accent: palette.amber[300],
  accentMuted: palette.amber[100],
  textPrimary: palette.gray[50],
  textSecondary: palette.gray[200],
  textMuted: palette.gray[400],
  success: palette.green[400],
  warning: palette.amber[400],
  danger: palette.red[400],
  destructive: palette.red[400],
};

export const lightThemeColors: ThemeColors = {
  background: palette.gray[50],
  surface: '#FFFFFF',
  surfaceElevated: '#F7F8FD',
  border: palette.gray[100],
  overlay: 'rgba(244,246,251,0.9)',
  accent: palette.amber[400],
  accentMuted: palette.amber[100],
  textPrimary: palette.gray[900],
  textSecondary: palette.gray[500],
  textMuted: palette.gray[300],
  success: palette.green[500],
  warning: palette.amber[400],
  danger: palette.red[500],
  destructive: palette.red[500],
};
