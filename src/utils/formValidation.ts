import {
  AssessmentFieldDefinition,
  AssessmentFormValues,
  ValidatedAssessmentValues,
} from '@/types/assessment';

export interface FormValidationResult {
  isValid: boolean;
  fieldErrors: Record<string, string>;
  values?: ValidatedAssessmentValues;
}

const isEmpty = (value: string | boolean | undefined): boolean => {
  if (typeof value === 'boolean') {
    return false;
  }

  return value === undefined || value.trim().length === 0;
};

const parseNumericValue = (
  rawValue: string,
  allowDecimal: boolean,
): number | null => {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return null;
  }

  const pattern = allowDecimal ? /^-?\d+(\.\d+)?$/ : /^-?\d+$/;
  if (!pattern.test(trimmed)) {
    return null;
  }

  const parsed = allowDecimal ? Number.parseFloat(trimmed) : Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : null;
};

export function validateAssessmentForm(
  values: AssessmentFormValues,
  fields: AssessmentFieldDefinition[],
): FormValidationResult {
  const fieldErrors: Record<string, string> = {};
  const userInputs: Record<string, string | number | boolean> = {};

  for (const field of fields) {
    const rawValue = values[field.id];

    if (field.required && isEmpty(rawValue)) {
      fieldErrors[field.id] = `${field.label} is required.`;
      continue;
    }

    if (isEmpty(rawValue)) {
      continue;
    }

    switch (field.type) {
      case 'text': {
        userInputs[field.id] = String(rawValue).trim();
        break;
      }
      case 'numeric': {
        const parsed = parseNumericValue(
          String(rawValue),
          field.allowDecimal ?? false,
        );

        if (parsed === null) {
          fieldErrors[field.id] = `${field.label} must be a valid number.`;
          break;
        }

        if (field.min !== undefined && parsed < field.min) {
          fieldErrors[field.id] = `${field.label} must be at least ${field.min}.`;
          break;
        }

        if (field.max !== undefined && parsed > field.max) {
          fieldErrors[field.id] = `${field.label} must be at most ${field.max}.`;
          break;
        }

        userInputs[field.id] = parsed;
        break;
      }
      case 'select':
      case 'radio': {
        const selected = String(rawValue);
        const isAllowed = field.options.some(
          (option) => option.value === selected,
        );

        if (!isAllowed) {
          fieldErrors[field.id] = `${field.label} has an invalid selection.`;
          break;
        }

        userInputs[field.id] = selected;
        break;
      }
      case 'toggle': {
        userInputs[field.id] = Boolean(rawValue);
        break;
      }
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { isValid: false, fieldErrors };
  }

  return {
    isValid: true,
    fieldErrors,
    values: { userInputs },
  };
}

export function createInitialFormValues(
  fields: AssessmentFieldDefinition[],
): AssessmentFormValues {
  return fields.reduce<AssessmentFormValues>((accumulator, field) => {
    if (field.type === 'toggle') {
      accumulator[field.id] = field.defaultValue ?? false;
      return accumulator;
    }

    accumulator[field.id] = '';
    return accumulator;
  }, {});
}
