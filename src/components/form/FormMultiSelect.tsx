import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { FormField, FormFieldProps } from '@/components/form/FormField';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface MultiSelectOption {
  label: string;
  value: string;
}

interface FormMultiSelectProps extends Omit<FormFieldProps, 'children'> {
  values: string[];
  options: MultiSelectOption[];
  onValuesChange: (values: string[]) => void;
}

export function FormMultiSelect({
  values,
  options,
  onValuesChange,
  ...fieldProps
}: FormMultiSelectProps) {
  const { colors } = useTheme();

  const toggle = (optionValue: string) => {
    const selected = new Set(values);
    if (selected.has(optionValue)) {
      selected.delete(optionValue);
    } else {
      selected.add(optionValue);
    }
    onValuesChange([...selected]);
  };

  return (
    <FormField {...fieldProps}>
      <View style={styles.list}>
        {options.map((option) => {
          const isSelected = values.includes(option.value);
          return (
            <Pressable
              key={option.value}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={option.label}
              onPress={() => toggle(option.value)}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: isSelected ? colors.primarySoft : colors.surfaceMuted,
                  borderColor: isSelected ? colors.primary : colors.borderLight,
                },
                pressed && styles.pressed,
              ]}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                {isSelected ? (
                  <Ionicons name="checkmark" size={14} color={colors.onPrimary} />
                ) : null}
              </View>
              <AppText variant="body" style={{ color: colors.text, flex: 1 }}>
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </FormField>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.88,
  },
});
