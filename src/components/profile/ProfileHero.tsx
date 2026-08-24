import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/components/ui/AppText';
import { UserProfile } from '@/types/userProfile';
import { BorderRadius, FontSize, Spacing } from '@/constants/theme';
import { formatDateTime } from '@/utils/formatters';
import { useTheme } from '@/context/ThemeContext';

interface ProfileHeroProps {
  profile: UserProfile;
  completionPercent: number;
  isEditing?: boolean;
  onEditPress?: () => void;
  editDisabled?: boolean;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

export function ProfileHero({
  profile,
  completionPercent,
  isEditing = false,
  onEditPress,
  editDisabled = false,
}: ProfileHeroProps) {
  const { colors, shadows } = useTheme();
  const initials = getInitials(profile.fullName);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          borderRadius: BorderRadius.xxl,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: colors.accentPeach,
          ...shadows.card,
        },
        decorLarge: {
          position: 'absolute',
          width: 140,
          height: 140,
          borderRadius: 70,
          backgroundColor: colors.primaryMuted,
          opacity: 0.18,
          top: -48,
          right: -36,
        },
        decorSmall: {
          position: 'absolute',
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: colors.accentBlue,
          opacity: 0.45,
          bottom: -20,
          left: -16,
        },
        inner: {
          padding: Spacing.lg,
          gap: Spacing.md,
        },
        topRow: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: Spacing.md,
        },
        avatarRing: {
          width: 76,
          height: 76,
          borderRadius: 38,
          padding: 3,
          backgroundColor: colors.glassBorder,
        },
        avatar: {
          flex: 1,
          borderRadius: 35,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.primary,
        },
        avatarText: {
          color: colors.onPrimary,
          fontSize: FontSize.xxl,
          fontWeight: '800',
          letterSpacing: -0.5,
        },
        identity: {
          flex: 1,
          gap: 4,
          minWidth: 0,
          paddingTop: 4,
        },
        name: {
          fontSize: FontSize.xl,
          fontWeight: '800',
          letterSpacing: -0.4,
          color: colors.text,
        },
        email: {
          color: colors.textSecondary,
          fontSize: FontSize.sm,
        },
        memberRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          marginTop: 2,
        },
        memberText: {
          color: colors.textMuted,
          fontSize: FontSize.xs,
        },
        editBtn: {
          width: 42,
          height: 42,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.chipBackgroundStrong,
          borderWidth: 1,
          borderColor: colors.glassBorder,
        },
        editBtnDisabled: {
          opacity: 0.45,
        },
        metaRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
        },
        completionCard: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.md,
          borderRadius: BorderRadius.lg,
          backgroundColor: colors.chipBackground,
          borderWidth: 1,
          borderColor: colors.glassBorder,
        },
        completionTrack: {
          flex: 1,
          height: 6,
          borderRadius: 3,
          backgroundColor: colors.borderLight,
          overflow: 'hidden',
        },
        completionFill: {
          height: '100%',
          borderRadius: 3,
          backgroundColor: colors.primary,
        },
        completionLabel: {
          fontSize: FontSize.xs,
          fontWeight: '700',
          color: colors.primary,
          minWidth: 34,
          textAlign: 'right',
        },
        statusChip: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.md,
          borderRadius: BorderRadius.full,
          backgroundColor: isEditing ? colors.warningSoft : colors.successSoft,
          borderWidth: 1,
          borderColor: isEditing ? colors.warning : colors.successBorder,
        },
        statusText: {
          fontSize: FontSize.xs,
          fontWeight: '700',
          color: isEditing ? colors.warning : colors.success,
        },
        updatedText: {
          color: colors.textMuted,
          fontSize: FontSize.xs,
          marginTop: -4,
        },
      }),
    [colors, shadows, isEditing],
  );

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={[colors.heroGradientStart, colors.heroGradientMid, colors.heroGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.decorLarge} />
      <View style={styles.decorSmall} />

      <View style={styles.inner}>
        <View style={styles.topRow}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar} accessibilityLabel={`Profile avatar for ${profile.fullName}`}>
              <AppText style={styles.avatarText}>{initials}</AppText>
            </View>
          </View>

          <View style={styles.identity}>
            <AppText style={styles.name} numberOfLines={2}>
              {profile.fullName}
            </AppText>
            <AppText style={styles.email} numberOfLines={1}>
              {profile.email}
            </AppText>
            {profile.memberSince ? (
              <View style={styles.memberRow}>
                <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
                <AppText style={styles.memberText}>
                  Member since {formatDateTime(profile.memberSince).split(',')[0]}
                </AppText>
              </View>
            ) : null}
          </View>

          {!isEditing && onEditPress ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
              accessibilityState={{ disabled: editDisabled }}
              disabled={editDisabled}
              onPress={onEditPress}
              style={({ pressed }) => [
                styles.editBtn,
                editDisabled && styles.editBtnDisabled,
                pressed && !editDisabled && { opacity: 0.88 },
              ]}
            >
              <Ionicons name="create-outline" size={20} color={colors.primary} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.metaRow}>
          <View style={styles.completionCard}>
            <Ionicons name="checkmark-done-outline" size={16} color={colors.primary} />
            <View style={{ flex: 1, gap: 4 }}>
              <AppText variant="caption" muted>
                Profile complete
              </AppText>
              <View style={styles.completionTrack}>
                <View style={[styles.completionFill, { width: `${completionPercent}%` }]} />
              </View>
            </View>
            <AppText style={styles.completionLabel}>{completionPercent}%</AppText>
          </View>

          <View style={styles.statusChip}>
            <Ionicons
              name={isEditing ? 'pencil' : 'shield-checkmark'}
              size={14}
              color={isEditing ? colors.warning : colors.success}
            />
            <AppText style={styles.statusText}>{isEditing ? 'Editing' : 'Active'}</AppText>
          </View>
        </View>

        {profile.updatedAt && !isEditing ? (
          <AppText style={styles.updatedText}>
            Last updated {formatDateTime(profile.updatedAt)}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}
