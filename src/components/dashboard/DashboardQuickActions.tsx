import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Card } from '@/components/ui/Card';
import { ROUTES } from '@/constants/routes';
import { DASHBOARD_ICONS } from '@/constants/dashboardIcons';
import { BorderRadius, FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

export function DashboardQuickActions() {
  const router = useRouter();
  const { colors } = useTheme();
  const { size } = useResponsiveLayout();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { gap: Spacing.sm },
        actionRow: {
          flexDirection: 'row',
          gap: Spacing.sm,
        },
        primaryCard: {
          flex: 1,
          padding: 0,
          overflow: 'hidden',
        },
        primaryInner: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.md,
          padding: Spacing.lg,
        },
        primaryIconWrap: {
          width: size.quickActionIcon,
          height: size.quickActionIcon,
          borderRadius: BorderRadius.md,
          backgroundColor: colors.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: colors.accentPeach,
        },
        primaryText: { flex: 1, gap: 3, minWidth: 0 },
        primaryTitle: {
          fontSize: FontSize.md,
          fontWeight: '800',
          letterSpacing: -0.2,
          color: colors.text,
        },
        primarySubtitle: {
          fontSize: FontSize.sm,
          lineHeight: 19,
          color: colors.textSecondary,
        },
        secondaryCard: {
          width: 108,
          padding: 0,
        },
        secondaryInner: {
          alignItems: 'center',
          justifyContent: 'center',
          gap: Spacing.sm,
          padding: Spacing.md,
          minHeight: 88,
        },
        secondaryLabel: {
          fontSize: FontSize.xs,
          fontWeight: '700',
          color: colors.textSecondary,
          textAlign: 'center',
        },
        pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
      }),
    [colors, size.quickActionIcon],
  );

  return (
    <View style={styles.container}>
      <SectionHeader
        title="Quick Actions"
        subtitle="Start a check-in or review conditions"
        icon={DASHBOARD_ICONS.quickAction.section}
      />

      <View style={styles.actionRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Assess your heat risk"
          onPress={() => router.navigate(ROUTES.ASSESSMENT)}
          style={({ pressed }) => [styles.primaryCard, pressed && styles.pressed]}
        >
          <Card variant="outline" padded={false} style={{ flex: 1 }}>
            <View style={styles.primaryInner}>
              <View style={styles.primaryIconWrap}>
                <Ionicons
                  name={DASHBOARD_ICONS.quickAction.card}
                  size={22}
                  color={colors.primary}
                />
              </View>
              <View style={styles.primaryText}>
                <AppText style={styles.primaryTitle}>Risk Check-in</AppText>
                <AppText style={styles.primarySubtitle}>
                  Profile + live weather
                </AppText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </View>
          </Card>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View weather details"
          onPress={() => router.navigate(ROUTES.WEATHER)}
          style={({ pressed }) => [styles.secondaryCard, pressed && styles.pressed]}
        >
          <Card variant="soft" padded={false}>
            <View style={styles.secondaryInner}>
              <Ionicons name="cloud-outline" size={22} color={colors.primary} />
              <AppText style={styles.secondaryLabel}>Weather</AppText>
            </View>
          </Card>
        </Pressable>
      </View>
    </View>
  );
}
