/**
 * On-device ML backup — uses the same PAGASA-aligned decision tree when cloud ML is offline.
 */

import { DISEASE_RISK_CONFIG } from '@/constants/health-vulnerability';
import { HeatRiskPrediction } from '@/types/prediction';
import { VulnerabilityInput } from '@/types/riskAssessment';
import {
  buildStructuredSafetyRecommendations,
  flattenSafetySections,
} from '@/services/safety-recommendations/safety-recommendation.engine';
import { assessHeatRisk } from '@/services/decision-tree/heat-risk-classifier';

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

  const structured = buildStructuredSafetyRecommendations({
    assessment: tree,
    profile: vulnerability as Record<string, string | number | boolean>,
  });

  const conditionLabels = (tree.healthConditions ?? []).map(
    (id) => DISEASE_RISK_CONFIG[id]?.label ?? id,
  );

  const explanation =
    conditionLabels.length > 0
      ? `On-device risk reflects ${tree.level.toLowerCase()} exposure with health conditions: ${conditionLabels.join(', ')}.`
      : tree.reason;

  return {
    prediction: tree.riskScore,
    riskLevel: tree.level,
    model: 'HIRAYA-ConditionBackup',
    modelVersion: '1.1.0',
    timestamp: tree.assessedAt,
    recommendations: flattenSafetySections(structured.sections),
    primaryRiskFactors: tree.primaryRiskFactors,
    riskExplanation: explanation,
    structuredRecommendations: structured.sections,
    healthConditions: tree.healthConditions,
  };
}
