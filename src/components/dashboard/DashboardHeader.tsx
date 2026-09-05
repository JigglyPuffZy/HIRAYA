import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { GradientSurface } from '@/components/ui/GradientSurface';
import { ROUTES } from '@/constants/routes';
import { STUDY_AREA_LABEL } from '@/constants/study-area';
import { formatRelativeTime } from '@/utils/formatters';
import { Spacing, BorderRadius, getTimeBasedGreeting } from '@/constants/theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useTheme } from '@/context/ThemeContext';

interface DashboardHeaderProps {
  userName?: string;
  lastUpdated?: string | null;
}

function getInitials(name?: string): string {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

export function DashboardHeader({ userName, lastUpdated }: DashboardHeaderProps) {
  const router = useRouter();
  const { colors, shadows } = useTheme();
  const { font } = useResponsiveLayout();
  const greetingName = userName?.trim().split(' ')[0] || 'there';
  const greeting = getTimeBasedGreeting();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { marginBottom: Spacing.xs },
        heroCard: {
          borderWidth: 1,
          borderColor: colors.accentPeach,
          ...shadows.card,
        },
        decorCircleLarge: {
          position: 'absolute',
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: colors.primaryMuted,
          opacity: 0.15,
          top: -30,
          right: -20,
        },
        decorCircleSmall: {
          position: 'absolute',
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: colors.accentBlue,
          opacity: 0.35,
          bottom: 20,
          left: -16,
        },
        heroInner: { padding: Spacing.lg, gap: Spacing.md },
        heroTop: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        brandRow: { flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 },
        profileButton: { borderRadius: BorderRadius.full },
        pressed: { opacity: 0.85 },
        avatarRing: {
          padding: 2,
          borderRadius: BorderRadius.full,
          backgroundColor: colors.primaryMuted,
        },
        avatar: {
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: colors.borderLight,
        },
        avatarText: { color: colors.primary, fontWeight: '800', fontSize: 15 },
        greetingBlock: { gap: 2 },
        greetingEyebrow: {
          color: colors.primary,
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: 0.8,
          fontSize: 11,
        },
        greeting: {
          fontSize: font.heroGreeting,
          lineHeight: Math.round(font.heroGreeting * 1.2),
          letterSpacing: -0.8,
          color: colors.text,
        },
        subtitle: { lineHeight: 22, marginTop: 2 },
        metaRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
          flexWrap: 'wrap',
        },
        metaChip: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          backgroundColor: colors.chipBackground,
          paddingHorizontal: Spacing.sm,
          paddingVertical: 6,
          borderRadius: BorderRadius.full,
          borderWidth: 1,
          borderColor: colors.borderLight,
          flexShrink: 0,
        },
        metaChipMuted: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          backgroundColor: colors.chipBackground,
          paddingHorizontal: Spacing.sm,
          paddingVertical: 6,
          borderRadius: BorderRadius.full,
          borderWidth: 1,
          borderColor: colors.borderLight,
          minWidth: 0,
        },
        metaText: { color: colors.textSecondary, fontWeight: '600' },
        metaTextMuted: {
          flex: 1,
        },
      }),
    [colors, shadows, font.heroGreeting],
  );

  return (
    <View style={styles.container}>
      <GradientSurface preset="hero" style={styles.heroCard}>
        <View style={styles.decorCircleLarge} />
        <View style={styles.decorCircleSmall} />

        <View style={styles.heroInner}>
          <View style={styles.heroTop}>
            <View style={styles.brandRow}>
              <BrandLogo size="sm" />
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open profile"
              onPress={() => router.navigate(ROUTES.PROFILE)}
              style={({ pressed }) => [styles.profileButton, pressed && styles.pressed]}
            >
              <View style={styles.avatarRing}>
                <View style={styles.avatar}>
                  <AppText style={styles.avatarText}>{getInitials(userName)}</AppText>
                </View>
              </View>
            </Pressable>
          </View>

          <View style={styles.greetingBlock}>
            <AppText variant="caption" style={styles.greetingEyebrow}>
              {greeting}
            </AppText>
            <AppText variant="title" style={styles.greeting} numberOfLines={2}>
              {greetingName}
            </AppText>
            <AppText variant="body" muted style={styles.subtitle}>
              Monitoring heat risk in {STUDY_AREA_LABEL}
            </AppText>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Ionicons name="location" size={14} color={colors.primary} />
              <AppText variant="caption" style={styles.metaText}>
                Live area
              </AppText>
            </View>
            {lastUpdated ? (
              <View style={styles.metaChipMuted}>
                <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                <AppText variant="caption" muted style={styles.metaTextMuted} numberOfLines={1}>
                  Updated {formatRelativeTime(lastUpdated)}
                </AppText>
              </View>
            ) : null}
          </View>
        </View>
      </GradientSurface>
    </View>
  );
}
