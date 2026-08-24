export type ProfileFieldType =
  | 'text'
  | 'numeric'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'toggle';

export interface ProfileFieldOption {
  label: string;
  value: string;
}

interface BaseProfileFieldDefinition {
  id: string;
  label: string;
  required?: boolean;
  helperText?: string;
}

export interface ProfileTextFieldDefinition extends BaseProfileFieldDefinition {
  type: 'text';
  placeholder?: string;
  multiline?: boolean;
}

export interface ProfileNumericFieldDefinition extends BaseProfileFieldDefinition {
  type: 'numeric';
  placeholder?: string;
  min?: number;
  max?: number;
  allowDecimal?: boolean;
}

export interface ProfileSelectFieldDefinition extends BaseProfileFieldDefinition {
  type: 'select';
  options: ProfileFieldOption[];
  placeholder?: string;
}

export interface ProfileMultiSelectFieldDefinition extends BaseProfileFieldDefinition {
  type: 'multiselect';
  options: ProfileFieldOption[];
  helperText?: string;
}

export interface ProfileRadioFieldDefinition extends BaseProfileFieldDefinition {
  type: 'radio';
  options: ProfileFieldOption[];
}

export interface ProfileToggleFieldDefinition extends BaseProfileFieldDefinition {
  type: 'toggle';
  defaultValue?: boolean;
}

export type ProfileFieldDefinition =
  | ProfileTextFieldDefinition
  | ProfileNumericFieldDefinition
  | ProfileSelectFieldDefinition
  | ProfileMultiSelectFieldDefinition
  | ProfileRadioFieldDefinition
  | ProfileToggleFieldDefinition;

export type ProfileFieldValues = Record<string, string | number | boolean | string[]>;
export type ProfileFormValues = Record<string, string | boolean | string[]>;

/**
 * Account metadata associated with the signed-in user.
 */
export interface UserAccountInfo {
  userId: string;
  email: string;
  fullName: string;
  memberSince?: string;
}

/**
 * Research-approved profile information stored for a user.
 */
export interface UserProfile {
  userId: string;
  email: string;
  fullName: string;
  memberSince?: string;
  fields: ProfileFieldValues;
  updatedAt: string | null;
}

export interface StoredUserProfile {
  fields: ProfileFieldValues;
  updatedAt: string;
}

export interface ProfileValidationResult {
  isValid: boolean;
  fieldErrors: Record<string, string>;
  values?: ProfileFieldValues;
}

export class ProfileServiceError extends Error {
  constructor(
    message: string,
    public code:
      | 'NOT_FOUND'
      | 'VALIDATION_ERROR'
      | 'STORAGE_ERROR'
      | 'NETWORK_ERROR'
      | 'SYNC_ERROR',
    public fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ProfileServiceError';
  }
}

export type ProfileSaveState = 'idle' | 'loading' | 'saving' | 'success' | 'error';
