import { Pressable, StyleSheet, View } from 'react-native';
import { FormField } from '@/components/form/FormField';
import { AppText } from '@/components/ui/AppText';
import { FieldOption } from '@/types/assessment';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface FormRadioGroupProps {
  label: string;
  value: string;
  options: FieldOption[];
  onValueChange: (value: string) => void;
  helperText?: string;
  required?: boolean;
  error?: string;
}

export function FormRadioGroup({
  label,
  value,
  options,
  onValueChange,
  helperText,
  required,
  error,
}: FormRadioGroupProps) {
  const { colors } = useTheme();

  return (
    <FormField
      label={label}
      helperText={helperText}
      required={required}
      error={error}
    >
      <View
        style={styles.group}
        accessibilityRole="radiogroup"
        accessibilityLabel={label}
      >
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={option.label}
              onPress={() => onValueChange(option.value)}
              style={({ pressed }) => [
                styles.option,
                {
                  borderColor: isSelected ? colors.primary : colors.border,
                  backgroundColor: isSelected ? colors.primarySoft : colors.inputBackground,
                },
                pressed && styles.pressed,
              ]}
            >
              <View
                style={[
                  styles.outer,
                  { borderColor: isSelected ? colors.primary : colors.border },
                ]}
              >
                {isSelected ? (
                  <View style={[styles.inner, { backgroundColor: colors.primary }]} />
                ) : null}
              </View>
              <AppText variant="body">{option.label}</AppText>
            </Pressable>
          );
        })}
      </View>
    </FormField>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: Spacing.sm,
  },
  option: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
  },
  outer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pressed: {
    opacity: 0.85,
  },
});
