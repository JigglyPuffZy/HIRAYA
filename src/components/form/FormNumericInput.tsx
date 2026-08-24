import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { FormField } from '@/components/form/FormField';
import { useFormInputStyles } from '@/hooks/useFormInputStyles';

interface FormNumericInputProps
  extends Omit<TextInputProps, 'value' | 'onChangeText' | 'keyboardType'> {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  helperText?: string;
  required?: boolean;
  error?: string;
  allowDecimal?: boolean;
}

export function FormNumericInput({
  label,
  value,
  onChangeText,
  helperText,
  required,
  error,
  allowDecimal = false,
  style,
  ...props
}: FormNumericInputProps) {
  const inputStyles = useFormInputStyles(error);

  return (
    <FormField
      label={label}
      helperText={helperText}
      required={required}
      error={error}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={allowDecimal ? 'decimal-pad' : 'numeric'}
        inputMode={allowDecimal ? 'decimal' : 'numeric'}
        placeholderTextColor={inputStyles.placeholderColor}
        style={[inputStyles.input, error ? inputStyles.inputError : null, style]}
        accessibilityLabel={label}
        {...props}
      />
    </FormField>
  );
}
