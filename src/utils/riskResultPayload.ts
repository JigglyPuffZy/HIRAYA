import { isValidHeatRiskPredictionResponse } from '@/api/predictionApi';
import {
  AssessmentInputData,
  HeatRiskPrediction,
  NormalizedWeatherData,
  RiskResultPayload,
} from '@/types/prediction';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isNormalizedWeatherData = (value: unknown): value is NormalizedWeatherData => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.location === 'string' &&
    typeof value.temperature === 'number' &&
    Number.isFinite(value.temperature) &&
    typeof value.feelsLike === 'number' &&
    Number.isFinite(value.feelsLike) &&
    typeof value.humidity === 'number' &&
    Number.isFinite(value.humidity) &&
    (typeof value.heatIndex === 'number'
      ? Number.isFinite(value.heatIndex)
      : true) &&
    typeof value.uvIndex === 'number' &&
    Number.isFinite(value.uvIndex) &&
    typeof value.windSpeed === 'number' &&
    Number.isFinite(value.windSpeed) &&
    typeof value.condition === 'string' &&
    typeof value.description === 'string' &&
    typeof value.capturedAt === 'string' &&
    isRecord(value.coordinates) &&
    typeof value.coordinates.latitude === 'number' &&
    Number.isFinite(value.coordinates.latitude) &&
    typeof value.coordinates.longitude === 'number' &&
    Number.isFinite(value.coordinates.longitude)
  );
};

const isAssessmentInputData = (value: unknown): value is AssessmentInputData => {
  if (!isRecord(value)) {
    return false;
  }

  return Object.values(value).every(
    (entry) =>
      typeof entry === 'string' ||
      typeof entry === 'number' ||
      typeof entry === 'boolean' ||
      (Array.isArray(entry) && entry.every((item) => typeof item === 'string')),
  );
};

export function isValidRiskResultPayload(
  value: unknown,
): value is RiskResultPayload {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isValidHeatRiskPredictionResponse(value.prediction) &&
    isNormalizedWeatherData(value.weather) &&
    isAssessmentInputData(value.assessment) &&
    typeof value.submittedAt === 'string' &&
    value.submittedAt.trim().length > 0
  );
}

export function parseRiskResultPayload(raw: string): RiskResultPayload | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    return isValidRiskResultPayload(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function hasDisplayablePrediction(
  prediction: HeatRiskPrediction | null | undefined,
): prediction is HeatRiskPrediction {
  return (
    prediction !== null &&
    prediction !== undefined &&
    isValidHeatRiskPredictionResponse(prediction)
  );
}
