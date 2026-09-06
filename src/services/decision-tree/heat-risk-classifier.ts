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
  applyPagasaPersonalizedCeiling,
} from '@/config/risk-assessment.config';
import { VulnerabilityInput, HeatRiskAssessmentResult } from '@/types/riskAssessment';
import { RiskLevelCategory, formatRiskLevelPhrase } from '@/constants/riskLevels';
import { parseHealthConditions } from '@/utils/healthConditions';
import {
  formatOccupationLabel,
  formatTimeInSunLabel,
  OccupationType,
  TimeInSunLevel,
} from '@/constants/workSunExposure';

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

function normalizeOccupation(value?: string): OccupationType | null {
  const key = value?.toLowerCase().trim();
  if (!key) return null;
  if (key === 'indoor' || key === 'office') return 'indoor';
  if (key === 'outdoor') return 'outdoor';
  if (key === 'mixed') return 'mixed';
  if (key === 'student') return 'student';
  if (key === 'other') return 'other';
  return null;
}

function normalizeTimeInSun(value?: string): TimeInSunLevel | null {
  const key = value?.toLowerCase().trim();
  if (!key) return null;
  if (key === 'none') return 'none';
  if (key === 'under_30min' || key === 'under_30') return 'under_30min';
  if (key === '30min_1h' || key === '30_60') return '30min_1h';
  if (key === '1_3h' || key === '1_3') return '1_3h';
  if (key === 'over_3h' || key === '3_plus') return 'over_3h';
  return null;
}

function isProlongedSunExposure(
  occupation: OccupationType | null,
  timeInSun: TimeInSunLevel | null,
): boolean {
  if (!timeInSun || timeInSun === 'none') {
    return false;
  }

  if (timeInSun === '1_3h' || timeInSun === 'over_3h') {
    return true;
  }

  if (occupation === 'outdoor' && timeInSun !== 'under_30min') {
    return true;
  }

  if (occupation === 'mixed' && timeInSun === '30min_1h') {
    return true;
  }

  return false;
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
  occupation: ReturnType<typeof normalizeOccupation>,
  timeInSun: ReturnType<typeof normalizeTimeInSun>,
): string[] {
  const config = DISEASE_RISK_CONFIG[conditionId];
  const hits: string[] = [];
  const envLevel = environmentalLevelFromHeatIndex(heatIndexC);
  const isHot = RISK_LEVEL_ORDER.indexOf(envLevel) >= 2;
  const prolongedSun = isProlongedSunExposure(occupation, timeInSun);

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
    if (factor === 'prolonged_heat_exposure' && isHot && prolongedSun) {
      hits.push('prolonged sun / heat exposure');
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
  const occupation = normalizeOccupation(input.occupation);
  const timeInSun = normalizeTimeInSun(input.timeInSun);

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
      occupation,
      timeInSun,
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

  if (occupation === 'outdoor') {
    score += VULNERABILITY_POINTS.occupationOutdoor;
    factors.push(`Outdoor occupation (${formatOccupationLabel(occupation)})`);
  } else if (occupation === 'mixed') {
    score += VULNERABILITY_POINTS.occupationMixed;
    factors.push(`Mixed indoor/outdoor work (${formatOccupationLabel(occupation)})`);
  } else if (occupation === 'student') {
    score += VULNERABILITY_POINTS.occupationStudent;
    factors.push(`Student (${formatOccupationLabel(occupation)})`);
  }

  if (timeInSun === 'under_30min') {
    score += VULNERABILITY_POINTS.sunUnder30Min;
    factors.push(`Brief sun exposure (${formatTimeInSunLabel(timeInSun)})`);
  } else if (timeInSun === '30min_1h') {
    score += VULNERABILITY_POINTS.sun30MinTo1H;
    factors.push(`Moderate sun exposure (${formatTimeInSunLabel(timeInSun)})`);
  } else if (timeInSun === '1_3h') {
    score += VULNERABILITY_POINTS.sun1To3H;
    factors.push(`Extended sun exposure (${formatTimeInSunLabel(timeInSun)})`);
  } else if (timeInSun === 'over_3h') {
    score += VULNERABILITY_POINTS.sunOver3H;
    factors.push(`Prolonged sun exposure (${formatTimeInSunLabel(timeInSun)})`);
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
  const occupation = normalizeOccupation(input.occupation);
  const timeInSun = normalizeTimeInSun(input.timeInSun);
  const prolongedSun = isProlongedSunExposure(occupation, timeInSun);
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
    level = escalateLevel(level, isDangerousEnvironment ? 2 : 1);
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
    level = escalateLevel(level, 1);
  }

  if (activity === 'high' && hasSevereCondition && isDangerousEnvironment) {
    level = escalateLevel(level, 1);
  }

  if (
    occupation === 'outdoor' &&
    prolongedSun &&
    isHighEnvironment &&
    (activity === 'high' || hydration === 'dehydrated')
  ) {
    level = escalateLevel(level, 1);
  }

  if (occupation === 'outdoor' && timeInSun === 'over_3h' && isCautionOrAbove) {
    level = RISK_LEVEL_ORDER.indexOf(level) < RISK_LEVEL_ORDER.indexOf('HIGH')
      ? 'HIGH'
      : level;
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
    level = escalateLevel(level, 1);
  }

  if (conditions.length >= 3 && isHighEnvironment) {
    level = escalateLevel(level, 1);
  }

  return level;
}

function scoreFromLevel(
  level: RiskLevelCategory,
  vulnerabilityScore: number,
  heatIndexC: number,
): number {
  const bands: Record<RiskLevelCategory, { min: number; max: number }> = {
    LOW: { min: 8, max: 24 },
    MODERATE: { min: 25, max: 44 },
    HIGH: { min: 45, max: 68 },
    EXTREME: { min: 69, max: 92 },
    UNKNOWN: { min: 25, max: 44 },
  };

  const { min, max } = bands[level] ?? bands.UNKNOWN;
  const hi = Number.isFinite(heatIndexC) ? heatIndexC : 27;
  const hiStress = Math.min(1, Math.max(0, (hi - 20) / 35));
  const vulnStress = Math.min(1, Math.max(0, vulnerabilityScore / 85));
  const stress = hiStress * 0.5 + vulnStress * 0.5;

  return Math.round(min + stress * (max - min));
}

/** Public helper — display score (0–100) aligned to risk level + heat index + vulnerability. */
export function computeRiskDisplayScore(
  level: RiskLevelCategory,
  vulnerabilityScore: number,
  heatIndexC: number,
): number {
  return scoreFromLevel(level, vulnerabilityScore, heatIndexC);
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

  level = applyPagasaPersonalizedCeiling(level, environmentalLevel, input.heatIndexC);

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
