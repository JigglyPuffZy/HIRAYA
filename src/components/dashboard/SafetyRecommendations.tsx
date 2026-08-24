import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SafetyTipsCarousel } from '@/components/dashboard/SafetyTipsCarousel';
import { SafetyRecommendationSection } from '@/types/riskAssessment';
import { buildSafetyTipCarouselGroups } from '@/utils/safetyTipsCarousel';
import { DASHBOARD_ICONS } from '@/constants/dashboardIcons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface SafetyRecommendationsProps {
  structuredSections?: SafetyRecommendationSection[];
}

export function SafetyRecommendations({
  structuredSections,
}: SafetyRecommendationsProps) {
  const { colors } = useTheme();

  const tipGroups = useMemo(
    () => buildSafetyTipCarouselGroups(structuredSections),
    [structuredSections],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        groups: {
          gap: Spacing.lg,
        },
        empty: {
          alignItems: 'center',
          gap: Spacing.sm,
          paddingVertical: Spacing.lg,
        },
        emptyIcon: {
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: colors.surfaceMuted,
          alignItems: 'center',
          justifyContent: 'center',
        },
        emptyText: {
          textAlign: 'center',
          maxWidth: 280,
          lineHeight: 22,
        },
      }),
    [colors],
  );

  return (
    <View accessibilityLabel="Safety recommendations section">
      <SectionHeader
        title="Safety Tips"
        subtitle="Personalized for your health profile"
        icon={DASHBOARD_ICONS.safety.section}
      />

      {tipGroups.length > 0 ? (
        <View style={styles.groups}>
          {tipGroups.map((group) => (
            <SafetyTipsCarousel
              key={group.id}
              title={group.label}
              tips={group.tips}
              showGroupChip={false}
            />
          ))}
        </View>
      ) : (
        <Card>
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name={DASHBOARD_ICONS.safety.empty} size={24} color={colors.primary} />
            </View>
            <AppText variant="body" muted style={styles.emptyText}>
              Add your health conditions in Profile to see personalized safety tips here.
            </AppText>
          </View>
        </Card>
      )}
    </View>
  );
}
