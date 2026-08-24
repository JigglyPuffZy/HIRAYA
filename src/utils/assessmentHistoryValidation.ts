import { AssessmentHistoryItem } from '@/types/assessmentHistory';
import { RiskResultPayload } from '@/types/prediction';
import { isValidRiskResultPayload } from '@/utils/riskResultPayload';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export function isValidAssessmentHistoryItem(
  value: unknown,
): value is AssessmentHistoryItem {
  if (!isRecord(value)) {
    return false;
  }

  const hasRequiredFields =
    typeof value.id === 'string' &&
    value.id.trim().length > 0 &&
    typeof value.assessedAt === 'string' &&
    value.assessedAt.trim().length > 0 &&
    typeof value.riskLevel === 'string' &&
    value.riskLevel.trim().length > 0;

  if (!hasRequiredFields) {
    return false;
  }

  if (
    value.prediction !== undefined &&
    (typeof value.prediction !== 'number' || !Number.isFinite(value.prediction))
  ) {
    return false;
  }

  if (
    value.weatherSummary !== undefined &&
    typeof value.weatherSummary !== 'string'
  ) {
    return false;
  }

  if (value.model !== undefined && typeof value.model !== 'string') {
    return false;
  }

  if (
    value.modelVersion !== undefined &&
    typeof value.modelVersion !== 'string'
  ) {
    return false;
  }

  return true;
}

export function validateAssessmentHistoryList(
  value: unknown,
): AssessmentHistoryItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isValidAssessmentHistoryItem);
}

export function validateAssessmentHistoryDetail(
  value: unknown,
): RiskResultPayload | null {
  return isValidRiskResultPayload(value) ? value : null;
}

export function formatWeatherSummaryFromPayload(
  payload: RiskResultPayload,
): string {
  const { weather } = payload;
  return `${weather.location} · ${Math.round(weather.temperature)}°C · ${weather.condition}`;
}
