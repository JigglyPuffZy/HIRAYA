import {
  COMORBIDITY_CONFIG,
  DISEASE_RISK_CONFIG,
  HeatSensitiveConditionId,
} from '@/constants/health-vulnerability';
import {
  environmentalLevelFromHeatIndex,
  escalateLevel,
  HUMIDITY_BUMP_THRESHOLD,
  RISK_LEVEL_ORDER,
  VULNERABILITY_ESCALATION_THRESHOLDS,
  VULNERABILITY_POINTS,
} from '@/config/risk-assessment.config';
import { VulnerabilityInput, HeatRiskAssessmentResult } from '@/types/riskAssessment';
import { RiskLevelCategory, formatRiskLevelPhrase } from '@/constants/riskLevels';
import { parseHealthConditions } from '@/utils/healthConditions';

function normalizeActivity(value?: string): 'low' | 'moderate' | 'high' | null {
  const key = value?.toLowerCase().trim();
  if (!key) return null;
  if (key === 'a' || key === 'low') return 'low';
  if (key === 'b' || key === 'moderate') return 'moderate';
  if (key === 'c' || key === 'high') return 'high';
  return null;
}

function normalizeHydration(
  value?: string | boolean,
): 'well' | 'moderate' | 'dehydrated' | null {
  if (typeof value === 'boolean') {
    return value ? 'well' : 'dehydrated';
  }

  const key = value?.toLowerCase().trim();
  if (!key) return null;
  if (key === 'well_hydrated' || key === 'well') return 'well';
  if (key === 'moderate') return 'moderate';
  if (key === 'dehydrated') return 'dehydrated';
  return null;
}

function normalizeGeneralStatus(
  value?: string,
): 'well' | 'mild' | 'not_well' | null {
  const key = value?.toLowerCase().trim();
  if (!key) return null;
  if (key === 'feeling_well' || key === 'well') return 'well';
  if (key === 'mild_discomfort' || key === 'mild') return 'mild';
  if (key === 'not_feeling_well' || key === 'not_well') return 'not_well';
  return null;
}

function resolveHealthConditions(input: VulnerabilityInput): HeatSensitiveConditionId[] {
  if (input.healthConditions?.length) {
    return input.healthConditions;
  }

  return parseHealthConditions(input.healthCondition);
}

function environmentalRiskFactorHits(
  conditionId: HeatSensitiveConditionId,
  heatIndexC: number,
  humidity: number,
  activity: ReturnType<typeof normalizeActivity>,
  hydration: ReturnType<typeof normalizeHydration>,
): string[] {
  const config = DISEASE_RISK_CONFIG[conditionId];
  const hits: string[] = [];
  const envLevel = environmentalLevelFromHeatIndex(heatIndexC);
  const isHot = RISK_LEVEL_ORDER.indexOf(envLevel) >= 2;

  for (const factor of config.riskFactors) {
    if (factor === 'high_heat_index' && isHot) {
      hits.push('high heat index');
    }
    if (factor === 'high_humidity' && humidity >= HUMIDITY_BUMP_THRESHOLD) {
      hits.push('high humidity');
    }
    if (factor === 'physical_exertion' && (activity === 'moderate' || activity === 'high')) {
      hits.push('physical activity');
    }
    if (factor === 'dehydration' && hydration === 'dehydrated') {
      hits.push('dehydration');
    }
    if (factor === 'prolonged_heat_exposure' && isHot) {
      hits.push('prolonged heat exposure');
    }
  }

  return hits;
}

