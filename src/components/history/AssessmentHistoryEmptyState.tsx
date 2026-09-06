import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

export function AssessmentHistoryEmptyState() {
  const { colors } = useTheme();

  return (
    <Card
      variant="soft"
      style={styles.card}
      accessibilityRole="text"
      accessibilityLabel="No assessment history yet"
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        <Ionicons name="time-outline" size={28} color={colors.primary} />
      </View>
      <AppText variant="subtitle">No assessments yet</AppText>
      <AppText variant="body" muted style={styles.body}>
        Check-ins are saved automatically. Auto-refreshes appear when temperature or risk changes.
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xl,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
    borderWidth: 1,
  },
  body: {
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
});
