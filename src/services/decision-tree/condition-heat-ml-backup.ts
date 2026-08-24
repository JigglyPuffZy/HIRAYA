/**
 * On-device ML backup — condition-aware heat risk.
 * Used when Supabase Edge / FastAPI ML is offline.
 * Escalates strongly toward HIGH / EXTREME based on sakit (health conditions).
 */

import {
  DISEASE_RISK_CONFIG,
  HeatSensitiveConditionId,
} from '@/constants/health-vulnerability';
import {
  environmentalLevelFromHeatIndex,
  escalateLevel,
  RISK_LEVEL_ORDER,
} from '@/config/risk-assessment.config';
import { RiskLevelCategory } from '@/constants/riskLevels';
import { VulnerabilityInput } from '@/types/riskAssessment';
import { HeatRiskPrediction } from '@/types/prediction';
import { parseHealthConditions } from '@/utils/healthConditions';
import {
  buildStructuredSafetyRecommendations,
  flattenSafetySections,
} from '@/services/safety-recommendations/safety-recommendation.engine';
import { assessHeatRisk } from '@/services/decision-tree/heat-risk-classifier';

function resolveConditions(input: VulnerabilityInput): HeatSensitiveConditionId[] {
  if (input.healthConditions?.length) {
    return input.healthConditions;
  }
  return parseHealthConditions(input.healthCondition);
}

function isDehydrated(input: VulnerabilityInput): boolean {
  const value = input.hydration;
  if (typeof value === 'boolean') return !value;
  const key = String(value ?? '').toLowerCase();
  return key === 'dehydrated' || key === 'no' || key === 'false';
}

function isHighActivity(input: VulnerabilityInput): boolean {
  const key = String(input.activityLevel ?? '').toLowerCase();
  return key === 'c' || key === 'high' || key === 'heavy';
}

function isElderly(input: VulnerabilityInput): boolean {
  return typeof input.age === 'number' && Number.isFinite(input.age) && input.age >= 60;
}

function isNotWell(input: VulnerabilityInput): boolean {
  const key = String(input.generalStatus ?? '').toLowerCase();
  return key === 'not_feeling_well' || key === 'not_well';
}

/**
 * Disease-driven target level on top of PAGASA heat bands.
 * Severe sakit (heart, kidney, COPD) reach HIGH/EXTREME sooner.
 */
export function resolveConditionDrivenLevel(
  heatIndexC: number,
  humidity: number,
  input: VulnerabilityInput,
): RiskLevelCategory {
  const envLevel = environmentalLevelFromHeatIndex(heatIndexC);
  const conditions = resolveConditions(input);
  const envIndex = RISK_LEVEL_ORDER.indexOf(envLevel);

  if (conditions.length === 0) {
    return envLevel;
  }

  const severe = conditions.filter(
    (id) => DISEASE_RISK_CONFIG[id].heatVulnerability === 'severe',
  );
  const highTier = conditions.filter(
    (id) => DISEASE_RISK_CONFIG[id].heatVulnerability === 'high',
  );

  const hot = envIndex >= 2; // HIGH or EXTREME heat band (≈33°C+)
  const cautionOrAbove = envIndex >= 1; // MODERATE+ (≈27°C+)
  const stressed =
    isDehydrated(input) || isHighActivity(input) || isNotWell(input) || isElderly(input);
  const humid = humidity >= 70;

  let level = envLevel;

  // 1) Any severe condition in hot weather → at least HIGH
  if (severe.length > 0 && hot) {
    level = escalateLevel(level, Math.max(0, 2 - envIndex)); // push toward HIGH
    level = level === 'LOW' || level === 'MODERATE' ? 'HIGH' : level;
  }

  // 2) Severe + (extreme heat OR hot + stress) → EXTREME
  if (
    severe.length > 0 &&
    (envLevel === 'EXTREME' || (hot && stressed) || (hot && humid && severe.length >= 1))
  ) {
    level = 'EXTREME';
  }

  // 3) High-tier sakit (asthma, hypertension, diabetes, …) in hot weather → at least HIGH
  if (highTier.length > 0 && hot) {
    if (RISK_LEVEL_ORDER.indexOf(level) < RISK_LEVEL_ORDER.indexOf('HIGH')) {
      level = 'HIGH';
    }
  }

  // 4) High-tier + stress in hot weather → EXTREME
  if (highTier.length > 0 && hot && (stressed || humid)) {
    level = escalateLevel(level, 1);
  }

  // 5) Multiple conditions amplify risk
  if (conditions.length >= 2 && cautionOrAbove) {
    if (RISK_LEVEL_ORDER.indexOf(level) < RISK_LEVEL_ORDER.indexOf('HIGH')) {
      level = 'HIGH';
    }
  }

  if (conditions.length >= 2 && hot && (severe.length > 0 || stressed)) {
    level = 'EXTREME';
  }

  if (conditions.length >= 3 && hot) {
    level = 'EXTREME';
  }

  // 6) Elderly + any sakit in hot weather
  if (isElderly(input) && conditions.length > 0 && hot) {
    level = escalateLevel(level, 1);
  }

  return level;
}

function levelToProbability(level: RiskLevelCategory): number {
  switch (level) {
    case 'LOW':
      return 0.18;
    case 'MODERATE':
      return 0.42;
    case 'HIGH':
      return 0.72;
    case 'EXTREME':
      return 0.9;
    default:
      return 0.42;
  }
}

/** ML-shaped prediction used when cloud ML is unreachable. */
export function predictConditionAwareBackup(input: {
  heatIndexC: number;
  humidity: number;
  vulnerability: VulnerabilityInput;
  profile?: VulnerabilityInput;
}): HeatRiskPrediction {
  const vulnerability: VulnerabilityInput = {
    ...input.profile,
    ...input.vulnerability,
  };

  const tree = assessHeatRisk({
    heatIndexC: input.heatIndexC,
    humidity: input.humidity,
    vulnerability,
  });

  const conditionLevel = resolveConditionDrivenLevel(
    input.heatIndexC,
    input.humidity,
    vulnerability,
  );

  // Take the higher of tree vs disease-driven backup.
  const finalLevel =
    RISK_LEVEL_ORDER.indexOf(conditionLevel) >= RISK_LEVEL_ORDER.indexOf(tree.level)
      ? conditionLevel
      : tree.level;

  const probability = levelToProbability(finalLevel);
  const structured = buildStructuredSafetyRecommendations({
    assessment: { ...tree, level: finalLevel },
    profile: vulnerability as Record<string, string | number | boolean>,
  });

  const conditionLabels = (tree.healthConditions ?? []).map(
    (id) => DISEASE_RISK_CONFIG[id]?.label ?? id,
  );

  const explanation =
    conditionLabels.length > 0
      ? `On-device backup risk reflects ${finalLevel.toLowerCase()} exposure with health conditions: ${conditionLabels.join(', ')}.`
      : tree.reason;

  return {
    prediction: probability,
    riskLevel: finalLevel,
    model: 'HIRAYA-ConditionBackup',
    modelVersion: '1.0.0',
    timestamp: tree.assessedAt,
    recommendations: flattenSafetySections(structured.sections),
    primaryRiskFactors: tree.primaryRiskFactors,
    riskExplanation: explanation,
    structuredRecommendations: structured.sections,
    healthConditions: tree.healthConditions,
  };
}
