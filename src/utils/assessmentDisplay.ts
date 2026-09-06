import { ASSESSMENT_FIELD_DEFINITIONS } from '@/constants/assessmentFields';
import { AssessmentInputData } from '@/types/prediction';

export interface AssessmentDisplayItem {
  key: string;
  label: string;
  value: string;
}

export function formatAssessmentValue(
  value: string | number | boolean | string[],
  fieldId?: string,
): string {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : 'None';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (fieldId) {
    const fieldDefinition = ASSESSMENT_FIELD_DEFINITIONS.find(
      (field) => field.id === fieldId,
    );
    if (fieldDefinition?.type === 'select') {
      const match = fieldDefinition.options.find(
        (option) => option.value === String(value),
      );
      if (match) {
        return match.label;
      }
    }
  }

  return String(value).replace(/_/g, ' ');
}

export function buildAssessmentDisplayItems(
  assessment: AssessmentInputData,
): AssessmentDisplayItem[] {
  return Object.entries(assessment).map(([key, value]) => {
    const fieldDefinition = ASSESSMENT_FIELD_DEFINITIONS.find(
      (field) => field.id === key,
    );

    return {
      key,
      label: fieldDefinition?.label ?? key,
      value: formatAssessmentValue(value, key),
    };
  });
}
