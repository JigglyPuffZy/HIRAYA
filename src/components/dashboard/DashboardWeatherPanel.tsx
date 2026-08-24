import { ComponentProps, useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { WeatherData } from '@/types/weather';
import { AppText } from '@/components/ui/AppText';
import { GradientSurface } from '@/components/ui/GradientSurface';
import { TemperatureDisplay } from '@/components/ui/TemperatureDisplay';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';
import { WeatherPanelSkeleton } from '@/components/ui/ContentSkeletons';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LiveRefreshStatus } from '@/components/ui/LiveRefreshStatus';
import { ROUTES } from '@/constants/routes';
import { DASHBOARD_ICONS, weatherConditionIcon } from '@/constants/dashboardIcons';
import { formatPercent, formatTemperature } from '@/utils/formatters';
import { BorderRadius, FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

interface DashboardWeatherPanelProps {
  weather: WeatherData | null;
  isLoading: boolean;
  isRefreshing?: boolean;
  secondsUntilRefresh?: number;
  refreshIntervalSec?: number;
  error: string | null;
  onRetry: () => void;
}

function getWeatherIcon(condition: string): ComponentProps<typeof Ionicons>['name'] {
  return weatherConditionIcon(condition);
}

export function DashboardWeatherPanel({
  weather,
  isLoading,
  isRefreshing = false,
  secondsUntilRefresh = 0,
  refreshIntervalSec,
  error,
  onRetry,
}: DashboardWeatherPanelProps) {
  const router = useRouter();
  const { colors, shadows } = useTheme();
  const { size, s } = useResponsiveLayout();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        loadingWrap: {
          backgroundColor: colors.surface,
          borderRadius: BorderRadius.xxl,
          paddingVertical: Spacing.lg,
          borderWidth: 1,
          borderColor: colors.borderLight,
        },
        heroCard: {
          borderWidth: 1,
          borderColor: colors.borderLight,
          ...shadows.card,
        },
        cardInner: {
          padding: Spacing.lg,
          gap: Spacing.lg,
        },
        topRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: Spacing.sm,
        },
        locationChip: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          backgroundColor: colors.chipBackground,
          paddingHorizontal: Spacing.sm,
          paddingVertical: 6,
          borderRadius: BorderRadius.full,
          borderWidth: 1,
          borderColor: colors.borderLight,
          minWidth: 0,
        },
        locationText: {
          color: colors.textSecondary,
          fontWeight: '600',
          flexShrink: 1,
        },
        liveChip: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: colors.successSoft,
          paddingHorizontal: Spacing.sm,
          paddingVertical: 6,
          borderRadius: BorderRadius.full,
          borderWidth: 1,
          borderColor: colors.successBorder,
        },
        liveDot: {
          width: 7,
          height: 7,
          borderRadius: 4,
          backgroundColor: colors.success,
        },
        liveText: {
          color: colors.success,
          fontWeight: '700',
          fontSize: 11,
        },
        weatherHero: {
          alignItems: 'center',
          gap: Spacing.sm,
          paddingVertical: Spacing.sm,
        },
        iconOrb: {
          width: size.weatherIconOrb,
          height: size.weatherIconOrb,
          borderRadius: size.weatherIconOrb / 2,
          backgroundColor: colors.chipBackgroundStrong,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: Spacing.xs,
        },
        condition: {
          textTransform: 'capitalize',
          color: colors.textSecondary,
          fontSize: FontSize.lg,
          fontWeight: '600',
          textAlign: 'center',
          paddingHorizontal: Spacing.md,
        },
        metricsGrid: {
          flexDirection: 'row',
          gap: Spacing.sm,
          flexWrap: 'wrap',
        },
        metricTile: {
          flexGrow: 1,
          flexBasis: '30%',
          minWidth: s(96),
          borderRadius: BorderRadius.lg,
          padding: Spacing.md,
          gap: 6,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.glassBorder,
        },
        metricIconBubble: {
          alignItems: 'center',
          justifyContent: 'center',
        },
        metricLabel: {
          fontSize: 10,
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: 0.4,
        },
        metricValue: {
          fontSize: FontSize.sm,
          textAlign: 'center',
          fontWeight: '700',
        },
        detailsLink: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: Spacing.xs,
          paddingVertical: Spacing.sm,
          backgroundColor: colors.chipBackground,
          borderRadius: BorderRadius.lg,
          borderWidth: 1,
          borderColor: colors.borderLight,
        },
        detailsText: {
          color: colors.primary,
        },
        pressed: {
          opacity: 0.85,
        },
        stateBlock: {
          gap: Spacing.md,
        },
        cardWrap: {
          position: 'relative',
        },
        refreshWrap: {
          marginTop: -Spacing.xs,
        },
      }),
    [colors, shadows, s, size.weatherIconOrb],
  );

  return (
    <View accessibilityLabel="Current weather section">
      <SectionHeader
        title="Live Weather"
        subtitle="Real-time conditions in Tuguegarao"
        icon={DASHBOARD_ICONS.weather.section}
        actionLabel="Details"
        onAction={() => router.navigate(ROUTES.WEATHER)}
      />

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <WeatherPanelSkeleton />
        </View>
      ) : null}

      {!isLoading && error ? (
        <View style={styles.stateBlock}>
          <ErrorMessage message={error} />
          <Button title="Retry" variant="outline" onPress={onRetry} />
        </View>
      ) : null}

      {!isLoading && !error && weather ? (
        <View style={styles.cardWrap}>
          <GradientSurface preset="sky" style={styles.heroCard}>
          <View style={styles.cardInner}>
            <View style={styles.topRow}>
              <View style={styles.locationChip}>
                <Ionicons name="location" size={13} color={colors.primary} />
                <AppText variant="caption" style={styles.locationText} numberOfLines={1}>
                  {weather.location}
                </AppText>
              </View>
              <View style={styles.liveChip}>
                {isRefreshing ? (
                  <ActivityIndicator size="small" color={colors.success} />
                ) : (
                  <View style={styles.liveDot} />
                )}
                <AppText variant="caption" style={styles.liveText}>
                  {isRefreshing ? 'Updating' : 'Live'}
                </AppText>
              </View>
            </View>

            <View style={styles.weatherHero}>
              <View style={styles.iconOrb}>
                <Ionicons
                  name={getWeatherIcon(weather.condition)}
                  size={Math.round(size.weatherIconOrb * 0.57)}
                  color={colors.primary}
                />
              </View>
              <TemperatureDisplay celsius={weather.temperature} size="hero" />
              <AppText variant="body" style={styles.condition} numberOfLines={2}>
                {weather.condition}
              </AppText>
            </View>

            <View style={styles.metricsGrid}>
              <MetricTile
                icon={DASHBOARD_ICONS.weather.humidity}
                label="Humidity"
                value={formatPercent(weather.humidity)}
                tint={colors.infoSoft}
                styles={styles}
                iconColor={colors.primary}
              />
              <MetricTile
                icon={DASHBOARD_ICONS.weather.wind}
                label="Wind"
                value={`${Math.round(weather.windKph)} km/h`}
                tint={colors.primarySoft}
                styles={styles}
                iconColor={colors.primary}
              />
              <MetricTile
                icon={DASHBOARD_ICONS.weather.feelsLike}
                label="Feels like"
                value={formatTemperature(weather.feelsLike)}
                tint={colors.warningSoft}
                styles={styles}
                iconColor={colors.primary}
              />
            </View>

            <View style={styles.refreshWrap}>
              <LiveRefreshStatus
                variant="panel"
                isRefreshing={isRefreshing}
                secondsUntilRefresh={secondsUntilRefresh}
                intervalSec={refreshIntervalSec}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View full weather details"
              onPress={() => router.navigate(ROUTES.WEATHER)}
              style={({ pressed }) => [styles.detailsLink, pressed && styles.pressed]}
            >
              <AppText variant="label" style={styles.detailsText}>
                View weather details
              </AppText>
              <Ionicons name={DASHBOARD_ICONS.weather.details} size={16} color={colors.primary} />
            </Pressable>
          </View>
        </GradientSurface>
          {isRefreshing ? (
            <LoadingOverlay message="Refreshing weather..." borderRadius={BorderRadius.xxl} />
          ) : null}
        </View>
      ) : null}

      {!isLoading && !error && !weather ? (
        <View style={styles.stateBlock}>
          <AppText variant="body" muted>
            Weather data is unavailable right now.
          </AppText>
          <Button title="Open Weather" variant="outline" onPress={() => router.navigate(ROUTES.WEATHER)} />
        </View>
      ) : null}
    </View>
  );
}

function MetricTile({
  icon,
  label,
  value,
  tint,
  styles: themedStyles,
  iconColor,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  tint: string;
  iconColor: string;
  styles: {
    metricTile: object;
    metricIconBubble: object;
    metricLabel: object;
    metricValue: object;
  };
}) {
  return (
    <View style={[themedStyles.metricTile, { backgroundColor: tint }]} accessibilityLabel={`${label} ${value}`}>
      <View style={themedStyles.metricIconBubble}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <AppText variant="caption" muted style={themedStyles.metricLabel} numberOfLines={1}>
        {label}
      </AppText>
      <AppText variant="label" style={themedStyles.metricValue} numberOfLines={1}>
        {value}
      </AppText>
    </View>
  );
}
