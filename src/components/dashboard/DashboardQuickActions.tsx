import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ROUTES } from '@/constants/routes';
import { DASHBOARD_ICONS } from '@/constants/dashboardIcons';
import { BorderRadius, FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

export function DashboardQuickActions() {
  const router = useRouter();
  const { colors, shadows } = useTheme();
  const { size } = useResponsiveLayout();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { gap: Spacing.sm },
        primaryWrap: {
          borderRadius: BorderRadius.xl,
          overflow: 'hidden',
          ...shadows.glow,
        },
        primaryCard: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.md,
          padding: Spacing.lg,
        },
        primaryIconWrap: {
          width: size.quickActionIcon,
          height: size.quickActionIcon,
          borderRadius: BorderRadius.md,
          backgroundColor: 'rgba(255,255,255,0.18)',
          alignItems: 'center',
          justifyContent: 'center',
        },
        primaryText: { flex: 1, gap: 4, minWidth: 0, flexShrink: 1 },
        primaryTitle: {
          color: colors.onPrimary,
          fontSize: FontSize.lg,
          fontWeight: '800',
          letterSpacing: -0.3,
        },
        primarySubtitle: {
          color: 'rgba(255,255,255,0.88)',
          fontSize: FontSize.sm,
          lineHeight: 20,
        },
        trailingIcon: {
          opacity: 0.92,
        },
        pressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },
      }),
    [colors, shadows, size.quickActionIcon],
  );

  return (
    <View style={styles.container}>
      <SectionHeader
        title="Quick Action"
        subtitle="Start a personalized heat-risk check-in"
        icon={DASHBOARD_ICONS.quickAction.section}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Assess your heat risk"
        onPress={() => router.navigate(ROUTES.ASSESSMENT)}
        style={({ pressed }) => [styles.primaryWrap, pressed && styles.pressed]}
      >
        <LinearGradient
          colors={[colors.primaryLight, colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.primaryCard}
        >
          <View style={styles.primaryIconWrap}>
            <Ionicons
              name={DASHBOARD_ICONS.quickAction.card}
              size={24}
              color={colors.onPrimary}
            />
          </View>
          <View style={styles.primaryText}>
            <AppText style={styles.primaryTitle}>Assess Risk</AppText>
            <AppText style={styles.primarySubtitle}>
              Uses your profile and live Tuguegarao conditions
            </AppText>
          </View>
          <Ionicons
            name={DASHBOARD_ICONS.quickAction.trailing}
            size={22}
            color="rgba(255,255,255,0.92)"
            style={styles.trailingIcon}
          />
        </LinearGradient>
      </Pressable>
    </View>
  );
}
