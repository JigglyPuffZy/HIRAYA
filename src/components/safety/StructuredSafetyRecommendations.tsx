import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SafetyRecommendationSection } from '@/types/riskAssessment';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface StructuredSafetyRecommendationsProps {
  sections: SafetyRecommendationSection[];
  compact?: boolean;
  maxSections?: number;
}

export function StructuredSafetyRecommendations({
  sections,
  compact = false,
  maxSections,
}: StructuredSafetyRecommendationsProps) {
  const { colors } = useTheme();

  const visibleSections = useMemo(() => {
    const filtered = sections.filter(
      (section) => section.id !== 'risk_summary' || !compact,
    );
    return maxSections ? filtered.slice(0, maxSections) : filtered;
  }, [sections, compact, maxSections]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { gap: Spacing.md },
        section: { gap: Spacing.sm },
        sectionTitle: {
          color: colors.primary,
          fontWeight: '800',
          letterSpacing: 0.2,
        },
        tip: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: Spacing.sm,
          backgroundColor: colors.surfaceMuted,
          padding: Spacing.md,
          borderRadius: BorderRadius.lg,
          borderWidth: 1,
          borderColor: colors.borderLight,
        },
        bullet: {
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: colors.primary,
          marginTop: 8,
        },
        tipText: {
          flex: 1,
          lineHeight: 22,
          color: colors.text,
        },
        explanationTip: {
          lineHeight: 22,
          color: colors.textSecondary,
        },
      }),
    [colors],
  );

  if (visibleSections.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      {visibleSections.map((section) => (
        <Card key={section.id} style={styles.section}>
          <SectionHeader title={section.title} icon="medkit-outline" />
          <View style={{ gap: Spacing.sm }}>
            {section.tips.map((tip, index) => (
              <View key={`${section.id}-${index}`} style={section.id === 'risk_explanation' ? undefined : styles.tip}>
                {section.id === 'risk_explanation' ? (
                  <AppText variant="body" style={styles.explanationTip}>
                    {tip}
                  </AppText>
                ) : (
                  <>
                    <View style={styles.bullet} />
                    <AppText variant="body" style={styles.tipText}>
                      {tip}
                    </AppText>
                  </>
                )}
              </View>
            ))}
          </View>
        </Card>
      ))}
    </View>
  );
}
