import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AssessmentHistoryItem } from '@/types/assessmentHistory';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { getRiskLevelVisualStyle, formatRiskLevelBadge, formatRiskLevelLabel } from '@/constants/riskLevels';
import { BorderRadius, FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { formatDateTime } from '@/utils/formatters';
import { normalizeDisplayedRiskScore } from '@/utils/riskScore';

interface AssessmentHistoryCardProps {
  item: AssessmentHistoryItem;
  onPress: (item: AssessmentHistoryItem) => void;
}

export function AssessmentHistoryCard({
  item,
  onPress,
}: AssessmentHistoryCardProps) {
  const { colors, shadows } = useTheme();
  const visual = getRiskLevelVisualStyle(item.riskLevel);
  const displayScore = normalizeDisplayedRiskScore(item.prediction);
  const showPrediction = typeof displayScore === 'number';

  const sourceLabel =
    item.source === 'live_refresh'
      ? 'Auto-refresh'
      : item.source === 'user_refresh'
        ? 'Manual refresh'
        : item.source === 'manual_assessment'
          ? 'Check-in'
          : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Assessment on ${formatDateTime(item.assessedAt)}, risk level ${formatRiskLevelLabel(item.riskLevel)}`}
      onPress={() => onPress(item)}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <Card style={styles.card} padded={false}>
        <View style={[styles.accentStripe, { backgroundColor: visual.accentColor }]} />
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <AppText variant="label" numberOfLines={1}>
                {formatDateTime(item.assessedAt)}
              </AppText>
              {item.weatherSummary ? (
                <AppText variant="caption" muted numberOfLines={1}>
                  {item.weatherSummary}
                </AppText>
              ) : null}
              {sourceLabel ? (
                <View style={[styles.sourceChip, { backgroundColor: colors.primarySoft, borderColor: colors.accentPeach }]}>
                  <AppText variant="caption" style={{ color: colors.primaryDark, fontWeight: '600', fontSize: 10 }}>
                    {sourceLabel}
                  </AppText>
                </View>
              ) : null}
            </View>
            <View style={[styles.badge, { backgroundColor: visual.accentColor }, shadows.sm]}>
              <AppText variant="caption" style={[styles.badgeText, { color: colors.onPrimary }]} numberOfLines={1}>
                {formatRiskLevelBadge(item.riskLevel)}
              </AppText>
            </View>
          </View>

          {showPrediction ? (
            <View style={[styles.scoreRow, { backgroundColor: colors.surfaceMuted, borderColor: colors.borderLight }]}>
              <AppText variant="caption" muted>
                Risk score
              </AppText>
              <AppText variant="label" style={[styles.score, { color: colors.primaryDark }]}>
                {displayScore}
              </AppText>
            </View>
          ) : null}

          <View style={styles.footerRow}>
            <AppText variant="caption" style={{ color: colors.primary }}>
              View details
            </AppText>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  accentStripe: {
    height: 3,
    width: '100%',
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  sourceChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    maxWidth: 120,
  },
  badgeText: {
    fontWeight: '700',
    textAlign: 'center',
    fontSize: FontSize.xs,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  score: {
    fontSize: FontSize.lg,
    fontWeight: '800',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: Spacing.xs,
  },
});
