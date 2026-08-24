import { AssessmentFieldDefinition } from '@/types/assessment';

/**
 * Session assessment fields — combined with profile for the decision tree engine.
 */
export const ASSESSMENT_FIELD_DEFINITIONS: AssessmentFieldDefinition[] = [
  {
    id: 'activity_level',
    type: 'select',
    label: 'Current activity level',
    required: true,
    placeholder: 'Select activity level',
    options: [
      { label: 'Low', value: 'low' },
      { label: 'Moderate', value: 'moderate' },
      { label: 'High', value: 'high' },
    ],
  },
  {
    id: 'hydration',
    type: 'select',
    label: 'Hydration today',
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
    label: 'How are you feeling right now?',
    required: true,
    placeholder: 'Select status',
    options: [
      { label: 'Feeling well', value: 'feeling_well' },
      { label: 'Mild discomfort', value: 'mild_discomfort' },
      { label: 'Not feeling well', value: 'not_feeling_well' },
    ],
  },
];

export const hasAssessmentFieldsConfigured = (): boolean =>
  ASSESSMENT_FIELD_DEFINITIONS.length > 0;
