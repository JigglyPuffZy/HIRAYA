import { riskAssessmentService } from '@/services/risk-assessment/risk-assessment.service';
import { environmentalService } from '@/services/environmental/environmental.service';
import { profileService } from '@/services/profileService';
import {
  localAssessmentService,
  StoredAssessmentRecord,
} from '@/services/localAssessmentService';
import { isApiConfigured, isSupabaseConfigured } from '@/config/env';
import { predictHeatRisk } from '@/api/predictionApi';
import { STUDY_AREA } from '@/constants/study-area';
import { ASSESSMENT_ML_TIMEOUT_MS, WEATHER_REFRESH_INTERVAL_MS } from '@/constants/liveRefresh';
import { hasAssessmentFieldsConfigured } from '@/constants/assessmentFields';
import { isBackendQuicklyReachable } from '@/services/backendHealthService';
import { AssessmentSubmissionError } from '@/types/assessment';
import {
  HeatRiskAssessmentResult,
  VulnerabilityInput,
} from '@/types/riskAssessment';
import {
  AssessmentInputData,
  HeatRiskPrediction,
  RiskResultPayload,
} from '@/types/prediction';
import { buildEnvironmentalData } from '@/utils/assessmentPayload';
import { snapshotToWeatherData } from '@/services/weatherService';
import {
  buildStructuredSafetyRecommendations,
  flattenSafetySections,
} from '@/services/safety-recommendations/safety-recommendation.engine';
import { combineTreeAndMlRiskLevel, RISK_LEVEL_ORDER } from '@/config/risk-assessment.config';
import { RiskLevelCategory } from '@/constants/riskLevels';
import { CurrentWeatherSnapshot, EnvironmentalSnapshot, HeatDataSource } from '@/types/environmental';
import {
  AssessmentRecordSource,
  supabaseAssessmentRecordsService,
} from '@/services/supabase';
import { predictConditionAwareBackup } from '@/services/decision-tree/condition-heat-ml-backup';
import { AssessmentHistorySource } from '@/constants/assessmentHistorySource';

function createRecordId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function assessmentToPrediction(
  treeResult: HeatRiskAssessmentResult,
  profile?: AssessmentInputData,
  mlPrediction?: HeatRiskPrediction,
): HeatRiskPrediction {
  const structured = buildStructuredSafetyRecommendations({
    assessment: treeResult,
    profile,
  });

  const combinedLevel = mlPrediction
    ? combineTreeAndMlRiskLevel(
        treeResult.level,
        mlPrediction.riskLevel as RiskLevelCategory,
        mlPrediction.prediction,
      )
    : treeResult.level;

  const candidates = [treeResult.level, combinedLevel];
  if (mlPrediction?.riskLevel) {
    candidates.push(mlPrediction.riskLevel as RiskLevelCategory);
  }

  const finalLevel = candidates.reduce((best, level) =>
    RISK_LEVEL_ORDER.indexOf(level) > RISK_LEVEL_ORDER.indexOf(best) ? level : best,
  treeResult.level);

  const finalScore = treeResult.riskScore;

  return {
    prediction: finalScore,
    riskLevel: finalLevel,
    model: 'HIRAYA',
    modelVersion: mlPrediction?.modelVersion ?? '2.0.0',
    timestamp: treeResult.assessedAt,
    recommendations: flattenSafetySections(structured.sections),
    primaryRiskFactors: treeResult.primaryRiskFactors,
    riskExplanation: mlPrediction?.riskExplanation ?? treeResult.reason,
    structuredRecommendations: structured.sections,
    healthConditions: treeResult.healthConditions,
  };
}

async function persistAssessmentRecord(
  userId: string,
  payload: RiskResultPayload,
  source: AssessmentRecordSource,
): Promise<StoredAssessmentRecord> {
  const recordId = createRecordId();
  const localRecord = await localAssessmentService.saveAssessment(userId, payload, recordId);

  if (isSupabaseConfigured()) {
    void supabaseAssessmentRecordsService
      .insertRecord({ userId, payload, source })
      .catch(() => {
        // History still saved locally; cloud sync is best-effort.
      });
  }

  return localRecord;
}

async function resolveEnvironmentalForAssessment(): Promise<EnvironmentalSnapshot> {
  const cached = await environmentalService.getCached();

  if (cached?.weather?.updatedAt) {
    const cacheAgeMs = Date.now() - new Date(cached.weather.updatedAt).getTime();
    if (Number.isFinite(cacheAgeMs) && cacheAgeMs >= 0 && cacheAgeMs < WEATHER_REFRESH_INTERVAL_MS) {
      return cached;
    }
  }

  return environmentalService.fetchWithFallback();
}