function computeVulnerabilityScore(
  input: VulnerabilityInput,
  heatIndexC: number,
  humidity: number,
): {
  score: number;
  factors: string[];
  conditions: HeatSensitiveConditionId[];
} {
  let score = 0;
  const factors: string[] = [];
  const conditions = resolveHealthConditions(input);
  const activity = normalizeActivity(input.activityLevel);
  const hydration = normalizeHydration(input.hydration);

  if (typeof input.age === 'number' && Number.isFinite(input.age)) {
    if (input.age <= 12) {
      score += VULNERABILITY_POINTS.childAge;
      factors.push('Age 12 or younger');
    } else if (input.age >= 60) {
      score += VULNERABILITY_POINTS.elderlyAge;
      factors.push('Age 60 or older');
    }
  }

  for (const conditionId of conditions) {
    const config = DISEASE_RISK_CONFIG[conditionId];
    score += config.vulnerabilityWeight;
    factors.push(config.label);

    const envHits = environmentalRiskFactorHits(
      conditionId,
      heatIndexC,
      humidity,
      activity,
      hydration,
    );
    for (const hit of envHits) {
      const label = `${hit} (relevant to ${config.label})`;
      if (!factors.includes(label)) {
        factors.push(label);
      }
    }
  }

  if (conditions.length >= 3) {
    score += COMORBIDITY_CONFIG.threeOrMoreBonus;
    factors.push('Multiple heat-sensitive conditions (3+)');
  } else if (conditions.length >= 2) {
    score += COMORBIDITY_CONFIG.multiConditionBonus;
    factors.push('Multiple heat-sensitive conditions');
  }

  if (activity === 'moderate') {
    score += VULNERABILITY_POINTS.activityModerate;
    factors.push('Moderate activity level');
  } else if (activity === 'high') {
    score += VULNERABILITY_POINTS.activityHigh;
    factors.push('High activity level');
  }

  if (hydration === 'moderate') {
    score += VULNERABILITY_POINTS.hydrationModerate;
    factors.push('Moderate hydration');
  } else if (hydration === 'dehydrated') {
    score += VULNERABILITY_POINTS.hydrationDehydrated;
    factors.push('Dehydrated');
  }

  const general = normalizeGeneralStatus(input.generalStatus);
  if (general === 'mild') {
    score += VULNERABILITY_POINTS.generalMildDiscomfort;
    factors.push('Mild discomfort reported');
  } else if (general === 'not_well') {
    score += VULNERABILITY_POINTS.generalNotWell;
    factors.push('Not feeling well');
  }

  return { score, factors, conditions };
}

function resolvePersonalEscalationSteps(
  vulnerabilityScore: number,
  conditions: HeatSensitiveConditionId[],
): number {
  const hasSevereCondition = conditions.some(
    (id) => DISEASE_RISK_CONFIG[id].heatVulnerability === 'severe',
  );

  for (const threshold of VULNERABILITY_ESCALATION_THRESHOLDS) {
    if (vulnerabilityScore >= threshold.minScore) {
      if ('requiresSevereCondition' in threshold && threshold.requiresSevereCondition && !hasSevereCondition) {
        return Math.min(threshold.steps, 1);
      }
      return threshold.steps;
    }
  }

  return 0;
}

function applyHumidityBump(
  level: RiskLevelCategory,
  _humidity: number,
): RiskLevelCategory {
  // Heat index already embeds relative humidity (PAGASA / NOAA formula).
  // Do not escalate the official HI band a second time from RH alone.
  return level;
}

function applyCriticalOverrides(
  level: RiskLevelCategory,
  input: VulnerabilityInput,
  environmentalLevel: RiskLevelCategory,
  vulnerabilityScore: number,
  conditions: HeatSensitiveConditionId[],
): RiskLevelCategory {
  const hydration = normalizeHydration(input.hydration);
  const activity = normalizeActivity(input.activityLevel);
  const general = normalizeGeneralStatus(input.generalStatus);
  const hasSevereCondition = conditions.some(
    (id) => DISEASE_RISK_CONFIG[id].heatVulnerability === 'severe',
  );
  const hasHighTierCondition = conditions.some(
    (id) => DISEASE_RISK_CONFIG[id].heatVulnerability === 'high',
  );
  const isDangerousEnvironment = environmentalLevel === 'EXTREME';
  const isHighEnvironment = RISK_LEVEL_ORDER.indexOf(environmentalLevel) >= 2;
  const isCautionOrAbove = RISK_LEVEL_ORDER.indexOf(environmentalLevel) >= 1;
  const isElderly =
    typeof input.age === 'number' && Number.isFinite(input.age) && input.age >= 60;

  // Severe sakit (heart / kidney / COPD) in hot weather → at least HIGH
  if (hasSevereCondition && isHighEnvironment) {
    level = RISK_LEVEL_ORDER.indexOf(level) < RISK_LEVEL_ORDER.indexOf('HIGH')
      ? 'HIGH'
      : level;
  }

  // Severe sakit + extreme heat or high heat with dehydration/high activity → EXTREME
  if (
    hasSevereCondition &&
    (isDangerousEnvironment ||
      (isHighEnvironment && (hydration === 'dehydrated' || activity === 'high')))
  ) {
    return 'EXTREME';
  }

  // High-tier sakit (asthma, hypertension, diabetes, …) in hot weather → at least HIGH
  if (hasHighTierCondition && isHighEnvironment) {
    level = RISK_LEVEL_ORDER.indexOf(level) < RISK_LEVEL_ORDER.indexOf('HIGH')
      ? 'HIGH'
      : level;
  }

  if (
    hydration === 'dehydrated' &&
    RISK_LEVEL_ORDER.indexOf(level) >= RISK_LEVEL_ORDER.indexOf('HIGH')
  ) {
    return 'EXTREME';
  }

  if (activity === 'high' && hasSevereCondition && isDangerousEnvironment) {
    return 'EXTREME';
  }

  if (isElderly && conditions.length > 0 && isHighEnvironment) {
    level = escalateLevel(level, 1);
  }

  if (general === 'not_well' && isHighEnvironment) {
    level = escalateLevel(level, 1);
  }

  // Multiple sakit amplify risk toward HIGH / EXTREME
  if (conditions.length >= 2 && isCautionOrAbove) {
    level = RISK_LEVEL_ORDER.indexOf(level) < RISK_LEVEL_ORDER.indexOf('HIGH')
      ? 'HIGH'
      : level;
  }

  if (conditions.length >= 2 && isHighEnvironment && (hasSevereCondition || vulnerabilityScore >= 35)) {
    return 'EXTREME';
  }

  if (conditions.length >= 3 && isHighEnvironment) {
    return 'EXTREME';
  }

  return level;
}

