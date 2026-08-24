import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import {
  darkColors,
  getThemeShadows,
  lightColors,
  type ThemeColors,
  type ThemeShadows,
} from '@/constants/theme';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { storageService } from '@/services/storageService';

export type ColorSchemePreference = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  colors: ThemeColors;
  shadows: ThemeShadows;
  isDark: boolean;
  preference: ColorSchemePreference;
  setPreference: (preference: ColorSchemePreference) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ColorSchemePreference>('dark');

  useEffect(() => {
    let mounted = true;

    void (async () => {
      const stored = await storageService.getItem(STORAGE_KEYS.THEME_PREFERENCE);

      if (
        mounted &&
        (stored === 'system' || stored === 'light' || stored === 'dark')
      ) {
        setPreferenceState(stored);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const isDark =
    preference === 'dark' ||
    (preference === 'system' && systemScheme === 'dark');

  const colors = isDark ? darkColors : lightColors;
  const shadows = getThemeShadows(isDark);

  const setPreference = useCallback(async (next: ColorSchemePreference) => {
    setPreferenceState(next);
    await storageService.setItem(STORAGE_KEYS.THEME_PREFERENCE, next);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors,
      shadows,
      isDark,
      preference,
      setPreference,
    }),
    [colors, shadows, isDark, preference, setPreference],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}