async function resolveMlOrConditionBackup(
  userInputs: AssessmentInputData,
  normalizedWeather: ReturnType<typeof buildEnvironmentalData>,
  token: string,
  profileData: AssessmentInputData,
): Promise<HeatRiskPrediction> {
  if (isApiConfigured()) {
    const backendUp = await isBackendQuicklyReachable();
    if (backendUp) {
      try {
        return await predictHeatRisk(userInputs, normalizedWeather, {
          token,
          profile: profileData,
          timeoutMs: ASSESSMENT_ML_TIMEOUT_MS,
        });
      } catch {
        // Fall through to on-device condition backup.
      }
    }
  }

  // ML backup: disease-aware on-device scorer (HIGH/EXTREME depends on sakit).
  return predictConditionAwareBackup({
    heatIndexC: Number(normalizedWeather.heatIndex ?? normalizedWeather.feelsLike ?? 32),
    humidity: Number(normalizedWeather.humidity ?? 70),
    vulnerability: userInputs,
    profile: profileData,
  });
}

export const assessmentSubmissionService = {
  async persistLiveSnapshot(
    userId: string,
    weatherSnapshot: CurrentWeatherSnapshot,
    heatDataSource: HeatDataSource,
    source: Extract<AssessmentHistorySource, 'live_refresh' | 'user_refresh'> = 'live_refresh',
  ): Promise<StoredAssessmentRecord> {
    const profileData = await profileService.getProfileDataForPrediction(userId);
    const treeResult = riskAssessmentService.assess({
      weather: weatherSnapshot,
      assessment: {},
      profile: profileData,
    });
    const weather = snapshotToWeatherData(weatherSnapshot, heatDataSource);
    const normalizedWeather = buildEnvironmentalData(weather, {
      latitude: STUDY_AREA.latitude,
      longitude: STUDY_AREA.longitude,
    });
    const submittedAt = new Date().toISOString();
    const conditionBackup = predictConditionAwareBackup({
      heatIndexC: weatherSnapshot.heatIndex,
      humidity: weatherSnapshot.humidity,
      vulnerability: {},
      profile: profileData,
    });
    const prediction = assessmentToPrediction(treeResult, profileData, conditionBackup);

    const payload: RiskResultPayload = {
      prediction,
      weather: normalizedWeather,
      assessment: {},
      profile: profileData,
      submittedAt,
      source,
    };

    return persistAssessmentRecord(userId, payload, source);
  },

  async submitForPrediction(
    userInputs: Record<string, string | number | boolean>,
    token: string,
    userId: string,
    onStep?: (step: 'fetching_weather' | 'submitting') => void,
  ): Promise<RiskResultPayload> {
    if (!hasAssessmentFieldsConfigured()) {
      throw new AssessmentSubmissionError(
        'Assessment fields are not configured yet.',
        'NO_FIELDS_CONFIGURED',
      );
    }

    onStep?.('fetching_weather');

    const [environmental, profileData] = await Promise.all([
      resolveEnvironmentalForAssessment(),
      profileService.getProfileDataForPrediction(userId),
    ]);

    const weather = snapshotToWeatherData(
      environmental.weather,
      environmental.source,
    );
    const coordinates = {
      latitude: STUDY_AREA.latitude,
      longitude: STUDY_AREA.longitude,
    };
    const normalizedWeather = buildEnvironmentalData(weather, coordinates);
    const submittedAt = new Date().toISOString();

    onStep?.('submitting');

    const treeResult = riskAssessmentService.assess({
      weather: environmental.weather,
      assessment: userInputs as AssessmentInputData,
      profile: profileData,
    });

    const mlPrediction = await resolveMlOrConditionBackup(
      userInputs as AssessmentInputData,
      normalizedWeather,
      token,
      profileData,
    );

    const prediction = assessmentToPrediction(treeResult, profileData, mlPrediction);

    const payload: RiskResultPayload = {
      prediction,
      weather: normalizedWeather,
      assessment: userInputs,
      profile: profileData,
      submittedAt,
      source: 'manual_assessment',
    };

    await persistAssessmentRecord(userId, payload, 'manual_assessment');

    return payload;
  },

  buildVulnerabilityPreview(
    assessment: AssessmentInputData,
    profile?: AssessmentInputData,
  ): VulnerabilityInput {
    return riskAssessmentService.mergeVulnerabilityInput(assessment, profile);
  },
};
