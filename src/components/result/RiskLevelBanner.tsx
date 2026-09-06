import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  formatRiskLevelTitle,
  formatRiskLevelSummary,
  getRiskLevelVisualStyle,
} from '@/constants/riskLevels';
import { formatPagasaHeatIndexSubtitle } from '@/config/risk-assessment.config';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { BorderRadius, FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { formatRelativeTime } from '@/utils/formatters';
import { normalizeDisplayedRiskScore } from '@/utils/riskScore';

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
  const displayScore = normalizeDisplayedRiskScore(score);
  const showScore = displayScore !== undefined;

  return (
    <Card
      variant="elevated"
      padded={false}
      style={[
        styles.banner,
        {
          borderColor: visual.borderColor,
        },
        shadows.card,
      ]}
      accessibilityRole="summary"
      accessibilityLabel={`Heat risk level ${label}`}
    >
      <View style={[styles.stripe, { backgroundColor: visual.accentColor }]} />
      <View style={styles.body}>
        <View style={styles.main}>
          <View style={styles.headerRow}>
            <View style={[styles.iconWrap, { backgroundColor: `${visual.accentColor}22` }]}>
              <Ionicons name="shield-checkmark" size={18} color={visual.accentColor} />
            </View>
            <AppText variant="caption" style={[styles.eyebrow, { color: colors.textSecondary }]}>
              YOUR RESULT
            </AppText>
          </View>

          <View style={[styles.levelPanel, { backgroundColor: visual.backgroundColor, borderColor: visual.borderColor }]}>
            <AppText
              style={[styles.level, { color: visual.textColor }]}
              accessibilityRole="header"
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.65}
            >
              {label}
            </AppText>
            <AppText variant="caption" style={[styles.summary, { color: visual.textColor }]}>
              {summary}
            </AppText>
          </View>

          {pagasaBand ? (
            <AppText variant="caption" muted>
              PAGASA heat index: {pagasaBand}
            </AppText>
          ) : null}

          {assessedAt ? (
            <AppText variant="caption" muted>
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
                backgroundColor: colors.surface,
              },
              shadows.sm,
            ]}
          >
            <AppText style={[styles.scoreValue, { color: visual.accentColor }]}>
              {displayScore}
            </AppText>
            <AppText variant="caption" style={[styles.scoreLabel, { color: colors.textMuted }]}>
              Score
            </AppText>
          </View>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  banner: {
    overflow: 'hidden',
  },
  stripe: {
    height: 4,
    width: '100%',
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
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontWeight: '700',
    letterSpacing: 0.8,
    fontSize: 10,
  },
  levelPanel: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: 4,
  },
  level: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  summary: {
    lineHeight: 20,
    opacity: 0.9,
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
  },
});
