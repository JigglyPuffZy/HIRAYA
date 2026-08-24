import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BorderRadius, FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface AuthButtonProps extends PressableProps {
  title: string;
  loading?: boolean;
  fullWidth?: boolean;
  variant?: 'primary' | 'outline';
}

export function AuthButton({
  title,
  loading = false,
  fullWidth = false,
  variant = 'primary',
  disabled,
  style,
  ...props
}: AuthButtonProps) {
  const { colors, shadows } = useTheme();
  const isDisabled = disabled || loading;
  const isOutline = variant === 'outline';

  if (isOutline) {
    return (
      <Pressable
        accessibilityRole="button"
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.base,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
          styles.outline,
          fullWidth && styles.fullWidth,
          pressed && !isDisabled && styles.pressed,
          isDisabled && styles.disabled,
          style as ViewStyle,
        ]}
        {...props}
      >
        {loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={[styles.outlineText, { color: colors.text }]}>{title}</Text>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        fullWidth && styles.fullWidth,
        styles.primaryOuter,
        shadows.glow,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style as ViewStyle,
      ]}
      {...props}
    >
      <LinearGradient
        colors={[colors.primaryLight, colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.base, styles.gradient, fullWidth && styles.fullWidth]}
      >
        {loading ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Text style={[styles.text, { color: colors.onPrimary }]}>{title}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 54,
  },
  gradient: {
    width: '100%',
  },
  primaryOuter: {
    borderRadius: BorderRadius.lg,
  },
  outline: {
    borderWidth: 1.5,
  },
  fullWidth: {
    width: '100%',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '700',
    fontSize: FontSize.md,
    letterSpacing: 0.3,
  },
  outlineText: {
    fontWeight: '700',
    fontSize: FontSize.md,
  },
});
