/**
 * PAGASA heat-index classifications (°C), adapted from NOAA NWS
 * (as used by DOST-PAGASA / local DRRM advisories):
 *
 * - Caution: 27–32°C
 * - Extreme caution: 33–41°C
 * - Danger: 42–51°C
 * - Extreme danger: ≥52°C
 *
 * App risk levels map 1:1 onto those bands (plus below-caution → LOW).
 * Heat index already includes humidity, so environmental bands are not
 * bumped again by RH alone.
 */
import { RiskLevelCategory } from '@/constants/riskLevels';

export type EnvironmentalRiskLevel = RiskLevelCategory;

export interface PagasaBand {
  maxExclusive?: number;
  minInclusive?: number;
  level: EnvironmentalRiskLevel;
  label: string;
  pagasaLabel: string;
}

export const PAGASA_HEAT_INDEX_BANDS: PagasaBand[] = [
  {
    maxExclusive: 27,
    level: 'LOW',
    label: 'Normal',
    pagasaLabel: 'Below caution (<27 C)',
  },
  {
    minInclusive: 27,
    maxExclusive: 33,
    level: 'MODERATE',
    label: 'Caution',
    pagasaLabel: 'Caution (27-32 C)',
  },
  {
    minInclusive: 33,
    maxExclusive: 42,
    level: 'HIGH',
    label: 'Extreme Caution',
    pagasaLabel: 'Extreme Caution (33-41 C)',
  },
  {
    minInclusive: 42,
    maxExclusive: 52,
    level: 'EXTREME',
    label: 'Danger',
    pagasaLabel: 'Danger (42-51 C)',
  },
  {
    minInclusive: 52,
    level: 'EXTREME',
    label: 'Extreme Danger',
    pagasaLabel: 'Extreme Danger (52 C+)',
  },
];

/** @deprecated Heat index already includes RH; kept for factor messaging only. */
export const HUMIDITY_BUMP_THRESHOLD = 70;

export const VULNERABILITY_POINTS = {
  healthCondition: 15,
  healthConditionSevere: 25,
  childAge: 12,
  elderlyAge: 15,
  activityModerate: 8,
  activityHigh: 16,
  hydrationModerate: 10,
  hydrationDehydrated: 20,
  generalMildDiscomfort: 10,
  generalNotWell: 18,
} as const;

/** Personal risk bump above environmental level (conservative, real-time friendly). */
export const VULNERABILITY_ESCALATION_THRESHOLDS = [
  { minScore: 42, steps: 2, requiresSevereCondition: true },
  { minScore: 26, steps: 1 },
  { minScore: 0, steps: 0 },
] as const;

export const RISK_LEVEL_ORDER: EnvironmentalRiskLevel[] = [
  'LOW',
  'MODERATE',
  'HIGH',
  'EXTREME',
];

export function environmentalLevelFromHeatIndex(
  heatIndexC: number,
): EnvironmentalRiskLevel {
  return getPagasaBandForHeatIndex(heatIndexC).level;
}

export function getPagasaBandForHeatIndex(heatIndexC: number): PagasaBand {
  const value = Number.isFinite(heatIndexC) ? heatIndexC : 0;

  for (const band of PAGASA_HEAT_INDEX_BANDS) {
    const aboveMin =
      band.minInclusive === undefined || value >= band.minInclusive;
    const belowMax =
      band.maxExclusive === undefined || value < band.maxExclusive;

    if (aboveMin && belowMax) {
      return band;
    }
  }

  return PAGASA_HEAT_INDEX_BANDS[PAGASA_HEAT_INDEX_BANDS.length - 1];
}

export function formatPagasaHeatIndexTitle(heatIndexC: number): string {
  return getPagasaBandForHeatIndex(heatIndexC).label;
}

export function formatPagasaHeatIndexSubtitle(heatIndexC: number): string {
  return getPagasaBandForHeatIndex(heatIndexC).pagasaLabel;
}

export function escalateLevel(
  level: EnvironmentalRiskLevel,
  steps: number,
): EnvironmentalRiskLevel {
  const index = RISK_LEVEL_ORDER.indexOf(level);
  if (index < 0) return level;
  return RISK_LEVEL_ORDER[Math.min(index + steps, RISK_LEVEL_ORDER.length - 1)];
}

export function maxRiskLevel(
  a: RiskLevelCategory,
  b: RiskLevelCategory,
): RiskLevelCategory {
  return RISK_LEVEL_ORDER.indexOf(a) >= RISK_LEVEL_ORDER.indexOf(b) ? a : b;
}

/** Decision tree is primary; ML may nudge at most one level when confident. */
export function combineTreeAndMlRiskLevel(
  treeLevel: RiskLevelCategory,
  mlLevel: RiskLevelCategory,
  mlProbability: number,
): RiskLevelCategory {
  const treeIndex = RISK_LEVEL_ORDER.indexOf(treeLevel);
  const mlIndex = RISK_LEVEL_ORDER.indexOf(mlLevel);

  if (mlProbability >= 0.62 && mlIndex > treeIndex) {
    return RISK_LEVEL_ORDER[Math.min(treeIndex + 1, mlIndex)];
  }

  if (mlProbability <= 0.22 && mlIndex < treeIndex) {
    return mlLevel;
  }

  return treeLevel;
}
