import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
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
  const { colors } = useTheme();
  const initials = getInitials(profile.fullName);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          padding: 0,
          overflow: 'hidden',
        },
        stripe: {
          height: 4,
          backgroundColor: colors.primary,
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
        avatar: {
          width: 72,
          height: 72,
          borderRadius: 36,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.accentNavySoft,
          borderWidth: 2,
          borderColor: colors.surface,
        },
        avatarText: {
          color: colors.accentNavy,
          fontSize: FontSize.xl,
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
          width: 40,
          height: 40,
          borderRadius: BorderRadius.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.surfaceMuted,
          borderWidth: 1,
          borderColor: colors.borderLight,
        },
        editBtnDisabled: {
          opacity: 0.45,
        },
        metaRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
          flexWrap: 'wrap',
          paddingTop: Spacing.sm,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
        },
        completionCard: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.md,
          borderRadius: BorderRadius.md,
          backgroundColor: colors.surfaceMuted,
          borderWidth: 1,
          borderColor: colors.borderLight,
          minWidth: 140,
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
          color: colors.primaryDark,
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
        },
      }),
    [colors, isEditing],
  );

  return (
    <Card variant="elevated" padded={false} style={styles.card}>
      <View style={styles.stripe} />
      <View style={styles.inner}>
        <View style={styles.topRow}>
          <View style={styles.avatar} accessibilityLabel={`Profile avatar for ${profile.fullName}`}>
            <AppText style={styles.avatarText}>{initials}</AppText>
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
              <Ionicons name="create-outline" size={18} color={colors.primary} />
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
    </Card>
  );
}
