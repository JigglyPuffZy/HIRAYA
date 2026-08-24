import { ComponentProps, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WeatherData } from '@/types/weather';
import { AppText } from '@/components/ui/AppText';
import { GradientSurface } from '@/components/ui/GradientSurface';
import { TemperatureDisplay } from '@/components/ui/TemperatureDisplay';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { BorderRadius, FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import {
  formatRelativeTime,
  formatPercent,
  formatTemperature,
} from '@/utils/formatters';

interface WeatherCardProps {
  weather: WeatherData;
  isRefreshing?: boolean;
}

function getWeatherIcon(condition: string): ComponentProps<typeof Ionicons>['name'] {
  const c = condition.toLowerCase();
  if (c.includes('rain') || c.includes('drizzle')) return 'rainy';
  if (c.includes('cloud') || c.includes('overcast')) return 'cloudy';
  if (c.includes('clear') || c.includes('sun')) return 'sunny';
  return 'partly-sunny';
}

export function WeatherCard({ weather, isRefreshing = false }: WeatherCardProps) {
  const { colors, shadows } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrapper: {
          borderWidth: 1,
          borderColor: colors.borderLight,
          ...shadows.card,
        },
        card: { padding: Spacing.lg, gap: Spacing.lg },
        locationRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          alignSelf: 'flex-start',
          backgroundColor: colors.chipBackground,
          paddingHorizontal: Spacing.sm,
          paddingVertical: 6,
          borderRadius: BorderRadius.full,
          maxWidth: '100%',
          borderWidth: 1,
          borderColor: colors.borderLight,
        },
        location: { color: colors.textSecondary, flexShrink: 1 },
        liveDot: {
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: colors.success,
        },
        liveLabel: {
          color: colors.success,
          fontWeight: '700',
          fontSize: 11,
        },
        hero: { alignItems: 'center', gap: Spacing.sm },
        iconOrb: {
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: colors.borderLight,
          ...shadows.sm,
        },
        condition: {
          textTransform: 'capitalize',
          color: colors.textSecondary,
          fontSize: FontSize.lg,
          fontWeight: '600',
          textAlign: 'center',
          paddingHorizontal: Spacing.md,
        },
        metrics: { flexDirection: 'row', gap: Spacing.sm },
        metric: {
          flex: 1,
          alignItems: 'center',
          gap: 4,
          backgroundColor: colors.surface,
          borderRadius: BorderRadius.lg,
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.xs,
          borderWidth: 1,
          borderColor: colors.borderLight,
          minWidth: 0,
        },
        updated: { textAlign: 'center' },
        cardWrap: { position: 'relative' },
      }),
    [colors, shadows],
  );

  return (
    <View style={styles.cardWrap}>
      <GradientSurface preset="sky" style={styles.wrapper}>
        <View style={styles.card}>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color={colors.primary} />
            <AppText variant="label" style={styles.location} numberOfLines={1}>
              {weather.location}
            </AppText>
            {isRefreshing ? (
              <ActivityIndicator size="small" color={colors.success} />
            ) : (
              <View style={styles.liveDot} />
            )}
            <AppText variant="caption" style={styles.liveLabel}>
              {isRefreshing ? 'Updating' : 'Live'}
            </AppText>
          </View>

        <View style={styles.hero}>
          <View style={styles.iconOrb}>
            <Ionicons name={getWeatherIcon(weather.condition)} size={40} color={colors.primary} />
          </View>
          <TemperatureDisplay celsius={weather.temperature} size="hero" />
          <AppText variant="body" style={styles.condition} numberOfLines={2}>
            {weather.condition}
          </AppText>
        </View>

        <View style={styles.metrics}>
          <Metric label="Humidity" value={formatPercent(weather.humidity)} icon="water" styles={styles} color={colors.primary} />
          <Metric label="Wind" value={`${Math.round(weather.windKph)} km/h`} icon="flag" styles={styles} color={colors.primary} />
          <Metric label="Feels like" value={formatTemperature(weather.feelsLike)} icon="thermometer" styles={styles} color={colors.primary} />
        </View>

        <AppText variant="caption" muted style={styles.updated}>
          Updated {formatRelativeTime(weather.updatedAt)}
        </AppText>
      </View>
    </GradientSurface>
      {isRefreshing ? (
        <LoadingOverlay message="Refreshing..." borderRadius={BorderRadius.xxl} />
      ) : null}
    </View>
  );
}

function Metric({
  label,
  value,
  icon,
  styles,
  color,
}: {
  label: string;
  value: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  color: string;
  styles: {
    metric: object;
  };
}) {
  return (
    <View style={styles.metric}>
      <Ionicons name={icon} size={16} color={color} />
      <AppText variant="caption" muted numberOfLines={1}>
        {label}
      </AppText>
      <AppText variant="label" numberOfLines={1}>
        {value}
      </AppText>
    </View>
  );
}
