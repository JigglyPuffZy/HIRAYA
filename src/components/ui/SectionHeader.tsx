import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useTheme } from '@/context/ThemeContext';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconVariant?: 'plain' | 'badge';
  actionLabel?: string;
  onAction?: () => void;
  rightSlot?: ReactNode;
}

export function SectionHeader({
  title,
  subtitle,
  icon,
  iconVariant = 'badge',
  actionLabel,
  onAction,
  rightSlot,
}: SectionHeaderProps) {
  const { colors } = useTheme();
  const { font } = useResponsiveLayout();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={[styles.accentBar, { backgroundColor: colors.primary }]} />
        {icon ? (
          iconVariant === 'badge' ? (
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.borderLight,
                },
              ]}
            >
              <Ionicons name={icon} size={17} color={colors.primary} />
            </View>
          ) : (
            <Ionicons name={icon} size={18} color={colors.primary} style={styles.plainIcon} />
          )
        ) : null}
        <View style={styles.text}>
          <AppText
            variant="subtitle"
            style={[
              styles.title,
              { fontSize: font.sectionTitle, lineHeight: Math.round(font.sectionTitle * 1.3) },
            ]}
          >
            {title}
          </AppText>
          {subtitle ? (
            <AppText variant="caption" muted style={styles.subtitle}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
      </View>

      {rightSlot}

      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.action,
            {
              backgroundColor: colors.primarySoft,
              borderColor: colors.accentPeach,
            },
            pressed && styles.pressed,
          ]}
        >
          <AppText variant="label" style={{ color: colors.primaryDark }}>
            {actionLabel}
          </AppText>
          <Ionicons name="chevron-forward" size={14} color={colors.primaryDark} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minWidth: 0,
  },
  accentBar: {
    width: 3,
    height: 36,
    borderRadius: 2,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  plainIcon: {
    marginTop: 1,
  },
  text: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  title: {
    letterSpacing: -0.3,
    fontWeight: '700',
  },
  subtitle: {
    lineHeight: 18,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.75,
  },
});
