import { StyleSheet, Switch, View } from 'react-native';
import { FormField } from '@/components/form/FormField';
import { AppText } from '@/components/ui/AppText';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface FormToggleProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  helperText?: string;
  error?: string;
}

export function FormToggle({
  label,
  value,
  onValueChange,
  helperText,
  error,
}: FormToggleProps) {
  const { colors } = useTheme();

  return (
    <FormField label={label} helperText={helperText} error={error}>
      <View style={styles.row}>
        <AppText variant="body" muted style={styles.stateLabel}>
          {value ? 'Yes' : 'No'}
        </AppText>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.border, true: colors.primaryMuted }}
          thumbColor={value ? colors.primary : colors.surfaceElevated}
          accessibilityLabel={label}
        />
      </View>
    </FormField>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  stateLabel: {
    flex: 1,
  },
});
