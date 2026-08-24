import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';

export function AssessmentHistoryEmptyState() {
  return (
    <Card
      variant="soft"
      style={styles.card}
      accessibilityRole="text"
      accessibilityLabel="No assessment history yet"
    >
      <View style={styles.iconWrap}>
        <Ionicons name="time-outline" size={28} color={Colors.primary} />
      </View>
      <AppText variant="subtitle">No assessments yet</AppText>
      <AppText variant="body" muted style={styles.body}>
        Live dashboard refreshes add a history entry only when temperature or risk level changes. Completed check-ins are always saved.
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
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  body: {
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
});
