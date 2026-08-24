import { ProfileFieldDefinition, ProfileFieldValues } from '@/types/userProfile';

function isFieldFilled(value: ProfileFieldValues[string] | undefined): boolean {
  if (value === undefined || value === null) {
    return false;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (typeof value === 'boolean') {
    return true;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value);
  }
  return value.trim().length > 0;
}

export function getProfileCompletionPercent(
  fields: ProfileFieldDefinition[],
  values: ProfileFieldValues,
): number {
  if (fields.length === 0) {
    return 0;
  }

  const filledCount = fields.filter((field) => isFieldFilled(values[field.id])).length;
  return Math.round((filledCount / fields.length) * 100);
}

/** True when every required research profile field has a value. */
export function isHealthProfileComplete(
  fields: ProfileFieldDefinition[],
  values: ProfileFieldValues,
): boolean {
  const requiredFields = fields.filter((field) => field.required);

  if (requiredFields.length === 0) {
    return true;
  }

  return requiredFields.every((field) => isFieldFilled(values[field.id]));
}
