import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';

export function PredictionUnavailableState() {
  return (
    <Card
      variant="outline"
      style={styles.card}
      accessibilityRole="alert"
      accessibilityLabel="Prediction unavailable"
    >
      <View style={styles.iconWrap}>
        <Ionicons name="cloud-offline-outline" size={28} color={Colors.textMuted} />
      </View>
      <AppText variant="subtitle">Prediction unavailable</AppText>
      <AppText variant="body" muted style={styles.body}>
        A valid assessment result could not be loaded. Try running a new assessment
        from the dashboard.
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
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  body: {
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
});
