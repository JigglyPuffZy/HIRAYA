import { ComponentProps, useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ComponentProps<typeof Ionicons>['name'];
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  icon,
  style,
  ...props
}: ButtonProps) {
  const { colors, shadows } = useTheme();
  const isDisabled = disabled || loading;
  const isPrimary = variant === 'primary';
  const radius = size === 'lg' ? BorderRadius.xl : size === 'sm' ? BorderRadius.md : BorderRadius.lg;

  const textColor = useMemo(() => {
    if (variant === 'primary' || variant === 'secondary') {
      return colors.onPrimary;
    }
    if (variant === 'ghost') {
      return colors.primary;
    }
    return colors.text;
  }, [colors, variant]);

  const variantStyle = useMemo(() => {
    switch (variant) {
      case 'secondary':
        return { backgroundColor: colors.primaryDark, ...shadows.sm };
      case 'outline':
        return {
          backgroundColor: colors.surface,
          borderWidth: 1.5,
          borderColor: colors.border,
        };
      case 'ghost':
        return { backgroundColor: 'transparent' };
      default:
        return {};
    }
  }, [colors, shadows, variant]);

  const content = loading ? (
    <ActivityIndicator color={textColor} />
  ) : (
    <View style={styles.labelRow}>
      {icon ? <Ionicons name={icon} size={size === 'lg' ? 20 : 18} color={textColor} /> : null}
      <Text style={[styles.text, { color: textColor }, textSizeStyles[size]]}>{title}</Text>
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        fullWidth && styles.fullWidth,
        isPrimary && { borderRadius: radius, ...shadows.glow },
        !isPrimary && [styles.solidBase, sizeStyles[size], variantStyle, { borderRadius: radius }],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style as ViewStyle,
      ]}
      {...props}
    >
      {isPrimary ? (
        <LinearGradient
          colors={[colors.primaryLight, colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[sizeStyles[size], styles.gradient, { borderRadius: radius }, fullWidth && styles.fullWidth]}
        >
          {content}
        </LinearGradient>
      ) : (
        content
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  solidBase: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.45,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

const sizeStyles = StyleSheet.create<Record<ButtonSize, ViewStyle>>({
  sm: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 40,
  },
  md: {
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    minHeight: 48,
  },
  lg: {
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.xl,
    minHeight: 58,
  },
});

const textSizeStyles = StyleSheet.create<Record<ButtonSize, { fontSize: number }>>({
  sm: { fontSize: FontSize.sm },
  md: { fontSize: FontSize.md },
  lg: { fontSize: FontSize.lg },
});
