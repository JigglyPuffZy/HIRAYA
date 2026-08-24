import { PROFILE_FIELD_DEFINITIONS } from '@/constants/profileFields';
import {
  ProfileFieldDefinition,
  ProfileFieldValues,
  ProfileFormValues,
  ProfileValidationResult,
} from '@/types/userProfile';

const isEmpty = (value: string | boolean | string[] | undefined): boolean => {
  if (Array.isArray(value)) {
    return value.length === 0;
  }
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

  const parsed = allowDecimal
    ? Number.parseFloat(trimmed)
    : Number.parseInt(trimmed, 10);

  return Number.isFinite(parsed) ? parsed : null;
};

export function createInitialProfileValues(
  fields: ProfileFieldDefinition[],
): ProfileFormValues {
  return fields.reduce<ProfileFormValues>((accumulator, field) => {
    if (field.type === 'toggle') {
      accumulator[field.id] = field.defaultValue ?? false;
      return accumulator;
    }

    if (field.type === 'multiselect') {
      accumulator[field.id] = [];
      return accumulator;
    }

    accumulator[field.id] = '';
    return accumulator;
  }, {});
}

export function profileValuesToFormValues(
  values: ProfileFieldValues,
  fields: ProfileFieldDefinition[],
): ProfileFormValues {
  const formValues = createInitialProfileValues(fields);

  for (const field of fields) {
    const stored = values[field.id];
    if (stored === undefined) {
      continue;
    }

    if (field.type === 'toggle') {
      formValues[field.id] = Boolean(stored);
    } else if (field.type === 'multiselect') {
      formValues[field.id] = Array.isArray(stored)
        ? stored.map(String)
        : typeof stored === 'string'
          ? stored.split(',').map((part) => part.trim()).filter(Boolean)
          : [];
    } else {
      formValues[field.id] = String(stored);
    }
  }

  return formValues;
}

export function validateProfileForm(
  values: ProfileFormValues,
  fields: ProfileFieldDefinition[],
): ProfileValidationResult {
  const fieldErrors: Record<string, string> = {};
  const parsedValues: ProfileFieldValues = {};

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
      case 'text':
        parsedValues[field.id] = String(rawValue).trim();
        break;
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

        parsedValues[field.id] = parsed;
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

        parsedValues[field.id] = selected;
        break;
      }
      case 'multiselect': {
        const selectedValues = Array.isArray(rawValue)
          ? rawValue.map(String)
          : [];
        const invalid = selectedValues.filter(
          (value) => !field.options.some((option) => option.value === value),
        );

        if (invalid.length > 0) {
          fieldErrors[field.id] = `${field.label} contains invalid selections.`;
          break;
        }

        parsedValues[field.id] = selectedValues;
        break;
      }
      case 'toggle':
        parsedValues[field.id] = Boolean(rawValue);
        break;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { isValid: false, fieldErrors };
  }

  return {
    isValid: true,
    fieldErrors,
    values: parsedValues,
  };
}

export function formatProfileFieldValue(value: string | number | boolean | string[]): string {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : 'None selected';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  return String(value);
}

export function formatProfileFieldDisplay(
  field: ProfileFieldDefinition,
  value: string | number | boolean | string[],
): string {
  if (field.type === 'multiselect' && Array.isArray(value)) {
    if (value.length === 0) {
      return 'None selected';
    }
    return value
      .map((item) => field.options.find((option) => option.value === item)?.label ?? item)
      .join(', ');
  }

  if (field.type === 'select' || field.type === 'radio') {
    const match = field.options.find((option) => option.value === String(value));
    if (match) {
      return match.label;
    }
  }

  const normalized = String(value).replace(/_/g, ' ');
  if (field.type === 'select' || field.type === 'radio') {
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }

  return formatProfileFieldValue(value);
}

export { PROFILE_FIELD_DEFINITIONS };
