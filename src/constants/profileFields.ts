import { HEAT_SENSITIVE_CONDITION_OPTIONS } from '@/constants/health-vulnerability';
import {
  OCCUPATION_OPTIONS,
  TYPICAL_SUN_EXPOSURE_OPTIONS,
} from '@/constants/workSunExposure';
import { ProfileFieldDefinition } from '@/types/userProfile';

/**
 * Profile fields used by the on-device decision tree and ML pipeline for personal vulnerability.
 */
export const PROFILE_FIELD_DEFINITIONS: ProfileFieldDefinition[] = [
  {
    id: 'age',
    type: 'numeric',
    label: 'Age',
    required: true,
    placeholder: 'Enter your age',
    min: 1,
    max: 120,
  },
  {
    id: 'health_conditions',
    type: 'multiselect',
    label: 'Health conditions',
    required: false,
    helperText: 'Select all heat-sensitive conditions that apply to you.',
    options: HEAT_SENSITIVE_CONDITION_OPTIONS.map((option) => ({
      label: option.label,
      value: option.value,
    })),
  },
  {
    id: 'occupation',
    type: 'select',
    label: 'Occupation / work environment',
    required: true,
    placeholder: 'Select occupation',
    helperText: 'Outdoor and mixed roles often face higher heat and sun exposure.',
    options: OCCUPATION_OPTIONS,
  },
  {
    id: 'typical_sun_exposure',
    type: 'select',
    label: 'Typical time in direct sun',
    required: true,
    placeholder: 'Select usual sun exposure',
    helperText: 'Average daily time in direct sunlight for your routine.',
    options: TYPICAL_SUN_EXPOSURE_OPTIONS,
  },
  {
    id: 'activity_level',
    type: 'select',
    label: 'Typical activity level',
    required: true,
    placeholder: 'Select activity level',
    options: [
      { label: 'Low', value: 'low' },
      { label: 'Moderate', value: 'moderate' },
      { label: 'High', value: 'high' },
    ],
  },
  {
    id: 'hydration_status',
    type: 'select',
    label: 'Usual hydration status',
    required: true,
    placeholder: 'Select hydration status',
    options: [
      { label: 'Well hydrated', value: 'well_hydrated' },
      { label: 'Moderate', value: 'moderate' },
      { label: 'Dehydrated', value: 'dehydrated' },
    ],
  },
  {
    id: 'general_status',
    type: 'select',
    label: 'General wellness baseline',
    required: true,
    placeholder: 'Select status',
    options: [
      { label: 'Feeling well', value: 'feeling_well' },
      { label: 'Mild discomfort', value: 'mild_discomfort' },
      { label: 'Not feeling well', value: 'not_feeling_well' },
    ],
  },
];

export const hasProfileFieldsConfigured = (): boolean =>
  PROFILE_FIELD_DEFINITIONS.length > 0;
