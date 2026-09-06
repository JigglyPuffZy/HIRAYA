import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Card } from '@/components/ui/Card';
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
  const { colors } = useTheme();
  const { font } = useResponsiveLayout();
  const greetingName = userName?.trim().split(' ')[0] || 'there';
  const greeting = getTimeBasedGreeting();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { marginBottom: Spacing.xs },
        card: {
          padding: 0,
          overflow: 'hidden',
        },
        topStripe: {
          height: 4,
          backgroundColor: colors.primary,
        },
        inner: {
          padding: Spacing.lg,
          gap: Spacing.md,
        },
        topRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        brandBlock: {
          flex: 1,
          minWidth: 0,
        },
        profileButton: {
          borderRadius: BorderRadius.full,
        },
        pressed: { opacity: 0.85 },
        avatar: {
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: colors.accentNavySoft,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          borderColor: colors.surface,
        },
        avatarText: {
          color: colors.accentNavy,
          fontWeight: '800',
          fontSize: 15,
        },
        greetingEyebrow: {
          color: colors.primaryDark,
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: 1,
          fontSize: 10,
          marginBottom: 4,
        },
        greeting: {
          fontSize: font.heroGreeting,
          lineHeight: Math.round(font.heroGreeting * 1.15),
          letterSpacing: -0.8,
          color: colors.text,
          fontWeight: '800',
        },
        subtitle: {
          lineHeight: 21,
          marginTop: 4,
          color: colors.textSecondary,
        },
        metaRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
          flexWrap: 'wrap',
          paddingTop: Spacing.xs,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
        },
        metaChip: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          backgroundColor: colors.surfaceMuted,
          paddingHorizontal: Spacing.sm,
          paddingVertical: 6,
          borderRadius: BorderRadius.full,
          borderWidth: 1,
          borderColor: colors.borderLight,
        },
        metaText: {
          color: colors.textSecondary,
          fontWeight: '600',
          fontSize: 11,
        },
      }),
    [colors, font.heroGreeting],
  );

  return (
    <View style={styles.container}>
      <Card variant="elevated" padded={false} style={styles.card}>
        <View style={styles.topStripe} />
        <View style={styles.inner}>
          <View style={styles.topRow}>
            <View style={styles.brandBlock}>
              <BrandLogo size="sm" />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open profile"
              onPress={() => router.navigate(ROUTES.PROFILE)}
              style={({ pressed }) => [styles.profileButton, pressed && styles.pressed]}
            >
              <View style={styles.avatar}>
                <AppText style={styles.avatarText}>{getInitials(userName)}</AppText>
              </View>
            </Pressable>
          </View>

          <View>
            <AppText variant="caption" style={styles.greetingEyebrow}>
              {greeting}
            </AppText>
            <AppText variant="title" style={styles.greeting} numberOfLines={1}>
              {greetingName}
            </AppText>
            <AppText variant="body" style={styles.subtitle}>
              Heat safety overview · {STUDY_AREA_LABEL}
            </AppText>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Ionicons name="location-outline" size={13} color={colors.primary} />
              <AppText variant="caption" style={styles.metaText}>
                Live monitoring
              </AppText>
            </View>
            {lastUpdated ? (
              <View style={styles.metaChip}>
                <Ionicons name="sync-outline" size={13} color={colors.textMuted} />
                <AppText variant="caption" style={styles.metaText}>
                  {formatRelativeTime(lastUpdated)}
                </AppText>
              </View>
            ) : null}
          </View>
        </View>
      </Card>
    </View>
  );
}