function scoreFromLevel(
  level: RiskLevelCategory,
  vulnerabilityScore: number,
  heatIndexC: number,
): number {
  const anchors: Record<RiskLevelCategory, number> = {
    LOW: 15,
    MODERATE: 38,
    HIGH: 62,
    EXTREME: 82,
    UNKNOWN: 38,
  };

  const anchor = anchors[level] ?? 38;
  const vulnBonus = Math.min(12, Math.round(vulnerabilityScore * 0.2));
  const heatBonus = Math.min(
    6,
    Math.max(0, Math.round((heatIndexC - 27) * 0.12)),
  );

  return Math.min(99, Math.max(5, anchor + vulnBonus + heatBonus));
}

function recommendedActionFor(level: RiskLevelCategory): string {
  switch (level) {
    case 'LOW':
      return 'Stay hydrated and monitor how you feel during outdoor activity.';
    case 'MODERATE':
      return 'Limit strenuous activity, take breaks in shade, and drink water regularly.';
    case 'HIGH':
      return 'Avoid prolonged sun exposure, rest often, and seek cooler areas.';
    case 'EXTREME':
      return 'Stay indoors if possible, hydrate immediately, and seek medical help if symptoms worsen.';
    default:
      return 'Monitor conditions and follow local heat safety guidance.';
  }
}

function buildRiskExplanation(
  level: RiskLevelCategory,
  environmentalLevel: RiskLevelCategory,
  factors: string[],
): string {
  const envPhrase = formatRiskLevelPhrase(environmentalLevel);
  const levelPhrase = formatRiskLevelPhrase(level);

  if (factors.length === 0) {
    return `Current heat index indicates ${envPhrase} environmental exposure with no additional personal risk factors identified.`;
  }

  return `Your ${levelPhrase} heat risk reflects ${envPhrase} environmental conditions combined with your personal vulnerability factors.`;
}

export function assessHeatRisk(input: {
  heatIndexC: number;
  humidity: number;
  vulnerability: VulnerabilityInput;
}): HeatRiskAssessmentResult {
  const assessedAt = new Date().toISOString();
  let environmentalLevel = environmentalLevelFromHeatIndex(input.heatIndexC);
  environmentalLevel = applyHumidityBump(environmentalLevel, input.humidity);

  const { score: vulnerabilityScore, factors, conditions } = computeVulnerabilityScore(
    input.vulnerability,
    input.heatIndexC,
    input.humidity,
  );

  let level = environmentalLevel;
  level = escalateLevel(level, resolvePersonalEscalationSteps(vulnerabilityScore, conditions));

  level = applyCriticalOverrides(
    level,
    input.vulnerability,
    environmentalLevel,
    vulnerabilityScore,
    conditions,
  );

  const riskScore = scoreFromLevel(level, vulnerabilityScore, input.heatIndexC);
  const reason = buildRiskExplanation(level, environmentalLevel, factors);

  const primaryRiskFactors: string[] = [];
  if (RISK_LEVEL_ORDER.indexOf(environmentalLevel) >= 2) {
    primaryRiskFactors.push('High heat index');
  } else if (environmentalLevel === 'MODERATE') {
    primaryRiskFactors.push('Elevated heat index');
  }

  for (const factor of factors) {
    if (!primaryRiskFactors.includes(factor)) {
      primaryRiskFactors.push(factor);
    }
  }

  return {
    level,
    riskScore,
    environmentalLevel,
    vulnerabilityScore,
    primaryRiskFactors,
    reason,
    recommendedAction: recommendedActionFor(level),
    heatIndexC: input.heatIndexC,
    assessedAt,
    healthConditions: conditions,
  };
}
