import { apiRequest } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import { ApiError } from '@/types/api';
import {
  AssessmentInputData,
  HeatRiskPrediction,
  HeatRiskPredictionRequest,
  HeatRiskPredictionResponse,
  NormalizedWeatherData,
  PredictHeatRiskOptions,
  PredictionApiError,
} from '@/types/prediction';
import { isApiConfigured } from '@/config/env';

const SERVER_UNAVAILABLE_STATUSES = new Set([502, 503, 504]);

export function isValidHeatRiskPredictionResponse(
  value: unknown,
): value is HeatRiskPredictionResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.prediction === 'number' &&
    Number.isFinite(candidate.prediction) &&
    typeof candidate.riskLevel === 'string' &&
    candidate.riskLevel.trim().length > 0 &&
    typeof candidate.model === 'string' &&
    candidate.model.trim().length > 0 &&
    typeof candidate.modelVersion === 'string' &&
    candidate.modelVersion.trim().length > 0 &&
    typeof candidate.timestamp === 'string' &&
    candidate.timestamp.trim().length > 0 &&
    (candidate.recommendations === undefined ||
      (Array.isArray(candidate.recommendations) &&
        candidate.recommendations.every((item) => typeof item === 'string')))
  );
}

function mapApiError(error: ApiError): PredictionApiError {
  if (error.status === 408) {
    return new PredictionApiError(
      'The prediction request timed out before the server responded.',
      'TIMEOUT',
      error.status,
    );
  }

  if (error.status === 0) {
    return new PredictionApiError(
      error.message || 'Unable to reach the prediction service.',
      'NETWORK_ERROR',
      error.status,
    );
  }

  if (SERVER_UNAVAILABLE_STATUSES.has(error.status)) {
    return new PredictionApiError(
      error.message || 'The prediction server is currently unavailable.',
      'SERVER_UNAVAILABLE',
      error.status,
    );
  }

  if (error.status === 401 || error.status === 403) {
    return new PredictionApiError(
      error.message || 'Backend rejected the auth token.',
      'UNAUTHORIZED',
      error.status,
    );
  }

  return new PredictionApiError(
    error.message || `Prediction request failed with status ${error.status}.`,
    'HTTP_ERROR',
    error.status,
  );
}

function buildRequestBody(
  assessmentData: AssessmentInputData,
  weatherData: NormalizedWeatherData,
  profile?: AssessmentInputData,
): HeatRiskPredictionRequest {
  return {
    assessment: assessmentData,
    weather: weatherData,
    ...(profile && Object.keys(profile).length > 0 ? { profile } : {}),
    submittedAt: new Date().toISOString(),
  };
}

/**
 * Sends research-approved assessment and normalized weather data to the
 * backend prediction API and returns a validated typed prediction object.
 *
 * No prediction logic is performed in the mobile application.
 */
export async function predictHeatRisk(
  assessmentData: AssessmentInputData,
  weatherData: NormalizedWeatherData,
  options: PredictHeatRiskOptions = {},
): Promise<HeatRiskPrediction> {
  if (!isApiConfigured()) {
    throw new PredictionApiError(
      'Backend API URL is not configured. Set EXPO_PUBLIC_API_URL in your environment.',
      'NOT_CONFIGURED',
    );
  }

  const { token, timeoutMs, signal, profile } = options;
  const body = buildRequestBody(assessmentData, weatherData, profile);

  let rawResponse: unknown;

  try {
    rawResponse = await apiRequest<unknown>(API_ENDPOINTS.prediction.heatRisk, {
      method: 'POST',
      body,
      token,
      timeoutMs,
      signal,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw mapApiError(error);
    }

    throw new PredictionApiError(
      'An unexpected error occurred while requesting a prediction.',
      'NETWORK_ERROR',
    );
  }

  if (!isValidHeatRiskPredictionResponse(rawResponse)) {
    throw new PredictionApiError(
      'The prediction service returned a malformed response.',
      'MALFORMED_RESPONSE',
    );
  }

  return rawResponse;
}
