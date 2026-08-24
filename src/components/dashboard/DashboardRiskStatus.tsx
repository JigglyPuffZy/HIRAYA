import { Pressable, StyleSheet, View } from 'react-native';
import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { RiskStatusSkeleton } from '@/components/ui/ContentSkeletons';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { ROUTES } from '@/constants/routes';
import { DASHBOARD_ICONS } from '@/constants/dashboardIcons';
import { formatRelativeTime } from '@/utils/formatters';
import {
  formatRiskLevelTitle,
  getRiskLevelVisualStyle,
} from '@/constants/riskLevels';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useTheme } from '@/context/ThemeContext';

interface DashboardRiskStatusProps {
  riskLevel?: string;
  prediction?: number;
  assessedAt?: string;
  assessmentId?: string;
  isLoading: boolean;
  isRefreshing?: boolean;
  error: string | null;
  onRetry: () => void;
}

export function DashboardRiskStatus({
  riskLevel,
  prediction,
  assessedAt,
  assessmentId,
  isLoading,
  isRefreshing = false,
  error,
  onRetry,
}: DashboardRiskStatusProps) {
  const router = useRouter();
  const { colors, shadows } = useTheme();
  const { font, size } = useResponsiveLayout();
  const hasAssessment = Boolean(riskLevel);
  const showPrediction =
    typeof prediction === 'number' && Number.isFinite(prediction);
  const visual = hasAssessment ? getRiskLevelVisualStyle(riskLevel!) : null;
  const levelTitle = hasAssessment ? formatRiskLevelTitle(riskLevel!) : '';
  const scoreRingSize = size.scoreRing;

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        riskLevelWord: {
          fontSize: font.riskLevel,
          fontWeight: '800',
          letterSpacing: -0.5,
          lineHeight: Math.round(font.riskLevel * 1.1),
        },
        scoreRing: {
          width: scoreRingSize,
          height: scoreRingSize,
          borderRadius: scoreRingSize / 2,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 3,
          flexShrink: 0,
        },
        scoreValue: {
          fontSize: Math.round(scoreRingSize * 0.33),
          fontWeight: '800',
          lineHeight: Math.round(scoreRingSize * 0.38),
        },
      }),
    [font.riskLevel, scoreRingSize],
  );

  const handleOpenResult = () => {
    if (!assessmentId || assessmentId === 'current') return;
    router.push({
      pathname: ROUTES.RESULT,
      params: { id: assessmentId },
    });
  };

  return (
    <View accessibilityLabel="Heat-related risk status section">
      <SectionHeader
        title="Your Heat Risk"
        subtitle={
          isRefreshing
            ? 'Updating with latest weather...'
            : 'Based on live weather and your profile'
        }
        icon={DASHBOARD_ICONS.risk.section}
      />

      <View style={styles.cardWrap}>
        <Card variant="elevated" style={styles.card}>
          {isLoading ? <RiskStatusSkeleton /> : null}

        {!isLoading && error ? (
          <View style={styles.stateBlock}>
            <ErrorMessage message={error} />
            <Button title="Retry" variant="outline" onPress={onRetry} />
          </View>
        ) : null}

        {!isLoading && !error && hasAssessment && visual ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Current heat risk level ${levelTitle}`}
            onPress={handleOpenResult}
            disabled={!assessmentId || assessmentId === 'current'}
            style={({ pressed }) => [styles.riskContent, pressed && styles.pressed]}
          >
            <View
              style={[
                styles.riskHero,
                {
                  backgroundColor: visual.backgroundColor,
                  borderColor: visual.borderColor,
                },
                shadows.sm,
              ]}
            >
              <View style={styles.riskAccent} />

              <View style={styles.riskBody}>
                <View style={styles.riskLeft}>
                  <View style={styles.levelBadge}>
                    <View style={[styles.levelDot, { backgroundColor: visual.accentColor }]} />
                    <AppText
                      variant="caption"
                      style={{ color: visual.textColor, fontWeight: '700' }}
                    >
                      Current level
                    </AppText>
                  </View>

                  <AppText
                    style={[dynamicStyles.riskLevelWord, { color: visual.textColor }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                  >
                    {levelTitle}
                  </AppText>
                  <AppText
                    variant="caption"
                    style={[styles.riskLevelSuffix, { color: visual.textColor }]}
                  >
                    Heat Risk
                  </AppText>

                  {assessedAt ? (
                    <AppText
                      variant="caption"
                      style={{ color: visual.textColor, opacity: 0.75 }}
                      numberOfLines={1}
                    >
                      Updated {formatRelativeTime(assessedAt)}
                    </AppText>
                  ) : null}
                </View>

                {showPrediction ? (
                  <View
                    style={[
                      dynamicStyles.scoreRing,
                      {
                        borderColor: visual.accentColor,
                        backgroundColor: colors.chipBackgroundStrong,
                      },
                    ]}
                  >
                    <AppText style={[dynamicStyles.scoreValue, { color: visual.accentColor }]}>
                      {Math.round(prediction!)}
                    </AppText>
                    <AppText
                      variant="caption"
                      style={[styles.scoreLabel, { color: visual.textColor, opacity: 0.8 }]}
                    >
                      score
                    </AppText>
                  </View>
                ) : null}
              </View>
            </View>

            {assessmentId && assessmentId !== 'current' ? (
              <View style={styles.viewResultRow}>
                <AppText variant="label" style={{ color: colors.primary }}>
                  View full assessment
                </AppText>
                <Ionicons name={DASHBOARD_ICONS.risk.viewResult} size={16} color={colors.primary} />
              </View>
            ) : null}
          </Pressable>
        ) : null}

        {!isLoading && !error && !hasAssessment ? (
          <View style={styles.emptyState}>
            <View
              style={[
                styles.emptyIcon,
                {
                  backgroundColor: colors.primarySoft,
                  borderColor: colors.accentPeach,
                },
              ]}
            >
              <Ionicons name={DASHBOARD_ICONS.risk.empty} size={26} color={colors.primary} />
            </View>
            <AppText variant="subtitle" style={styles.emptyText}>
              No assessment yet
            </AppText>
            <AppText variant="caption" muted style={styles.emptyText}>
              Run a quick check-in to get your personalized heat risk level and safety tips.
            </AppText>
          </View>
        ) : null}
        </Card>

        {isRefreshing && !isLoading && hasAssessment ? (
          <LoadingOverlay message="Updating risk..." borderRadius={BorderRadius.xl} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    position: 'relative',
  },
  card: {
    gap: Spacing.md,
  },
  stateBlock: {
    gap: Spacing.md,
  },
  riskContent: {
    gap: Spacing.md,
  },
  riskHero: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  riskAccent: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  riskBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  riskLeft: {
    flex: 1,
    gap: 4,
    minWidth: 0,
    paddingRight: Spacing.xs,
    flexShrink: 1,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  riskLevelSuffix: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 11,
    opacity: 0.85,
  },
  scoreLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  viewResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingTop: Spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
    borderWidth: 1,
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: '100%',
  },
  pressed: {
    opacity: 0.92,
  },
});
