import { RiskLevelCategory } from '@/constants/riskLevels';
import { HeatSensitiveConditionId } from '@/constants/health-vulnerability';

export interface VulnerabilityInput {
  age?: number;
  /** @deprecated Use healthConditions */
  healthCondition?: string;
  healthConditions?: HeatSensitiveConditionId[];
  activityLevel?: string;
  hydration?: string | boolean;
  generalStatus?: string;
}

export interface HeatRiskAssessmentResult {
  level: RiskLevelCategory;
  riskScore: number;
  environmentalLevel: RiskLevelCategory;
  vulnerabilityScore: number;
  primaryRiskFactors: string[];
  reason: string;
  recommendedAction: string;
  heatIndexC: number;
  assessedAt: string;
  healthConditions?: HeatSensitiveConditionId[];
}

export interface SafetyRecommendationSection {
  id: string;
  title: string;
  tips: string[];
}

export interface StructuredSafetyRecommendations {
  sections: SafetyRecommendationSection[];
  /** Flat list for backward-compatible display. */
  flat: string[];
}

export interface DecisionTreeRules {
  enabled: boolean;
}

export const DECISION_TREE_RULES: DecisionTreeRules = {
  enabled: true,
};
