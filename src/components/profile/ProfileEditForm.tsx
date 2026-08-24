import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  ProfileFieldDefinition,
  ProfileFormValues,
} from '@/types/userProfile';
import { FormTextInput } from '@/components/form/FormTextInput';
import { FormNumericInput } from '@/components/form/FormNumericInput';
import { FormSelect } from '@/components/form/FormSelect';
import { FormRadioGroup } from '@/components/form/FormRadioGroup';
import { FormToggle } from '@/components/form/FormToggle';
import { FormMultiSelect } from '@/components/form/FormMultiSelect';
import { ValidationMessage } from '@/components/form/FormField';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { BorderRadius, FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface ProfileEditFormProps {
  fields: ProfileFieldDefinition[];
  values: ProfileFormValues;
  fieldErrors: Record<string, string>;
  formError?: string | null;
  onFieldChange: (fieldId: string, value: string | boolean | string[]) => void;
  title?: string;
  subtitle?: string;
  showInfoTip?: boolean;
}

const EDIT_GROUPS: { title: string; icon: keyof typeof Ionicons.glyphMap; ids: string[] }[] = [
  { title: 'Personal', icon: 'person-outline', ids: ['age'] },
  { title: 'Health & vulnerability', icon: 'fitness-outline', ids: ['health_conditions'] },
  {
    title: 'Daily baseline',
    icon: 'sunny-outline',
    ids: ['activity_level', 'hydration_status', 'general_status'],
  },
];

export function ProfileEditForm({
  fields,
  values,
  fieldErrors,
  formError,
  onFieldChange,
  title = 'Edit Health Profile',
  subtitle = 'Updates personalize your risk scores and safety tips',
  showInfoTip = true,
}: ProfileEditFormProps) {
  const { colors } = useTheme();

  const fieldMap = useMemo(
    () => new Map(fields.map((field) => [field.id, field])),
    [fields],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          gap: Spacing.lg,
        },
        group: {
          gap: Spacing.md,
        },
        groupHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.xs,
          paddingBottom: Spacing.xs,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.borderLight,
        },
        groupTitle: {
          fontSize: FontSize.sm,
          fontWeight: '700',
          color: colors.textSecondary,
        },
        groupFields: {
          gap: Spacing.md,
        },
        tipBox: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: Spacing.sm,
          padding: Spacing.md,
          borderRadius: BorderRadius.lg,
          backgroundColor: colors.infoSoft,
          borderWidth: 1,
          borderColor: colors.accentBlue,
        },
        tipText: {
          flex: 1,
          lineHeight: 20,
          color: colors.info,
          fontSize: FontSize.sm,
        },
      }),
    [colors],
  );

  const renderField = (field: ProfileFieldDefinition) => {
    const error = fieldErrors[field.id];
    const commonProps = {
      label: field.label,
      helperText: field.helperText,
      required: field.required,
      error,
    };

    switch (field.type) {
      case 'text':
        return (
          <FormTextInput
            key={field.id}
            {...commonProps}
            value={String(values[field.id] ?? '')}
            onChangeText={(value) => onFieldChange(field.id, value)}
            placeholder={field.placeholder}
            multiline={field.multiline}
          />
        );
      case 'numeric':
        return (
          <FormNumericInput
            key={field.id}
            {...commonProps}
            value={String(values[field.id] ?? '')}
            onChangeText={(value) => onFieldChange(field.id, value)}
            placeholder={field.placeholder}
            allowDecimal={field.allowDecimal}
          />
        );
      case 'select':
        return (
          <FormSelect
            key={field.id}
            {...commonProps}
            value={String(values[field.id] ?? '')}
            options={field.options}
            onValueChange={(value) => onFieldChange(field.id, value)}
            placeholder={field.placeholder}
          />
        );
      case 'multiselect':
        return (
          <FormMultiSelect
            key={field.id}
            {...commonProps}
            values={Array.isArray(values[field.id]) ? (values[field.id] as string[]) : []}
            options={field.options}
            onValuesChange={(next) => onFieldChange(field.id, next)}
          />
        );
      case 'radio':
        return (
          <FormRadioGroup
            key={field.id}
            {...commonProps}
            value={String(values[field.id] ?? '')}
            options={field.options}
            onValueChange={(value) => onFieldChange(field.id, value)}
          />
        );
      case 'toggle':
        return (
          <FormToggle
            key={field.id}
            {...commonProps}
            value={Boolean(values[field.id])}
            onValueChange={(value) => onFieldChange(field.id, value)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card style={styles.card}>
      <SectionHeader
        title={title}
        subtitle={subtitle}
        icon="create-outline"
      />

      {showInfoTip ? (
        <View style={styles.tipBox}>
          <Ionicons name="information-circle-outline" size={18} color={colors.info} />
          <AppText style={styles.tipText}>
            Accurate health details help HIRAYA tailor heat-stroke guidance for your conditions.
          </AppText>
        </View>
      ) : null}

      {fields.length === 0 ? (
        <AppText variant="body" muted>
          No editable profile fields are configured yet.
        </AppText>
      ) : (
        EDIT_GROUPS.map((group) => {
          const groupFields = group.ids
            .map((id) => fieldMap.get(id))
            .filter((field): field is ProfileFieldDefinition => field !== undefined);

          if (groupFields.length === 0) {
            return null;
          }

          return (
            <View key={group.title} style={styles.group}>
              <View style={styles.groupHeader}>
                <Ionicons name={group.icon} size={14} color={colors.textMuted} />
                <AppText style={styles.groupTitle}>{group.title}</AppText>
              </View>
              <View style={styles.groupFields}>
                {groupFields.map((field) => renderField(field))}
              </View>
            </View>
          );
        })
      )}

      {formError ? <ValidationMessage message={formError} /> : null}
    </Card>
  );
}
