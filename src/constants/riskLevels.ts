/**
 * Visual styling and display labels for risk levels.
 * Environmental bands follow PAGASA heat-index classifications
 * (Caution / Extreme Caution / Danger / Extreme Danger).
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

  if (normalized.includes('LOW') || normalized.includes('MINIMAL') || normalized.includes('NORMAL')) {
    return 'LOW';
  }

  if (normalized.includes('CAUTION') && !normalized.includes('EXTREME')) {
    return 'MODERATE';
  }

  if (normalized.includes('DANGER')) {
    return 'EXTREME';
  }

  return 'UNKNOWN';
}

export function getRiskLevelVisualStyle(
  riskLevel: string,
): RiskLevelVisualStyle {
  const category = resolveRiskLevelCategory(riskLevel);
  return RISK_LEVEL_VISUALS[category];
}

/** Full label for banners and explanations (Title Case). */
const RISK_LEVEL_LABELS: Record<RiskLevelCategory, string> = {
  LOW: 'Normal',
  MODERATE: 'Caution',
  HIGH: 'Extreme Caution',
  EXTREME: 'Danger',
  UNKNOWN: 'Unknown',
};

/** Compact badge text that fits narrow history chips. */
const RISK_LEVEL_BADGES: Record<RiskLevelCategory, string> = {
  LOW: 'Normal',
  MODERATE: 'Caution',
  HIGH: 'Ext. Caution',
  EXTREME: 'Danger',
  UNKNOWN: 'Unknown',
};

const RISK_LEVEL_SUMMARIES: Record<RiskLevelCategory, string> = {
  LOW: 'Below the PAGASA caution range. Stay hydrated as usual.',
  MODERATE: 'PAGASA Caution (27-32 C). Rest in shade and drink water often.',
  HIGH: 'PAGASA Extreme Caution (33-41 C). Limit outdoor activity and cool down often.',
  EXTREME: 'PAGASA Danger (42 C+). Avoid prolonged heat and seek cooler shelter.',
  UNKNOWN: 'Complete an assessment to see your personalized risk level.',
};

export function formatRiskLevelLabel(riskLevel: string): string {
  return RISK_LEVEL_LABELS[resolveRiskLevelCategory(riskLevel)];
}

export function formatRiskLevelTitle(riskLevel: string): string {
  return RISK_LEVEL_LABELS[resolveRiskLevelCategory(riskLevel)];
}

export function formatRiskLevelBadge(riskLevel: string): string {
  return RISK_LEVEL_BADGES[resolveRiskLevelCategory(riskLevel)];
}

export function formatRiskLevelSummary(riskLevel: string): string {
  return RISK_LEVEL_SUMMARIES[resolveRiskLevelCategory(riskLevel)];
}

/** Friendly phrase for sentences (e.g. "extreme caution"). */
export function formatRiskLevelPhrase(riskLevel: string): string {
  return formatRiskLevelLabel(riskLevel).toLowerCase();
}
