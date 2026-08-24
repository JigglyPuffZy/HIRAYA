import { ReactNode, useMemo } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

type CardVariant = 'default' | 'elevated' | 'soft' | 'outline';

interface CardProps extends ViewProps {
  children: ReactNode;
  variant?: CardVariant;
  padded?: boolean;
}

export function Card({
  children,
  style,
  variant = 'default',
  padded = true,
  ...props
}: CardProps) {
  const { colors, shadows } = useTheme();

  const variantStyle = useMemo(() => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.surfaceElevated,
          borderWidth: 1,
          borderColor: colors.borderLight,
          ...shadows.elevated,
        };
      case 'soft':
        return {
          backgroundColor: colors.primarySoft,
          borderWidth: 1,
          borderColor: colors.accentPeach,
        };
      case 'outline':
        return {
          backgroundColor: colors.surface,
          borderWidth: 1.5,
          borderColor: colors.border,
        };
      default:
        return {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.borderLight,
          ...shadows.card,
        };
    }
  }, [colors, shadows, variant]);

  return (
    <View
      style={[styles.base, padded && styles.padded, variantStyle, style]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  padded: {
    padding: Spacing.lg,
  },
});
