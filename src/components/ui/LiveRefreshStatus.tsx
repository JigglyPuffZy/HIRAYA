import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { WEATHER_REFRESH_INTERVAL_SEC } from '@/constants/liveRefresh';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

function formatRefreshCountdown(seconds: number): string {
  if (seconds >= 60) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }

  return `${seconds}s`;
}

interface LiveRefreshStatusProps {
  isRefreshing: boolean;
  secondsUntilRefresh: number;
  intervalSec?: number;
  /** @deprecated Use `variant="banner"` instead */
  compact?: boolean;
  variant?: 'banner' | 'panel';
}

export function LiveRefreshStatus({
  isRefreshing,
  secondsUntilRefresh,
  intervalSec = WEATHER_REFRESH_INTERVAL_SEC,
  compact = false,
  variant = compact ? 'banner' : 'panel',
}: LiveRefreshStatusProps) {
  const { colors } = useTheme();
  const { isCompact } = useResponsiveLayout();

  const progress =
    intervalSec > 0
      ? Math.min(1, Math.max(0, 1 - secondsUntilRefresh / intervalSec))
      : 0;

  const countdownLabel = formatRefreshCountdown(secondsUntilRefresh);

  const accessibilityLabel = isRefreshing
    ? 'Updating live data'
    : `Next auto-refresh in ${countdownLabel}`;

  if (variant === 'banner') {
    return (
      <View
        style={[
          styles.banner,
          {
            backgroundColor: colors.surfaceMuted,
            borderColor: colors.borderLight,
          },
        ]}
        accessibilityLabel={accessibilityLabel}
      >
        <View style={styles.bannerLeft}>
          {isRefreshing ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <View style={[styles.liveDot, { backgroundColor: colors.success }]} />
          )}
          <View style={styles.bannerText}>
            <AppText variant="caption" style={{ color: colors.text, fontWeight: '700' }}>
              {isRefreshing ? 'Refreshing now' : 'Auto-refresh'}
            </AppText>
            <AppText variant="caption" muted numberOfLines={1}>
              {isRefreshing ? 'Fetching latest weather' : 'Pull down to refresh anytime'}
            </AppText>
          </View>
        </View>

        <View style={styles.bannerRight}>
          <View style={[styles.track, { backgroundColor: colors.borderLight }]}>
            <View
              style={[
                styles.fill,
                {
                  backgroundColor: isRefreshing ? colors.primaryLight : colors.primary,
                  width: isRefreshing ? '100%' : `${Math.round(progress * 100)}%`,
                },
              ]}
            />
          </View>
          <View
            style={[
              styles.countdownBadge,
              {
                backgroundColor: colors.chipBackground,
                borderColor: colors.borderLight,
              },
            ]}
          >
            <Ionicons name="timer-outline" size={12} color={colors.primary} />
            <AppText variant="caption" style={{ color: colors.primary, fontWeight: '800' }}>
              {isRefreshing ? '...' : countdownLabel}
            </AppText>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: colors.surfaceMuted,
          borderColor: colors.borderLight,
        },
      ]}
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.panelRow}>
        {isRefreshing ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons name="sync-outline" size={16} color={colors.primary} />
        )}
        <AppText
          variant="caption"
          style={{ color: colors.textSecondary, fontWeight: '600', flex: 1, flexShrink: 1 }}
          numberOfLines={isCompact ? 2 : 1}
        >
          {isRefreshing ? 'Refreshing...' : 'Next auto-refresh'}
        </AppText>
        <View
          style={[
            styles.countdownBadge,
            {
              backgroundColor: colors.chipBackground,
              borderColor: colors.borderLight,
            },
          ]}
        >
          <Ionicons name="timer-outline" size={12} color={colors.primary} />
          <AppText variant="caption" style={{ color: colors.primary, fontWeight: '800' }}>
            {isRefreshing ? '...' : countdownLabel}
          </AppText>
        </View>
      </View>
      <View style={[styles.track, { backgroundColor: colors.borderLight }]}>
        <View
          style={[
            styles.fill,
            {
              backgroundColor: colors.primary,
              width: `${Math.round(progress * 100)}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexShrink: 0,
    maxWidth: '46%',
  },
  bannerText: {
    gap: 1,
    flexShrink: 1,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bannerRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minWidth: 0,
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    flexShrink: 0,
  },
  panel: {
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  panelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  track: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    minWidth: 48,
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
});
