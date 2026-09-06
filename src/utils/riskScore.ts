import { applyPagasaPersonalizedCeiling } from '@/config/risk-assessment.config';
import { resolveRiskLevelCategory, RiskLevelCategory } from '@/constants/riskLevels';
import { riskAssessmentService } from '@/services/risk-assessment/risk-assessment.service';
import { computeRiskDisplayScore } from '@/services/decision-tree/heat-risk-classifier';
import { CurrentWeatherSnapshot } from '@/types/environmental';
import {
  AssessmentInputData,
  NormalizedWeatherData,
  RiskResultPayload,
} from '@/types/prediction';

function weatherSnapshotFromPayload(weather: NormalizedWeatherData): CurrentWeatherSnapshot {
  return {
    location: weather.location,
    temperature: weather.temperature,
    feelsLike: weather.feelsLike,
    humidity: weather.humidity,
    heatIndex: weather.heatIndex,
    wbgt: weather.wbgt ?? 0,
    condition: weather.condition,
    description: weather.description,
    windKph: weather.windKph ?? weather.windSpeed,
    windDir: weather.windDir ?? '',
    updatedAt: weather.capturedAt,
  };
}

/**
 * Single source of truth for risk level + score shown in the app.
 * Recomputes from live heat index, profile, and assessment inputs.
 */
export function resolveRiskResultDisplay(payload: RiskResultPayload): {
  level: RiskLevelCategory;
  score: number;
} {
  const tree = riskAssessmentService.assess({
    weather: weatherSnapshotFromPayload(payload.weather),
    assessment: (payload.assessment ?? {}) as AssessmentInputData,
    profile: (payload.profile ?? {}) as AssessmentInputData,
  });

  const storedLevel = resolveRiskLevelCategory(payload.prediction.riskLevel);
  const level = applyPagasaPersonalizedCeiling(
    storedLevel,
    tree.environmentalLevel,
    tree.heatIndexC,
  );

  const score = computeRiskDisplayScore(
    level,
    tree.vulnerabilityScore,
    tree.heatIndexC,
  );

  return { level, score };
}

/**
 * Display score for stored values. Never treat ML probability (0–1) as a 0–100 score.
 */
export function normalizeDisplayedRiskScore(
  value: number | undefined | null,
): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return undefined;
  }

  if (value > 0 && value <= 1) {
    return undefined;
  }

  return Math.min(99, Math.max(5, Math.round(value)));
}
