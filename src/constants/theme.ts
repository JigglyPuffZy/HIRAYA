export type ThemeColors = {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primarySoft: string;
  primaryMuted: string;
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceMuted: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  error: string;
  errorSoft: string;
  success: string;
  successSoft: string;
  successBorder: string;
  warning: string;
  warningSoft: string;
  info: string;
  infoSoft: string;
  overlay: string;
  heroGradientStart: string;
  heroGradientMid: string;
  heroGradientEnd: string;
  accentBlue: string;
  accentPeach: string;
  chipBackground: string;
  chipBackgroundStrong: string;
  glassBorder: string;
  onPrimary: string;
  inputBackground: string;
  decorativeOrbPrimary: string;
  decorativeOrbSecondary: string;
  decorativeOrbAccent: string;
};

export const lightColors: ThemeColors = {
  primary: '#EA580C',
  primaryDark: '#C2410C',
  primaryLight: '#FB923C',
  primarySoft: '#FFF7ED',
  primaryMuted: '#FDBA74',
  background: '#F4F7FB',
  backgroundAlt: '#EEF2F7',
  surface: '#FFFFFF',
  surfaceMuted: '#F8FAFC',
  surfaceElevated: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  error: '#DC2626',
  errorSoft: '#FEF2F2',
  success: '#059669',
  successSoft: '#ECFDF5',
  successBorder: '#A7F3D0',
  warning: '#D97706',
  warningSoft: '#FFFBEB',
  info: '#2563EB',
  infoSoft: '#EFF6FF',
  overlay: 'rgba(15, 23, 42, 0.5)',
  heroGradientStart: '#FFF7ED',
  heroGradientMid: '#FFFFFF',
  heroGradientEnd: '#F8FAFC',
  accentBlue: '#DBEAFE',
  accentPeach: '#FFEDD5',
  chipBackground: 'rgba(255, 255, 255, 0.85)',
  chipBackgroundStrong: 'rgba(255, 255, 255, 0.95)',
  glassBorder: 'rgba(255, 255, 255, 0.6)',
  onPrimary: '#FFFFFF',
  inputBackground: '#FFFFFF',
  decorativeOrbPrimary: '#FFF7ED',
  decorativeOrbSecondary: '#E0F2FE',
  decorativeOrbAccent: '#FFEDD5',
};

export const darkColors: ThemeColors = {
  primary: '#FB923C',
  primaryDark: '#EA580C',
  primaryLight: '#FDBA74',
  primarySoft: '#3D1F0F',
  primaryMuted: '#9A3412',
  background: '#0B1120',
  backgroundAlt: '#0F172A',
  surface: '#151F32',
  surfaceMuted: '#1A2538',
  surfaceElevated: '#1E293B',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  border: '#334155',
  borderLight: '#243044',
  error: '#F87171',
  errorSoft: '#450A0A',
  success: '#34D399',
  successSoft: '#064E3B',
  successBorder: '#065F46',
  warning: '#FBBF24',
  warningSoft: '#451A03',
  info: '#60A5FA',
  infoSoft: '#1E3A5F',
  overlay: 'rgba(0, 0, 0, 0.7)',
  heroGradientStart: '#1A2538',
  heroGradientMid: '#151F32',
  heroGradientEnd: '#0B1120',
  accentBlue: '#1E3A5F',
  accentPeach: '#431407',
  chipBackground: 'rgba(255, 255, 255, 0.08)',
  chipBackgroundStrong: 'rgba(255, 255, 255, 0.14)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',
  onPrimary: '#FFFFFF',
  inputBackground: '#1E293B',
  decorativeOrbPrimary: '#431407',
  decorativeOrbSecondary: '#1E3A5F',
  decorativeOrbAccent: '#3D1F0F',
};

/** @deprecated Use `useTheme().colors` instead */
export const Colors = lightColors;

export type ThemeShadows = {
  sm: object;
  card: object;
  elevated: object;
  glow: object;
};

const lightShadows = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  elevated: {
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  glow: {
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

const darkShadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 6,
  },
  elevated: {
    shadowColor: '#FB923C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  glow: {
    shadowColor: '#FB923C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
} as const;

export const Shadows = lightShadows;

export function getThemeShadows(isDark: boolean): ThemeShadows {
  return isDark ? darkShadows : lightShadows;
}

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  display: 44,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
} as const;

export const Layout = {
  screenPadding: Spacing.lg,
  maxContentWidth: 480,
} as const;

export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getGradientPresets(colors: ThemeColors) {
  return {
    hero: {
      colors: [colors.heroGradientStart, colors.heroGradientMid, colors.heroGradientEnd] as const,
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    primary: {
      colors: [colors.primary, colors.primaryDark] as const,
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    warm: {
      colors: [colors.primarySoft, colors.accentPeach] as const,
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },
    soft: {
      colors: [colors.surface, colors.primarySoft] as const,
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    sky: {
      colors: [colors.infoSoft, colors.surfaceMuted, colors.primarySoft] as const,
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
  };
}
