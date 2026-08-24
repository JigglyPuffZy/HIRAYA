import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { FormField } from '@/components/form/FormField';
import { AppText } from '@/components/ui/AppText';
import { FieldOption } from '@/types/assessment';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface FormSelectProps {
  label: string;
  value: string;
  options: FieldOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  error?: string;
}

export function FormSelect({
  label,
  value,
  options,
  onValueChange,
  placeholder = 'Select an option',
  helperText,
  required,
  error,
}: FormSelectProps) {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? placeholder;

  return (
    <FormField
      label={label}
      helperText={helperText}
      required={required}
      error={error}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}. ${selectedLabel}`}
        accessibilityHint="Opens option list"
        onPress={() => setIsOpen(true)}
        style={({ pressed }) => [
          styles.trigger,
          {
            borderColor: error ? colors.error : colors.border,
            backgroundColor: colors.inputBackground,
          },
          pressed && styles.pressed,
        ]}
      >
        <AppText variant="body" muted={!value}>
          {selectedLabel}
        </AppText>
        <AppText variant="body" style={{ color: colors.textMuted, fontSize: 12 }}>
          ▼
        </AppText>
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          style={[styles.overlay, { backgroundColor: colors.overlay }]}
          accessibilityLabel="Close option list"
          onPress={() => setIsOpen(false)}
        >
          <View
            style={[
              styles.sheet,
              { backgroundColor: colors.surfaceElevated },
            ]}
          >
            <AppText variant="subtitle" style={styles.sheetTitle}>
              {label}
            </AppText>
            <ScrollView style={styles.optionsList}>
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => {
                      onValueChange(option.value);
                      setIsOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      isSelected && { backgroundColor: colors.primarySoft },
                      pressed && styles.pressed,
                    ]}
                  >
                    <AppText variant="body">{option.label}</AppText>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </FormField>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  pressed: {
    opacity: 0.85,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    padding: Spacing.lg,
    maxHeight: '60%',
  },
  sheetTitle: {
    marginBottom: Spacing.md,
  },
  optionsList: {
    flexGrow: 0,
  },
  option: {
    minHeight: 48,
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
});
