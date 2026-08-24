import { ActivityIndicator, StyleSheet, View, ViewStyle } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface LoadingOverlayProps {
  message?: string;
  borderRadius?: number;
  style?: ViewStyle;
}

export function LoadingOverlay({
  message = 'Updating...',
  borderRadius = BorderRadius.xl,
  style,
}: LoadingOverlayProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.overlay,
        {
          backgroundColor: colors.overlay,
          borderRadius,
        },
        style,
      ]}
      accessibilityLabel={message}
      accessibilityLiveRegion="polite"
    >
      <View style={[styles.badge, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        <ActivityIndicator size="small" color={colors.primary} />
        <AppText variant="caption" style={{ color: colors.text, fontWeight: '600' }}>
          {message}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
});
