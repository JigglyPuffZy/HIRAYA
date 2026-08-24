import { useMemo } from 'react';
import { StyleSheet, TextStyle } from 'react-native';
import { BorderRadius, FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

export function useFormInputStyles(error?: string) {
  const { colors } = useTheme();

  return useMemo(
    () => ({
      input: {
        borderWidth: 1,
        borderColor: error ? colors.error : colors.border,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        fontSize: FontSize.md,
        color: colors.text,
        backgroundColor: colors.inputBackground,
        minHeight: 48,
      } as TextStyle,
      inputError: {
        borderColor: colors.error,
      } as TextStyle,
      multiline: {
        minHeight: 96,
        textAlignVertical: 'top' as const,
      } as TextStyle,
      placeholderColor: colors.textMuted,
    }),
    [colors, error],
  );
}
