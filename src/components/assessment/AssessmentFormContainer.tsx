import { DynamicAssessmentForm } from '@/components/assessment/DynamicAssessmentForm';
import {
  ASSESSMENT_FIELD_DEFINITIONS,
  hasAssessmentFieldsConfigured,
} from '@/constants/assessmentFields';
import {
  AssessmentFormValues,
  AssessmentSubmissionStep,
} from '@/types/assessment';
import { RiskResultPayload } from '@/types/prediction';
import { useAssessmentSubmission } from '@/hooks/useAssessmentSubmission';
import { useDynamicAssessmentForm } from '@/hooks/useDynamicAssessmentForm';

interface AssessmentFormContainerProps {
  onSuccess: (result: RiskResultPayload) => void;
}

export function AssessmentFormContainer({
  onSuccess,
}: AssessmentFormContainerProps) {
  const {
    values,
    fieldErrors,
    formError,
    setFieldValue,
    validate,
  } = useDynamicAssessmentForm(ASSESSMENT_FIELD_DEFINITIONS);

  const {
    submitAssessment,
    isSubmitting,
    submissionStep,
    submissionError,
    clearSubmissionError,
  } = useAssessmentSubmission();

  const handleSubmit = async (formValues: AssessmentFormValues) => {
    clearSubmissionError();
    const validation = validate();

    if (!validation.isValid || !validation.values) {
      return;
    }

    try {
      const result = await submitAssessment(validation.values.userInputs);
      onSuccess(result);
    } catch {
      // Error state is handled in the submission hook.
    }
  };

  return (
    <DynamicAssessmentForm
      fields={ASSESSMENT_FIELD_DEFINITIONS}
      values={values}
      fieldErrors={fieldErrors}
      formError={formError}
      submissionError={submissionError}
      isSubmitting={isSubmitting}
      submissionStep={submissionStep}
      hasConfiguredFields={hasAssessmentFieldsConfigured()}
      onFieldChange={setFieldValue}
      onSubmit={() => handleSubmit(values)}
      onDismissSubmissionError={clearSubmissionError}
    />
  );
}
