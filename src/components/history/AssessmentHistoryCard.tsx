import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AssessmentHistoryItem } from '@/types/assessmentHistory';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { getRiskLevelVisualStyle, formatRiskLevelBadge, formatRiskLevelLabel } from '@/constants/riskLevels';
import { BorderRadius, FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { formatDateTime } from '@/utils/formatters';

interface AssessmentHistoryCardProps {
  item: AssessmentHistoryItem;
  onPress: (item: AssessmentHistoryItem) => void;
}

export function AssessmentHistoryCard({
  item,
  onPress,
}: AssessmentHistoryCardProps) {
  const { colors } = useTheme();
  const visual = getRiskLevelVisualStyle(item.riskLevel);
  const showPrediction =
    typeof item.prediction === 'number' && Number.isFinite(item.prediction);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Assessment on ${formatDateTime(item.assessedAt)}, risk level ${formatRiskLevelLabel(item.riskLevel)}`}
      onPress={() => onPress(item)}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <Card style={styles.card}>
        <View style={[styles.accentBar, { backgroundColor: colors.primary }]} />
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
              {item.source === 'live_refresh' ? (
                <AppText variant="caption" style={{ color: colors.primary, fontWeight: '600' }}>
                  Auto-refresh
                </AppText>
              ) : null}
              {item.source === 'user_refresh' ? (
                <AppText variant="caption" style={{ color: colors.primary, fontWeight: '600' }}>
                  You refreshed
                </AppText>
              ) : null}
              {item.source === 'manual_assessment' ? (
                <AppText variant="caption" style={{ color: colors.primary, fontWeight: '600' }}>
                  Risk check-in
                </AppText>
              ) : null}
            </View>
            <View style={[styles.badge, { backgroundColor: visual.accentColor }]}>
              <AppText variant="caption" style={[styles.badgeText, { color: colors.onPrimary }]} numberOfLines={1}>
                {formatRiskLevelBadge(item.riskLevel)}
              </AppText>
            </View>
          </View>

          {showPrediction ? (
            <View style={styles.scoreRow}>
              <AppText variant="caption" muted>
                Risk score
              </AppText>
              <AppText variant="label" style={[styles.score, { color: colors.primary }]}>
                {item.prediction}
              </AppText>
            </View>
          ) : null}

          <View style={styles.footerRow}>
            <View style={styles.footerSpacer} />
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 0,
    overflow: 'hidden',
  },
  accentBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
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
    gap: 2,
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
    gap: Spacing.sm,
  },
  score: {
    fontSize: FontSize.lg,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: Spacing.xs,
  },
  footerSpacer: {
    flex: 1,
  },
});
