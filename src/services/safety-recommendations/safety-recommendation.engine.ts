import {
  COMBINED_CONDITION_PRECAUTIONS,
  DISEASE_RISK_CONFIG,
  GENERAL_HEAT_SAFETY_TIPS,
  HeatSensitiveConditionId,
} from '@/constants/health-vulnerability';
import {
  HeatRiskAssessmentResult,
  SafetyRecommendationSection,
  StructuredSafetyRecommendations,
} from '@/types/riskAssessment';
import { RiskLevelCategory } from '@/constants/riskLevels';
import { combinedConditionKey, parseHealthConditions } from '@/utils/healthConditions';
import { AssessmentInputData } from '@/types/prediction';

function levelIntro(level: RiskLevelCategory): string {
  switch (level) {
    case 'LOW':
      return 'Conditions are relatively favorable, but stay alert to changes in heat and how you feel.';
    case 'MODERATE':
      return 'Heat exposure requires caution — follow the guidance below for your health profile.';
    case 'HIGH':
      return 'Your heat risk is elevated. Prioritize cooling, hydration, and reduced exertion.';
    case 'EXTREME':
      return 'Dangerous heat conditions for your profile. Seek cool shelter and medical help if symptoms worsen.';
    default:
      return 'Follow heat safety guidance appropriate for your health profile.';
  }
}

function resolveConditions(
  assessment: HeatRiskAssessmentResult,
  profile?: AssessmentInputData,
): HeatSensitiveConditionId[] {
  if (assessment.healthConditions?.length) {
    return assessment.healthConditions;
  }

  const fromProfile = parseHealthConditions(profile?.health_conditions);
  if (fromProfile.length) {
    return fromProfile;
  }

  return parseHealthConditions(profile?.health_condition);
}

export function buildConditionOnlySafetySections(input: {
  assessment: HeatRiskAssessmentResult;
  profile?: AssessmentInputData;
}): SafetyRecommendationSection[] {
  const conditions = resolveConditions(input.assessment, input.profile);

  return conditions.map((conditionId) => {
    const config = DISEASE_RISK_CONFIG[conditionId];
    return {
      id: `condition_${conditionId}`,
      title: config.label,
      tips: [...config.safetyTips],
    };
  });
}

export function filterConditionSafetySections(
  sections: SafetyRecommendationSection[],
): SafetyRecommendationSection[] {
  return sections.filter((section) => section.id.startsWith('condition_'));
}

export function buildStructuredSafetyRecommendations(input: {
  assessment: HeatRiskAssessmentResult;
  profile?: AssessmentInputData;
  /** When true, only return tips for profile health conditions (UI default). */
  conditionsOnly?: boolean;
}): StructuredSafetyRecommendations {
  const { assessment, profile, conditionsOnly = true } = input;

  if (conditionsOnly) {
    const sections = buildConditionOnlySafetySections({ assessment, profile });
    const flat = sections.flatMap((section) => section.tips);
    return { sections, flat };
  }

  const conditions = resolveConditions(assessment, profile);
  const sections: SafetyRecommendationSection[] = [];

  sections.push({
    id: 'risk_summary',
    title: `${assessment.level} Heat Risk — What This Means`,
    tips: [
      levelIntro(assessment.level),
      assessment.recommendedAction,
    ],
  });

  if (assessment.primaryRiskFactors.length > 0) {
    sections.push({
      id: 'risk_explanation',
      title: 'Why Your Risk Is Elevated',
      tips: assessment.primaryRiskFactors.map((factor) => `• ${factor}`),
    });
  }

  for (const conditionId of conditions) {
    const config = DISEASE_RISK_CONFIG[conditionId];
    sections.push({
      id: `condition_${conditionId}`,
      title: config.label,
      tips: [...config.safetyTips],
    });
  }

  if (conditions.length >= 2) {
    const comboKey = combinedConditionKey(conditions);
    const knownCombo = COMBINED_CONDITION_PRECAUTIONS[comboKey];
    const combinedTips =
      knownCombo ??
      [
        'Managing multiple heat-sensitive conditions together requires extra caution in high heat.',
        'Prioritize cooled indoor environments and avoid stacking physical exertion with heat exposure.',
        'Seek medical guidance if symptoms from any of your conditions worsen in the heat.',
      ];

    sections.push({
      id: 'combined_precautions',
      title: 'Additional Precautions (Multiple Conditions)',
      tips: combinedTips,
    });
  }

  sections.push({
    id: 'general_heat_safety',
    title: conditions.length === 0 ? 'General Heat Safety' : 'General Heat Safety (Everyone)',
    tips: [...GENERAL_HEAT_SAFETY_TIPS],
  });

  const flat = sections.flatMap((section) =>
    section.tips.map((tip) =>
      section.id.startsWith('condition_') || section.id === 'combined_precautions'
        ? tip
        : tip.startsWith('•')
          ? tip
          : tip,
    ),
  );

  return { sections, flat };
}

export function flattenSafetySections(sections: SafetyRecommendationSection[]): string[] {
  return filterConditionSafetySections(sections).flatMap((section) => section.tips);
}
