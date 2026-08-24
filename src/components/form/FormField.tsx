import { ReactNode } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

export interface FormFieldProps extends ViewProps {
  label: string;
  helperText?: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

export function FormField({
  label,
  helperText,
  required = false,
  error,
  children,
  style,
  ...props
}: FormFieldProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]} {...props}>
      <AppText variant="label" accessibilityRole="text">
        {label}
        {required ? (
          <AppText variant="label" style={{ color: colors.error }}>
            {' '}
            *
          </AppText>
        ) : null}
      </AppText>
      {helperText ? (
        <AppText variant="caption" muted>
          {helperText}
        </AppText>
      ) : null}
      {children}
      {error ? <ValidationMessage message={error} /> : null}
    </View>
  );
}

interface ValidationMessageProps {
  message: string;
}

export function ValidationMessage({ message }: ValidationMessageProps) {
  const { colors } = useTheme();

  return (
    <AppText
      variant="caption"
      style={{ color: colors.error }}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      {message}
    </AppText>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
});
