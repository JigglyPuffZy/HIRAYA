import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  ProfileFieldDefinition,
  ProfileFieldValues,
} from '@/types/userProfile';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { BorderRadius, FontSize, Spacing } from '@/constants/theme';
import { formatProfileFieldDisplay } from '@/utils/profileValidation';
import { parseHealthConditions, formatHealthConditionLabels } from '@/utils/healthConditions';
import { useTheme } from '@/context/ThemeContext';

interface ProfileFieldsViewProps {
  fields: ProfileFieldDefinition[];
  values: ProfileFieldValues;
}

const FIELD_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  age: 'calendar-outline',
  health_conditions: 'medkit-outline',
  activity_level: 'walk-outline',
  hydration_status: 'water-outline',
  general_status: 'heart-outline',
};

const FIELD_GROUPS: { title: string; icon: keyof typeof Ionicons.glyphMap; ids: string[] }[] = [
  {
    title: 'Personal',
    icon: 'person-outline',
    ids: ['age'],
  },
  {
    title: 'Health & vulnerability',
    icon: 'fitness-outline',
    ids: ['health_conditions'],
  },
  {
    title: 'Daily baseline',
    icon: 'sunny-outline',
    ids: ['activity_level', 'hydration_status', 'general_status'],
  },
];

function getFieldIcon(fieldId: string): keyof typeof Ionicons.glyphMap {
  return FIELD_ICONS[fieldId] ?? 'ellipse-outline';
}

function FieldValue({
  field,
  value,
}: {
  field: ProfileFieldDefinition;
  value: ProfileFieldValues[string] | undefined;
}) {
  const { colors } = useTheme();

  if (field.id === 'health_conditions') {
    const labels = formatHealthConditionLabels(parseHealthConditions(value));
    if (labels.length === 0) {
      return (
        <AppText variant="body" muted>
          No conditions selected
        </AppText>
      );
    }

    return (
      <View style={styles.chipRow}>
        {labels.map((label) => (
          <View
            key={label}
            style={[styles.chip, { backgroundColor: colors.warningSoft, borderColor: colors.accentPeach }]}
          >
            <AppText variant="caption" style={{ color: colors.warning, fontWeight: '700' }}>
              {label}
            </AppText>
          </View>
        ))}
      </View>
    );
  }

  const display =
    value !== undefined ? formatProfileFieldDisplay(field, value) : 'Not provided';

  return (
    <AppText variant="body" style={styles.valueText}>
      {display}
    </AppText>
  );
}

export function ProfileFieldsView({ fields, values }: ProfileFieldsViewProps) {
  const { colors } = useTheme();

  const fieldMap = useMemo(
    () => new Map(fields.map((field) => [field.id, field])),
    [fields],
  );

  const themed = useMemo(
    () =>
      StyleSheet.create({
        card: {
          gap: Spacing.md,
        },
        group: {
          gap: Spacing.sm,
        },
        groupTitle: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.xs,
          marginTop: Spacing.xs,
        },
        groupLabel: {
          fontSize: FontSize.sm,
          fontWeight: '700',
          color: colors.textSecondary,
          letterSpacing: 0.2,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: Spacing.md,
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.sm,
          borderRadius: BorderRadius.lg,
          backgroundColor: colors.surfaceMuted,
          borderWidth: 1,
          borderColor: colors.borderLight,
        },
        iconWrap: {
          width: 38,
          height: 38,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.primarySoft,
          marginTop: 2,
        },
        rowBody: {
          flex: 1,
          gap: 4,
          minWidth: 0,
        },
        notice: {
          lineHeight: 22,
        },
      }),
    [colors],
  );

  if (fields.length === 0) {
    return (
      <Card style={themed.card} accessibilityLabel="Profile information">
        <SectionHeader title="Health Profile" icon="document-text-outline" />
        <AppText variant="body" muted style={themed.notice}>
          Research-approved profile fields have not been configured yet.
        </AppText>
      </Card>
    );
  }

  return (
    <Card style={themed.card} accessibilityLabel="Profile information">
      <SectionHeader
        title="Health Profile"
        subtitle="Used to personalize your heat-risk assessments"
        icon="document-text-outline"
      />

      {FIELD_GROUPS.map((group) => {
        const groupFields = group.ids
          .map((id) => fieldMap.get(id))
          .filter((field): field is ProfileFieldDefinition => field !== undefined);

        if (groupFields.length === 0) {
          return null;
        }

        return (
          <View key={group.title} style={themed.group}>
            <View style={themed.groupTitle}>
              <Ionicons name={group.icon} size={14} color={colors.textMuted} />
              <AppText style={themed.groupLabel}>{group.title}</AppText>
            </View>

            {groupFields.map((field) => (
              <View
                key={field.id}
                style={themed.row}
                accessibilityLabel={`${field.label}: ${
                  values[field.id] !== undefined
                    ? formatProfileFieldDisplay(field, values[field.id])
                    : 'Not provided'
                }`}
              >
                <View style={themed.iconWrap}>
                  <Ionicons name={getFieldIcon(field.id)} size={18} color={colors.primary} />
                </View>
                <View style={themed.rowBody}>
                  <AppText variant="caption" muted>
                    {field.label}
                  </AppText>
                  <FieldValue field={field} value={values[field.id]} />
                </View>
              </View>
            ))}
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  valueText: {
    fontWeight: '600',
    lineHeight: 22,
  },
});
