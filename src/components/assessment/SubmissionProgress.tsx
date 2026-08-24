import { ComponentProps } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { AssessmentSubmissionStep } from '@/types/assessment';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const STEPS: { key: AssessmentSubmissionStep; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'fetching_weather', label: 'Live weather', icon: 'partly-sunny-outline' },
  { key: 'submitting', label: 'Calculating', icon: 'analytics-outline' },
  { key: 'complete', label: 'Done', icon: 'checkmark-circle-outline' },
];

interface SubmissionProgressProps {
  step: AssessmentSubmissionStep;
  message: string;
}

export function SubmissionProgress({ step, message }: SubmissionProgressProps) {
  const { colors } = useTheme();
  const activeIndex = STEPS.findIndex((item) => item.key === step);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceMuted,
          borderColor: colors.borderLight,
        },
      ]}
      accessibilityLiveRegion="polite"
      accessibilityLabel={message}
    >
      <View style={styles.header}>
        <ActivityIndicator size="small" color={colors.primary} />
        <AppText variant="label" style={{ color: colors.primary }}>
          {message}
        </AppText>
      </View>

      <View style={styles.stepsRow}>
        {STEPS.map((item, index) => {
          const isActive = index === activeIndex;
          const isDone = activeIndex > index || step === 'complete';

          return (
            <View key={item.key} style={styles.stepItem}>
              <View
                style={[
                  styles.stepDot,
                  {
                    backgroundColor: isDone
                      ? colors.successSoft
                      : isActive
                        ? colors.primarySoft
                        : colors.chipBackground,
                    borderColor: isDone
                      ? colors.successBorder
                      : isActive
                        ? colors.accentPeach
                        : colors.borderLight,
                  },
                ]}
              >
                {isDone ? (
                  <Ionicons name="checkmark" size={12} color={colors.success} />
                ) : isActive ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons name={item.icon} size={12} color={colors.textMuted} />
                )}
              </View>
              <AppText
                variant="caption"
                style={{
                  color: isActive || isDone ? colors.text : colors.textMuted,
                  fontWeight: isActive ? '700' : '500',
                }}
                numberOfLines={1}
              >
                {item.label}
              </AppText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
