import { useCallback, useMemo, useState } from 'react';
import {
  AssessmentFieldDefinition,
  AssessmentFormValues,
} from '@/types/assessment';
import {
  createInitialFormValues,
  validateAssessmentForm,
} from '@/utils/formValidation';

export function useDynamicAssessmentForm(fields: AssessmentFieldDefinition[]) {
  const initialValues = useMemo(
    () => createInitialFormValues(fields),
    [fields],
  );

  const [values, setValues] = useState<AssessmentFormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const setFieldValue = useCallback((fieldId: string, value: string | boolean) => {
    setValues((current) => ({ ...current, [fieldId]: value }));
    setFieldErrors((current) => {
      if (!current[fieldId]) {
        return current;
      }

      const next = { ...current };
      delete next[fieldId];
      return next;
    });
    setFormError(null);
  }, []);

  const validate = useCallback(() => {
    const result = validateAssessmentForm(values, fields);
    setFieldErrors(result.fieldErrors);

    if (!result.isValid) {
      setFormError('Please correct the highlighted fields before continuing.');
    } else {
      setFormError(null);
    }

    return result;
  }, [fields, values]);

  const reset = useCallback(() => {
    setValues(createInitialFormValues(fields));
    setFieldErrors({});
    setFormError(null);
  }, [fields]);

  return {
    values,
    fieldErrors,
    formError,
    setFieldValue,
    validate,
    reset,
  };
}
