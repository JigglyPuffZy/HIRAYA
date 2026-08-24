import { ComponentProps, useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

type LoadingSpinnerSize = 'sm' | 'md' | 'lg';

interface LoadingSpinnerProps {
  message?: string;
  size?: LoadingSpinnerSize;
  icon?: ComponentProps<typeof Ionicons>['name'];
  variant?: 'inline' | 'card' | 'splash';
  style?: ViewStyle;
}

const INDICATOR_SIZE: Record<LoadingSpinnerSize, 'small' | 'large'> = {
  sm: 'small',
  md: 'small',
  lg: 'large',
};

const ICON_SIZE: Record<LoadingSpinnerSize, number> = {
  sm: 20,
  md: 28,
  lg: 36,
};

export function LoadingSpinner({
  message = 'Loading...',
  size = 'md',
  icon,
  variant = 'inline',
  style,
}: LoadingSpinnerProps) {
  const { colors } = useTheme();
  const pulse = useRef(new Animated.Value(0.6)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0.6, duration: 900, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.06, duration: 900, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 900, useNativeDriver: true }),
        ]),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [pulse, scale]);

  const isSplash = variant === 'splash';
  const isCard = variant === 'card';

  return (
    <View
      style={[
        styles.container,
        isCard && [
          styles.card,
          {
            backgroundColor: colors.surfaceMuted,
            borderColor: colors.borderLight,
          },
        ],
        isSplash && styles.splash,
        style,
      ]}
      accessibilityLabel={message}
      accessibilityLiveRegion="polite"
    >
      <Animated.View
        style={[
          styles.iconWrap,
          {
            backgroundColor: colors.primarySoft,
            borderColor: colors.accentPeach,
            opacity: pulse,
            transform: [{ scale }],
          },
          isSplash && styles.splashIconWrap,
        ]}
      >
        {icon ? (
          <Ionicons name={icon} size={ICON_SIZE[size]} color={colors.primary} />
        ) : (
          <ActivityIndicator size={INDICATOR_SIZE[size]} color={colors.primary} />
        )}
      </Animated.View>

      <AppText
        variant={isSplash ? 'subtitle' : 'caption'}
        style={[
          styles.message,
          { color: isSplash ? colors.text : colors.textSecondary },
        ]}
      >
        {message}
      </AppText>

      {isSplash ? (
        <View style={[styles.dotsRow, { backgroundColor: colors.chipBackground }]}>
          {[0, 1, 2].map((dot) => (
            <Animated.View
              key={dot}
              style={[
                styles.dot,
                { backgroundColor: colors.primary, opacity: pulse },
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  card: {
    borderRadius: BorderRadius.xxl,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
  },
  splash: {
    paddingVertical: Spacing.xxl,
    gap: Spacing.lg,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  splashIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  message: {
    textAlign: 'center',
    fontWeight: '600',
    maxWidth: 260,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
