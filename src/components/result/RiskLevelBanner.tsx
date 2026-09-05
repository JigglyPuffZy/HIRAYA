import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  formatRiskLevelTitle,
  formatRiskLevelSummary,
  getRiskLevelVisualStyle,
} from '@/constants/riskLevels';
import { formatPagasaHeatIndexSubtitle } from '@/config/risk-assessment.config';
import { AppText } from '@/components/ui/AppText';
import { BorderRadius, FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { formatRelativeTime } from '@/utils/formatters';

interface RiskLevelBannerProps {
  riskLevel: string;
  score?: number;
  assessedAt?: string;
  heatIndexC?: number;
}

export function RiskLevelBanner({
  riskLevel,
  score,
  assessedAt,
  heatIndexC,
}: RiskLevelBannerProps) {
  const { colors, shadows } = useTheme();
  const visual = getRiskLevelVisualStyle(riskLevel);
  const label = formatRiskLevelTitle(riskLevel);
  const summary = formatRiskLevelSummary(riskLevel);
  const pagasaBand =
    typeof heatIndexC === 'number' && Number.isFinite(heatIndexC)
      ? formatPagasaHeatIndexSubtitle(heatIndexC)
      : null;
  const showScore = typeof score === 'number' && Number.isFinite(score);

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: visual.backgroundColor,
          borderColor: visual.borderColor,
        },
        shadows.card,
      ]}
      accessibilityRole="summary"
      accessibilityLabel={`Heat risk level ${label}`}
    >
      <View style={styles.body}>
        <View style={styles.main}>
          <View style={styles.headerRow}>
            <View style={[styles.iconWrap, { backgroundColor: `${visual.accentColor}33` }]}>
              <Ionicons name="shield-checkmark" size={20} color={visual.textColor} />
            </View>
            <AppText variant="caption" style={[styles.eyebrow, { color: visual.textColor }]}>
              Your result
            </AppText>
          </View>

          <AppText
            style={[styles.level, { color: visual.textColor }]}
            accessibilityRole="header"
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.65}
          >
            {label}
          </AppText>
          <AppText
            variant="caption"
            style={[styles.levelSuffix, { color: visual.textColor }]}
          >
            Heat risk
          </AppText>

          <AppText variant="body" style={[styles.summary, { color: visual.textColor }]}>
            {summary}
          </AppText>

          {pagasaBand ? (
            <AppText variant="caption" style={[styles.timestamp, { color: visual.textColor }]}>
              PAGASA heat index: {pagasaBand}
            </AppText>
          ) : null}

          {assessedAt ? (
            <AppText variant="caption" style={[styles.timestamp, { color: visual.textColor }]}>
              Assessed {formatRelativeTime(assessedAt)}
            </AppText>
          ) : null}
        </View>

        {showScore ? (
          <View
            style={[
              styles.scoreRing,
              {
                borderColor: visual.accentColor,
                backgroundColor: colors.chipBackgroundStrong,
              },
            ]}
          >
            <AppText style={[styles.scoreValue, { color: visual.textColor }]}>
              {Math.round(score!)}
            </AppText>
            <AppText variant="caption" style={[styles.scoreLabel, { color: visual.textColor }]}>
              Score
            </AppText>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: 1.5,
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  main: {
    flex: 1,
    gap: Spacing.sm,
    minWidth: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontSize: 11,
  },
  level: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  levelSuffix: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 11,
    opacity: 0.85,
    marginTop: -2,
  },
  summary: {
    lineHeight: 22,
    opacity: 0.9,
  },
  timestamp: {
    opacity: 0.75,
  },
  scoreRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    flexShrink: 0,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28,
  },
  scoreLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.8,
  },
});
