import { ComponentProps, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NormalizedWeatherData } from '@/types/prediction';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { TemperatureDisplay } from '@/components/ui/TemperatureDisplay';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { BorderRadius, FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import {
  formatRelativeTime,
  formatPercent,
  formatTemperature,
} from '@/utils/formatters';
import { formatPagasaHeatIndexSubtitle } from '@/config/risk-assessment.config';
import { estimateWbgtC } from '@/services/environmental/wbgt-calculator';

interface RiskResultWeatherSectionProps {
  weather: NormalizedWeatherData;
}

function getWeatherIcon(condition: string): ComponentProps<typeof Ionicons>['name'] {
  const c = condition.toLowerCase();
  if (c.includes('rain') || c.includes('drizzle')) return 'rainy';
  if (c.includes('cloud') || c.includes('overcast')) return 'cloudy';
  if (c.includes('clear') || c.includes('sun')) return 'sunny';
  return 'partly-sunny';
}

export function RiskResultWeatherSection({
  weather,
}: RiskResultWeatherSectionProps) {
  const { colors } = useTheme();
  const wbgt =
    typeof weather.wbgt === 'number' && Number.isFinite(weather.wbgt)
      ? weather.wbgt
      : estimateWbgtC(weather.temperature, weather.humidity);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: { gap: Spacing.md },
        summaryRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: Spacing.md,
          backgroundColor: colors.surfaceMuted,
          borderRadius: BorderRadius.lg,
          borderWidth: 1,
          borderColor: colors.borderLight,
          padding: Spacing.md,
        },
        summaryLeft: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
          minWidth: 0,
        },
        iconBubble: {
          width: 52,
          height: 52,
          borderRadius: 16,
          backgroundColor: colors.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        },
        summaryText: { flex: 1, gap: 4, minWidth: 0 },
        location: { color: colors.textSecondary, lineHeight: 20 },
        condition: { textTransform: 'capitalize', lineHeight: 18 },
        summaryRight: {
          flexShrink: 0,
          alignItems: 'flex-end',
          justifyContent: 'center',
        },
        metricsRow: { flexDirection: 'row', gap: Spacing.sm },
        metric: {
          flex: 1,
          minWidth: 0,
          alignItems: 'center',
          gap: 4,
          backgroundColor: colors.surface,
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.xs,
          borderRadius: BorderRadius.lg,
          borderWidth: 1,
          borderColor: colors.borderLight,
        },
        metricLabel: { fontSize: 10, textAlign: 'center', lineHeight: 14 },
        metricValue: {
          fontSize: FontSize.sm,
          textAlign: 'center',
          lineHeight: 18,
          width: '100%',
        },
        uvRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
        captured: { lineHeight: 18 },
      }),
    [colors],
  );

  return (
    <Card variant="soft" style={styles.card} accessibilityLabel="Weather information used">
      <SectionHeader title="Weather at assessment" icon="partly-sunny-outline" />

      <View style={styles.summaryRow}>
        <View style={styles.summaryLeft}>
          <View style={styles.iconBubble}>
            <Ionicons
              name={getWeatherIcon(weather.condition)}
              size={28}
              color={colors.primary}
            />
          </View>
          <View style={styles.summaryText}>
            <AppText variant="label" style={styles.location} numberOfLines={2}>
              {weather.location}
            </AppText>
            <AppText variant="caption" muted style={styles.condition} numberOfLines={2}>
              {weather.condition}
            </AppText>
          </View>
        </View>
        <View style={styles.summaryRight}>
          <TemperatureDisplay celsius={weather.temperature} size="md" />
        </View>
      </View>

      <View style={styles.metricsRow}>
        <Metric
          icon="thermometer"
          label="Heat index"
          value={formatTemperature(weather.heatIndex)}
          styles={styles}
          color={colors.primary}
        />
        <Metric
          icon="sunny"
          label="WBGT"
          value={formatTemperature(wbgt)}
          styles={styles}
          color={colors.primary}
        />
        <Metric
          icon="water"
          label="Humidity"
          value={formatPercent(weather.humidity)}
          styles={styles}
          color={colors.primary}
        />
      </View>

      <AppText variant="caption" muted>
        PAGASA {formatPagasaHeatIndexSubtitle(weather.heatIndex)} · WBGT est.
      </AppText>

      {weather.uvIndex > 0 ? (
        <View style={styles.uvRow}>
          <Ionicons name="sunny" size={14} color={colors.primary} />
          <AppText variant="caption" muted>
            UV index {weather.uvIndex}
            {weather.windDir ? ` · Wind ${weather.windDir}` : ''}
          </AppText>
        </View>
      ) : null}

      <AppText variant="caption" muted style={styles.captured}>
        Captured {formatRelativeTime(weather.capturedAt)}
      </AppText>
    </Card>
  );
}

function Metric({
  icon,
  label,
  value,
  styles: themedStyles,
  color,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  color: string;
  styles: {
    metric: object;
    metricLabel: object;
    metricValue: object;
  };
}) {
  return (
    <View style={themedStyles.metric} accessibilityLabel={`${label} ${value}`}>
      <Ionicons name={icon} size={15} color={color} />
      <AppText variant="caption" muted style={themedStyles.metricLabel} numberOfLines={1}>
        {label}
      </AppText>
      <AppText variant="label" style={themedStyles.metricValue} numberOfLines={1} ellipsizeMode="tail">
        {value}
      </AppText>
    </View>
  );
}
