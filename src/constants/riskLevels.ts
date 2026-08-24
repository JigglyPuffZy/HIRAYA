/**
 * Visual styling for risk level categories.
 * These are display-only states — no medical meaning or thresholds are defined here.
 * Approved category definitions will come from the research methodology.
 */
export type RiskLevelCategory =
  | 'LOW'
  | 'MODERATE'
  | 'HIGH'
  | 'EXTREME'
  | 'UNKNOWN';

export interface RiskLevelVisualStyle {
  category: RiskLevelCategory;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
}

export const RISK_LEVEL_VISUALS: Record<RiskLevelCategory, RiskLevelVisualStyle> =
  {
    LOW: {
      category: 'LOW',
      backgroundColor: '#ECFDF5',
      borderColor: '#059669',
      textColor: '#065F46',
      accentColor: '#059669',
    },
    MODERATE: {
      category: 'MODERATE',
      backgroundColor: '#FFFBEB',
      borderColor: '#D97706',
      textColor: '#92400E',
      accentColor: '#D97706',
    },
    HIGH: {
      category: 'HIGH',
      backgroundColor: '#FEF2F2',
      borderColor: '#DC2626',
      textColor: '#991B1B',
      accentColor: '#DC2626',
    },
    EXTREME: {
      category: 'EXTREME',
      backgroundColor: '#450A0A',
      borderColor: '#7F1D1D',
      textColor: '#FFFFFF',
      accentColor: '#FCA5A5',
    },
    UNKNOWN: {
      category: 'UNKNOWN',
      backgroundColor: '#F8FAFC',
      borderColor: '#475569',
      textColor: '#1E293B',
      accentColor: '#475569',
    },
  };

/**
 * Maps a backend-provided risk level label to a visual category for styling.
 * Does not evaluate prediction values or apply clinical thresholds.
 */
export function resolveRiskLevelCategory(
  riskLevel: string,
): RiskLevelCategory {
  const normalized = riskLevel.trim().toUpperCase();

  if (normalized.includes('EXTREME')) {
    return 'EXTREME';
  }

  if (normalized.includes('HIGH') || normalized.includes('SEVERE')) {
    return 'HIGH';
  }

  if (normalized.includes('MODERATE') || normalized.includes('MEDIUM')) {
    return 'MODERATE';
  }

  if (normalized.includes('LOW') || normalized.includes('MINIMAL')) {
    return 'LOW';
  }

  return 'UNKNOWN';
}

export function getRiskLevelVisualStyle(
  riskLevel: string,
): RiskLevelVisualStyle {
  const category = resolveRiskLevelCategory(riskLevel);
  return RISK_LEVEL_VISUALS[category];
}

const RISK_LEVEL_LABELS: Record<RiskLevelCategory, string> = {
  LOW: 'Low Risk',
  MODERATE: 'Moderate Risk',
  HIGH: 'High Risk',
  EXTREME: 'Extreme Risk',
  UNKNOWN: 'Unknown',
};

/** Short headline word for compact UI (dashboard cards). */
const RISK_LEVEL_TITLES: Record<RiskLevelCategory, string> = {
  LOW: 'Low',
  MODERATE: 'Moderate',
  HIGH: 'High',
  EXTREME: 'Extreme',
  UNKNOWN: 'Unknown',
};

const RISK_LEVEL_SUMMARIES: Record<RiskLevelCategory, string> = {
  LOW: 'Conditions look manageable — stay hydrated and take normal precautions.',
  MODERATE: 'Take breaks in the shade and drink water regularly.',
  HIGH: 'Limit outdoor activity and cool down often.',
  EXTREME: 'Avoid prolonged heat exposure and seek cooler shelter immediately.',
  UNKNOWN: 'Complete an assessment to see your personalized risk level.',
};

export function formatRiskLevelLabel(riskLevel: string): string {
  return RISK_LEVEL_LABELS[resolveRiskLevelCategory(riskLevel)];
}

export function formatRiskLevelTitle(riskLevel: string): string {
  return RISK_LEVEL_TITLES[resolveRiskLevelCategory(riskLevel)];
}

export function formatRiskLevelSummary(riskLevel: string): string {
  return RISK_LEVEL_SUMMARIES[resolveRiskLevelCategory(riskLevel)];
}
