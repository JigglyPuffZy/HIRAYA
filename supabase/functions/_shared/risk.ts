export const RISK_THRESHOLDS = {
  LOW: 0.3,
  MODERATE: 0.55,
  HIGH: 0.78,
} as const;

export function scoreToRiskLevel(probability: number): string {
  const score = Math.max(0, Math.min(1, probability));
  if (score < RISK_THRESHOLDS.LOW) return 'LOW';
  if (score < RISK_THRESHOLDS.MODERATE) return 'MODERATE';
  if (score < RISK_THRESHOLDS.HIGH) return 'HIGH';
  return 'EXTREME';
}

export function recommendationsForLevel(riskLevel: string): string[] {
  const mapping: Record<string, string[]> = {
    LOW: [
      'Maintain regular hydration and monitor how you feel during outdoor activity.',
      'Schedule strenuous work during cooler parts of the day when possible.',
    ],
    MODERATE: [
      'Increase fluid intake and take breaks in shaded or cooled areas.',
      'Reduce prolonged exertion while environmental heat remains elevated.',
    ],
    HIGH: [
      'Limit outdoor exertion and seek cooler environments immediately if symptoms appear.',
      'Hydrate frequently and monitor heart rate and body temperature closely.',
    ],
    EXTREME: [
      'Avoid strenuous outdoor activity until conditions improve.',
      'Move to a cooled space, hydrate, and seek professional medical guidance if symptoms worsen.',
    ],
  };
  return mapping[riskLevel] ?? mapping.MODERATE;
}
