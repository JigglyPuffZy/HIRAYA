import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { ProfileFieldValues } from '@/types/userProfile';
import { BorderRadius, FontSize, Spacing } from '@/constants/theme';
import { parseHealthConditions, formatHealthConditionLabels } from '@/utils/healthConditions';
import { useTheme } from '@/context/ThemeContext';

interface ProfileQuickStatsProps {
  fields: ProfileFieldValues;
}

interface StatItem {
  id: string;
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: 'primary' | 'info' | 'warning';
}

function titleCase(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function ProfileQuickStats({ fields }: ProfileQuickStatsProps) {
  const { colors, shadows } = useTheme();

  const conditions = formatHealthConditionLabels(parseHealthConditions(fields.health_conditions));
  const activity = fields.activity_level ? titleCase(String(fields.activity_level)) : '—';
  const age = fields.age !== undefined && fields.age !== '' ? String(fields.age) : '—';

  const stats: StatItem[] = [
    {
      id: 'age',
      label: 'Age',
      value: age === '—' ? age : `${age} yrs`,
      icon: 'calendar-outline',
      tone: 'primary',
    },
    {
      id: 'activity',
      label: 'Activity',
      value: activity,
      icon: 'walk-outline',
      tone: 'info',
    },
    {
      id: 'conditions',
      label: 'Conditions',
      value: conditions.length > 0 ? String(conditions.length) : 'None',
      icon: 'medkit-outline',
      tone: conditions.length > 0 ? 'warning' : 'info',
    },
  ];

  const toneColors = {
    primary: { bg: colors.primarySoft, fg: colors.primary, border: colors.accentPeach },
    info: { bg: colors.infoSoft, fg: colors.info, border: colors.accentBlue },
    warning: { bg: colors.warningSoft, fg: colors.warning, border: colors.accentPeach },
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          gap: Spacing.sm,
        },
        card: {
          flex: 1,
          minWidth: 0,
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.sm,
          borderRadius: BorderRadius.xl,
          borderWidth: 1,
          alignItems: 'center',
          gap: 6,
          ...shadows.sm,
        },
        iconWrap: {
          width: 36,
          height: 36,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
        },
        value: {
          fontSize: FontSize.md,
          fontWeight: '800',
          letterSpacing: -0.3,
          textAlign: 'center',
        },
        label: {
          fontSize: 11,
          fontWeight: '600',
          textAlign: 'center',
        },
      }),
    [shadows],
  );

  return (
    <View style={styles.row} accessibilityLabel="Profile summary stats">
      {stats.map((stat) => {
        const tone = toneColors[stat.tone];
        return (
          <View
            key={stat.id}
            style={[
              styles.card,
              { backgroundColor: tone.bg, borderColor: tone.border },
            ]}
            accessibilityLabel={`${stat.label}: ${stat.value}`}
          >
            <View style={[styles.iconWrap, { backgroundColor: colors.chipBackgroundStrong }]}>
              <Ionicons name={stat.icon} size={18} color={tone.fg} />
            </View>
            <AppText style={[styles.value, { color: colors.text }]} numberOfLines={1}>
              {stat.value}
            </AppText>
            <AppText style={[styles.label, { color: colors.textMuted }]} numberOfLines={1}>
              {stat.label}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}
