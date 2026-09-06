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
  /** Corporate navy accent for headers and emphasis */
  accentNavy: string;
  accentNavySoft: string;
};

export const lightColors: ThemeColors = {
  primary: '#D97706',
  primaryDark: '#B45309',
  primaryLight: '#F59E0B',
  primarySoft: '#FFFBEB',
  primaryMuted: '#FDE68A',
  background: '#F4F6FA',
  backgroundAlt: '#ECEFF5',
  surface: '#FFFFFF',
  surfaceMuted: '#F8FAFC',
  surfaceElevated: '#FFFFFF',
  text: '#0B1220',
  textSecondary: '#3D4F66',
  textMuted: '#64748B',
  border: '#D8DEE8',
  borderLight: '#E8EDF4',
  error: '#DC2626',
  errorSoft: '#FEF2F2',
  success: '#047857',
  successSoft: '#ECFDF5',
  successBorder: '#A7F3D0',
  warning: '#B45309',
  warningSoft: '#FFFBEB',
  info: '#1D4ED8',
  infoSoft: '#EFF6FF',
  overlay: 'rgba(11, 18, 32, 0.52)',
  heroGradientStart: '#FFFFFF',
  heroGradientMid: '#F8FAFC',
  heroGradientEnd: '#F1F5F9',
  accentBlue: '#DBEAFE',
  accentPeach: '#FEF3C7',
  chipBackground: 'rgba(255, 255, 255, 0.92)',
  chipBackgroundStrong: '#FFFFFF',
  glassBorder: 'rgba(216, 222, 232, 0.8)',
  onPrimary: '#FFFFFF',
  inputBackground: '#FFFFFF',
  decorativeOrbPrimary: '#FEF3C7',
  decorativeOrbSecondary: '#DBEAFE',
  decorativeOrbAccent: '#F1F5F9',
  accentNavy: '#1E3A5F',
  accentNavySoft: '#E8EEF6',
};

export const darkColors: ThemeColors = {
  primary: '#F59E0B',
  primaryDark: '#D97706',
  primaryLight: '#FBBF24',
  primarySoft: '#292017',
  primaryMuted: '#78350F',
  background: '#06080E',
  backgroundAlt: '#0C1018',
  surface: '#121A28',
  surfaceMuted: '#172033',
  surfaceElevated: '#1A2438',
  text: '#F1F5F9',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  border: '#2A3548',
  borderLight: '#1E2A3D',
  error: '#F87171',
  errorSoft: '#450A0A',
  success: '#34D399',
  successSoft: '#064E3B',
  successBorder: '#065F46',
  warning: '#FBBF24',
  warningSoft: '#451A03',
  info: '#60A5FA',
  infoSoft: '#1E3A5F',
  overlay: 'rgba(0, 0, 0, 0.72)',
  heroGradientStart: '#172033',
  heroGradientMid: '#121A28',
  heroGradientEnd: '#06080E',
  accentBlue: '#1E3A5F',
  accentPeach: '#292017',
  chipBackground: 'rgba(255, 255, 255, 0.06)',
  chipBackgroundStrong: 'rgba(255, 255, 255, 0.1)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  onPrimary: '#FFFFFF',
  inputBackground: '#0A0F18',
  decorativeOrbPrimary: '#292017',
  decorativeOrbSecondary: '#1E3A5F',
  decorativeOrbAccent: '#172033',
  accentNavy: '#93C5FD',
  accentNavySoft: '#1E2A3D',
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
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  card: {
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  elevated: {
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  glow: {
    shadowColor: '#B45309',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
} as const;

const darkShadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 2,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 5,
  },
  elevated: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 8,
  },
  glow: {
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 5,
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
  xl: 22,
  xxl: 28,
  display: 40,
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
      end: { x: 0, y: 1 },
    },
    primary: {
      colors: [colors.primaryLight, colors.primary, colors.primaryDark] as const,
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    warm: {
      colors: [colors.surface, colors.primarySoft] as const,
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },
    soft: {
      colors: [colors.surface, colors.surfaceMuted] as const,
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    sky: {
      colors: [colors.surface, colors.accentNavySoft, colors.surfaceMuted] as const,
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
  };
}
