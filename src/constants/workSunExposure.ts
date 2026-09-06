export type OccupationType = 'indoor' | 'outdoor' | 'mixed' | 'student' | 'other';

export type TimeInSunLevel =
  | 'none'
  | 'under_30min'
  | '30min_1h'
  | '1_3h'
  | 'over_3h';

export const OCCUPATION_OPTIONS: { label: string; value: OccupationType }[] = [
  { label: 'Indoor / office work', value: 'indoor' },
  { label: 'Outdoor work (field, construction, delivery, etc.)', value: 'outdoor' },
  { label: 'Mixed indoor & outdoor', value: 'mixed' },
  { label: 'Student', value: 'student' },
  { label: 'Other / not currently working', value: 'other' },
];

export const TIME_IN_SUN_OPTIONS: { label: string; value: TimeInSunLevel }[] = [
  { label: 'None / mostly indoors', value: 'none' },
  { label: 'Less than 30 minutes', value: 'under_30min' },
  { label: '30 minutes to 1 hour', value: '30min_1h' },
  { label: '1 to 3 hours', value: '1_3h' },
  { label: 'More than 3 hours', value: 'over_3h' },
];

export const TYPICAL_SUN_EXPOSURE_OPTIONS: { label: string; value: TimeInSunLevel }[] = [
  { label: 'Usually none / mostly indoors', value: 'none' },
  { label: 'Usually under 30 minutes per day', value: 'under_30min' },
  { label: 'Usually 30 minutes to 1 hour', value: '30min_1h' },
  { label: 'Usually 1 to 3 hours', value: '1_3h' },
  { label: 'Usually more than 3 hours', value: 'over_3h' },
];

export function formatOccupationLabel(value?: string): string {
  const match = OCCUPATION_OPTIONS.find((option) => option.value === value);
  return match?.label ?? 'Not specified';
}

export function formatTimeInSunLabel(value?: string): string {
  const match = TIME_IN_SUN_OPTIONS.find((option) => option.value === value);
  return match?.label ?? 'Not specified';
}
