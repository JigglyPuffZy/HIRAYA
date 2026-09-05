import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { BorderRadius, FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function AuthInput({ label, error, style, ...props }: AuthInputProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.label,
          { color: isDark ? 'rgba(248,250,252,0.85)' : colors.textSecondary },
        ]}
      >
        {label}
      </Text>
      <TextInput
        placeholderTextColor={isDark ? 'rgba(148,163,184,0.65)' : colors.textMuted}
        style={[
          styles.input,
          {
            borderColor: error
              ? colors.error
              : isDark
                ? 'rgba(255,255,255,0.1)'
                : colors.border,
            color: colors.text,
            backgroundColor: isDark ? 'rgba(8,12,22,0.88)' : colors.inputBackground,
          },
          error ? styles.inputError : null,
          style,
        ]}
        {...props}
      />
      {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    letterSpacing: 0.15,
    marginLeft: 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: 15,
    fontSize: FontSize.md,
    minHeight: 54,
  },
  inputError: {
    borderWidth: 1.5,
  },
  error: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    marginLeft: 2,
  },
});
