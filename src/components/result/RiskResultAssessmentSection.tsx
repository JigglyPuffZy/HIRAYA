import { StyleSheet, View } from 'react-native';
import { AssessmentInputData } from '@/types/prediction';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { buildAssessmentDisplayItems } from '@/utils/assessmentDisplay';
import { PROFILE_FIELD_DEFINITIONS } from '@/constants/profileFields';
import { formatProfileFieldDisplay } from '@/utils/profileValidation';
import { parseHealthConditions, formatHealthConditionLabels } from '@/utils/healthConditions';

interface RiskResultAssessmentSectionProps {
  assessment: AssessmentInputData;
  profile?: AssessmentInputData;
}

export function RiskResultAssessmentSection({
  assessment,
  profile,
}: RiskResultAssessmentSectionProps) {
  const { colors } = useTheme();
  const items = buildAssessmentDisplayItems(assessment);

  const healthConditions = parseHealthConditions(profile?.health_conditions);
  if (healthConditions.length > 0) {
    items.unshift({
      key: 'health_conditions',
      label: 'Health conditions',
      value: formatHealthConditionLabels(healthConditions).join(', '),
    });
  }

  const ageField = PROFILE_FIELD_DEFINITIONS.find((field) => field.id === 'age');
  if (profile?.age !== undefined && ageField) {
    items.unshift({
      key: 'profile_age',
      label: ageField.label,
      value: formatProfileFieldDisplay(ageField, profile.age),
    });
  }

  return (
    <Card style={styles.card} accessibilityLabel="Assessment information used">
      <SectionHeader title="Your check-in answers" icon="clipboard-outline" />

      {items.length > 0 ? (
        <View style={styles.list}>
          {items.map((item) => (
            <View
              key={item.key}
              style={[
                styles.row,
                {
                  backgroundColor: colors.surfaceMuted,
                  borderColor: colors.borderLight,
                },
              ]}
              accessibilityLabel={`${item.label}: ${item.value}`}
            >
              <AppText variant="caption" muted style={styles.label} numberOfLines={2}>
                {item.label}
              </AppText>
              <AppText variant="label" style={styles.value} numberOfLines={3}>
                {item.value}
              </AppText>
            </View>
          ))}
        </View>
      ) : (
        <AppText variant="body" muted>
          No check-in answers were included with this result.
        </AppText>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.md,
  },
  list: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  label: {
    flex: 1,
    minWidth: 0,
  },
  value: {
    flexShrink: 0,
    maxWidth: '52%',
    textAlign: 'right',
  },
});
