import { assessHeatRisk } from '@/services/decision-tree/heat-risk-classifier';
import { DECISION_TREE_RULES } from '@/types/riskAssessment';
import {
  HeatRiskAssessmentResult,
  VulnerabilityInput,
} from '@/types/riskAssessment';
import { AssessmentInputData } from '@/types/prediction';
import { CurrentWeatherSnapshot } from '@/types/environmental';
import { parseHealthConditions } from '@/utils/healthConditions';
import { HeatSensitiveConditionId } from '@/constants/health-vulnerability';

function parseAge(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function mergeHealthConditions(
  assessment: AssessmentInputData,
  profile?: AssessmentInputData,
): HeatSensitiveConditionId[] {
  const fromAssessment = parseHealthConditions(assessment.health_conditions);
  if (fromAssessment.length) {
    return fromAssessment;
  }

  const fromProfile = parseHealthConditions(profile?.health_conditions);
  if (fromProfile.length) {
    return fromProfile;
  }

  const legacy =
    parseHealthConditions(assessment.health_condition).length > 0
      ? parseHealthConditions(assessment.health_condition)
      : parseHealthConditions(profile?.health_condition);

  return legacy;
}

function mergeVulnerabilityInput(
  assessment: AssessmentInputData,
  profile?: AssessmentInputData,
): VulnerabilityInput {
  const merged = { ...profile, ...assessment };
  const healthConditions = mergeHealthConditions(assessment, profile);

  return {
    age: parseAge(merged.age),
    healthConditions,
    healthCondition: healthConditions[0],
    activityLevel:
      typeof merged.activity_level === 'string'
        ? merged.activity_level
        : undefined,
    hydration:
      typeof merged.hydration === 'string' || typeof merged.hydration === 'boolean'
        ? merged.hydration
        : typeof merged.hydration_status === 'string'
          ? merged.hydration_status
          : undefined,
    generalStatus:
      typeof merged.general_status === 'string'
        ? merged.general_status
        : undefined,
  };
}

export const riskAssessmentService = {
  assess(input: {
    weather: CurrentWeatherSnapshot;
    assessment: AssessmentInputData;
    profile?: AssessmentInputData;
  }): HeatRiskAssessmentResult {
    if (!DECISION_TREE_RULES.enabled) {
      throw new Error('Decision tree assessment is disabled.');
    }

    const vulnerability = mergeVulnerabilityInput(input.assessment, input.profile);

    return assessHeatRisk({
      heatIndexC: input.weather.heatIndex,
      humidity: input.weather.humidity,
      vulnerability,
    });
  },

  mergeVulnerabilityInput,
};
