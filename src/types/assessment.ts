export type AssessmentFieldType =
  | 'text'
  | 'numeric'
  | 'select'
  | 'radio'
  | 'toggle';

export interface FieldOption {
  label: string;
  value: string;
}

interface BaseFieldDefinition {
  /** Unique key used in the submission payload `userInputs` object. */
  id: string;
  label: string;
  required?: boolean;
  helperText?: string;
}

export interface TextFieldDefinition extends BaseFieldDefinition {
  type: 'text';
  placeholder?: string;
  multiline?: boolean;
}

export interface NumericFieldDefinition extends BaseFieldDefinition {
  type: 'numeric';
  placeholder?: string;
  min?: number;
  max?: number;
  allowDecimal?: boolean;
}

export interface SelectFieldDefinition extends BaseFieldDefinition {
  type: 'select';
  options: FieldOption[];
  placeholder?: string;
}

export interface RadioFieldDefinition extends BaseFieldDefinition {
  type: 'radio';
  options: FieldOption[];
}

export interface ToggleFieldDefinition extends BaseFieldDefinition {
  type: 'toggle';
  defaultValue?: boolean;
}

export type AssessmentFieldDefinition =
  | TextFieldDefinition
  | NumericFieldDefinition
  | SelectFieldDefinition
  | RadioFieldDefinition
  | ToggleFieldDefinition;

export type AssessmentFormValues = Record<string, string | boolean>;

export interface ValidatedAssessmentValues {
  userInputs: Record<string, string | number | boolean>;
}

export interface EnvironmentalData {
  location: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  heatIndex: number;
  wbgt: number;
  uvIndex: number;
  windSpeed: number;
  windKph: number;
  windDir: string;
  condition: string;
  description: string;
  capturedAt: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface AssessmentSubmissionPayload {
  userInputs: Record<string, string | number | boolean>;
  environmental: EnvironmentalData;
  submittedAt: string;
}

export type AssessmentErrorCode =
  | 'INVALID_INPUT'
  | 'MISSING_WEATHER'
  | 'NETWORK_FAILURE'
  | 'BACKEND_FAILURE'
  | 'PREDICTION_FAILURE'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'NOT_CONFIGURED'
  | 'NO_FIELDS_CONFIGURED';

export class AssessmentSubmissionError extends Error {
  constructor(
    message: string,
    public code: AssessmentErrorCode,
    public fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'AssessmentSubmissionError';
  }
}

export type AssessmentSubmissionStep =
  | 'idle'
  | 'validating'
  | 'fetching_weather'
  | 'submitting'
  | 'complete';
