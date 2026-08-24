import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { FormField } from '@/components/form/FormField';
import { useFormInputStyles } from '@/hooks/useFormInputStyles';

interface FormTextInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  helperText?: string;
  required?: boolean;
  error?: string;
}

export function FormTextInput({
  label,
  value,
  onChangeText,
  helperText,
  required,
  error,
  multiline,
  style,
  ...props
}: FormTextInputProps) {
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
        multiline={multiline}
        placeholderTextColor={inputStyles.placeholderColor}
        style={[
          inputStyles.input,
          multiline && inputStyles.multiline,
          error ? inputStyles.inputError : null,
          style,
        ]}
        accessibilityLabel={label}
        {...props}
      />
    </FormField>
  );
}

const styles = StyleSheet.create({});
