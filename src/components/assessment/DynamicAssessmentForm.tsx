import { StyleSheet, View } from 'react-native';
import {
  AssessmentFieldDefinition,
  AssessmentFormValues,
  AssessmentSubmissionStep,
} from '@/types/assessment';
import { FormTextInput } from '@/components/form/FormTextInput';
import { FormNumericInput } from '@/components/form/FormNumericInput';
import { FormSelect } from '@/components/form/FormSelect';
import { FormRadioGroup } from '@/components/form/FormRadioGroup';
import { FormToggle } from '@/components/form/FormToggle';
import { ValidationMessage } from '@/components/form/FormField';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { SubmissionProgress } from '@/components/assessment/SubmissionProgress';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { AppText } from '@/components/ui/AppText';
import { Spacing } from '@/constants/theme';

interface DynamicAssessmentFormProps {
  fields: AssessmentFieldDefinition[];
  values: AssessmentFormValues;
  fieldErrors: Record<string, string>;
  formError: string | null;
  submissionError: string | null;
  isSubmitting: boolean;
  submissionStep: AssessmentSubmissionStep;
  hasConfiguredFields: boolean;
  onFieldChange: (fieldId: string, value: string | boolean) => void;
  onSubmit: () => void;
  onDismissSubmissionError: () => void;
}

const STEP_MESSAGES: Record<AssessmentSubmissionStep, string> = {
  idle: '',
  validating: 'Checking your answers...',
  fetching_weather: 'Loading weather...',
  submitting: 'Calculating your heat risk...',
  complete: 'Done.',
};

export function DynamicAssessmentForm({
  fields,
  values,
  fieldErrors,
  formError,
  submissionError,
  isSubmitting,
  submissionStep,
  hasConfiguredFields,
  onFieldChange,
  onSubmit,
}: DynamicAssessmentFormProps) {
  return (
    <View style={styles.form}>
      {!hasConfiguredFields ? (
        <Card variant="outline" style={styles.noticeCard}>
          <AppText variant="subtitle">Fields not configured</AppText>
          <AppText variant="body" muted>
            Research-approved input fields have not been added yet.
          </AppText>
        </Card>
      ) : null}

      <Card style={styles.fieldsCard}>
        <SectionHeader
          title="Today's check-in"
          subtitle="Answer a few questions about how you feel"
          icon="create-outline"
        />

        {fields.map((field) => {
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
        })}
      </Card>

      {formError ? <ValidationMessage message={formError} /> : null}
      {submissionError ? <ErrorMessage message={submissionError} /> : null}

      {isSubmitting && submissionStep !== 'idle' ? (
        <SubmissionProgress
          step={submissionStep}
          message={STEP_MESSAGES[submissionStep]}
        />
      ) : null}

      <Button
        title="Assess My Risk"
        onPress={onSubmit}
        loading={isSubmitting}
        disabled={!hasConfiguredFields || isSubmitting}
        fullWidth
        size="lg"
        style={styles.submitButton}
        accessibilityLabel="Assess risk"
        accessibilityHint="Uses live weather and your answers to calculate your risk level"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.md,
  },
  noticeCard: {
    gap: Spacing.sm,
  },
  fieldsCard: {
    gap: Spacing.lg,
  },
  submitButton: {
    marginTop: Spacing.xs,
  },
});
