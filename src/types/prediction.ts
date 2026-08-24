/**
 * Research-approved user inputs keyed by field identifier.
 * Field definitions are configured in src/constants/assessmentFields.ts.
 */
export type AssessmentInputData = Record<string, string | number | boolean | string[]>;

/**
 * Normalized environmental weather data passed to the prediction API.
 */
export interface NormalizedWeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  heatIndex: number;
  uvIndex: number;
  windSpeed: number;
  windKph?: number;
  windDir?: string;
  condition: string;
  description: string;
  capturedAt: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Request body sent to the backend prediction service.
 */
export interface HeatRiskPredictionRequest {
  assessment: AssessmentInputData;
  weather: NormalizedWeatherData;
  profile?: AssessmentInputData;
  submittedAt: string;
}

/**
 * Raw response shape returned by the backend prediction API.
 * Field semantics are defined by the backend model, not the mobile app.
 */
export interface HeatRiskPredictionResponse {
  prediction: number;
  riskLevel: string;
  model: string;
  modelVersion: string;
  timestamp: string;
  recommendations?: string[];
  primaryRiskFactors?: string[];
  riskExplanation?: string;
  structuredRecommendations?: {
    id: string;
    title: string;
    tips: string[];
  }[];
  healthConditions?: string[];
}

/**
 * Validated prediction object returned by predictHeatRisk().
 */
export type HeatRiskPrediction = HeatRiskPredictionResponse;

/**
 * Complete result payload passed to the Risk Result screen via navigation.
 * Includes the backend prediction plus the inputs used for transparency.
 */
export interface RiskResultPayload {
  prediction: HeatRiskPrediction;
  weather: NormalizedWeatherData;
  assessment: AssessmentInputData;
  profile?: AssessmentInputData;
  submittedAt: string;
  source?: 'live_refresh' | 'user_refresh' | 'manual_assessment';
}

export type PredictionErrorCode =
  | 'NOT_CONFIGURED'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'HTTP_ERROR'
  | 'UNAUTHORIZED'
  | 'SERVER_UNAVAILABLE'
  | 'MALFORMED_RESPONSE';

export class PredictionApiError extends Error {
  constructor(
    message: string,
    public code: PredictionErrorCode,
    public status?: number,
  ) {
    super(message);
    this.name = 'PredictionApiError';
  }
}

export interface PredictHeatRiskOptions {
  token?: string | null;
  timeoutMs?: number;
  signal?: AbortSignal;
  profile?: AssessmentInputData;
}
