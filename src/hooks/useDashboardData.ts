import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useHiraya, useHirayaWeather } from '@/context/HirayaContext';
import { useAuth } from '@/hooks/useAuth';
import { localAssessmentService } from '@/services/localAssessmentService';
import { AssessmentHistoryItem } from '@/types/assessmentHistory';
import { RiskResultPayload } from '@/types/prediction';
import { buildStructuredSafetyRecommendations, filterConditionSafetySections } from '@/services/safety-recommendations/safety-recommendation.engine';
import { RefreshTrigger } from '@/constants/assessmentHistorySource';
import { SafetyRecommendationSection } from '@/types/riskAssessment';

type LocalAssessmentRecord = {
  historyItem: AssessmentHistoryItem | null;
  detail: RiskResultPayload | null;
};

const EMPTY_LOCAL_RECORD: LocalAssessmentRecord = {
  historyItem: null,
  detail: null,
};

function buildLocalRecord(
  latest: Awaited<ReturnType<typeof localAssessmentService.getLatestAssessment>>,
): LocalAssessmentRecord {
  if (!latest) {
    return EMPTY_LOCAL_RECORD;
  }

  return {
    historyItem: {
      id: latest.id,
      riskLevel: latest.payload.prediction.riskLevel,
      prediction: latest.payload.prediction.prediction,
      assessedAt: latest.payload.submittedAt,
      weatherSummary: latest.payload.weather.location,
    },
    detail: latest.payload,
  };
}

export function useDashboardData() {
  const { session } = useAuth();
  const {
    assessment,
    runAssessment,
    refreshHeatData,
    lastRefreshedAt,
    isRefreshing,
    secondsUntilRefresh,
    refreshIntervalSec,
  } = useHiraya();
  const { weather, isLoading, error } = useHirayaWeather();
  const [localRecord, setLocalRecord] =
    useState<LocalAssessmentRecord>(EMPTY_LOCAL_RECORD);

  const refreshInFlightRef = useRef(false);
  const lastLoadedAssessmentIdRef = useRef<string | null>(null);
  const lastLoadedSubmittedAtRef = useRef<string | null>(null);
  const sessionUserIdRef = useRef<string | undefined>(session?.user.id);
  const refreshHeatDataRef = useRef(refreshHeatData);
  const runAssessmentRef = useRef(runAssessment);

  sessionUserIdRef.current = session?.user.id;
  refreshHeatDataRef.current = refreshHeatData;
  runAssessmentRef.current = runAssessment;

  const loadLatestLocal = useCallback(async (userId: string) => {
    const latest = await localAssessmentService.getLatestAssessment(userId);
    const nextId = latest?.id ?? null;
    const nextSubmittedAt = latest?.payload.submittedAt ?? null;

    if (
      lastLoadedAssessmentIdRef.current === nextId &&
      lastLoadedSubmittedAtRef.current === nextSubmittedAt
    ) {
      return;
    }

    lastLoadedAssessmentIdRef.current = nextId;
    lastLoadedSubmittedAtRef.current = nextSubmittedAt;
    setLocalRecord(buildLocalRecord(latest));
  }, []);

  const loadLatestLocalRef = useRef(loadLatestLocal);
  loadLatestLocalRef.current = loadLatestLocal;

  const refreshDashboard = useCallback(async (options?: { trigger?: RefreshTrigger }) => {
    if (refreshInFlightRef.current && options?.trigger !== 'user') {
      return;
    }

    refreshInFlightRef.current = true;

    try {
      await refreshHeatDataRef.current({ trigger: options?.trigger ?? 'silent' });

      const userId = sessionUserIdRef.current;
      if (userId) {
        lastLoadedAssessmentIdRef.current = null;
        lastLoadedSubmittedAtRef.current = null;
        await loadLatestLocalRef.current(userId);
      } else {
        lastLoadedAssessmentIdRef.current = null;
        lastLoadedSubmittedAtRef.current = null;
        setLocalRecord((prev) =>
          prev.historyItem || prev.detail ? EMPTY_LOCAL_RECORD : prev,
        );
      }

    } finally {
      refreshInFlightRef.current = false;
    }
  }, []);

  // Stable callback — deps intentionally empty; latest logic read from refs above.
  useFocusEffect(
    useCallback(() => {
      void refreshDashboard();
    }, [refreshDashboard]),
  );

  useEffect(() => {
    if (!session?.user.id) {
      lastLoadedAssessmentIdRef.current = null;
      lastLoadedSubmittedAtRef.current = null;
      setLocalRecord(EMPTY_LOCAL_RECORD);
    }
  }, [session?.user.id]);

  useEffect(() => {
    const userId = session?.user.id;
    if (!userId || !assessment?.assessedAt) {
      return;
    }

    lastLoadedAssessmentIdRef.current = null;
    lastLoadedSubmittedAtRef.current = null;
    void loadLatestLocal(userId);
  }, [assessment?.assessedAt, assessment?.level, assessment?.riskScore, session?.user.id, loadLatestLocal]);

  const retryWeather = useCallback(async () => {
    await refreshHeatData({ trigger: 'user' });
  }, [refreshHeatData]);

  const retryRisk = useCallback(async () => {
    const userId = sessionUserIdRef.current;
    if (!userId) {
      return;
    }

    lastLoadedAssessmentIdRef.current = null;
    lastLoadedSubmittedAtRef.current = null;
    await runAssessmentRef.current({});
    await loadLatestLocalRef.current(userId);
  }, []);

  const localRiskLevel =
    localRecord.detail?.prediction.riskLevel ?? localRecord.historyItem?.riskLevel;
  const localRiskScore =
    localRecord.detail?.prediction.prediction ?? localRecord.historyItem?.prediction;
  const localAssessedAt =
    localRecord.detail?.submittedAt ?? localRecord.historyItem?.assessedAt;

  const displayRiskLevel = assessment?.level ?? localRiskLevel;
  const displayRiskScore = assessment?.riskScore ?? localRiskScore;
  const displayAssessedAt = assessment?.assessedAt ?? localAssessedAt;

  const latestAssessment =
    localRecord.detail || localRecord.historyItem
      ? localRecord
      : assessment
        ? {
            historyItem: {
              id: 'current',
              riskLevel: assessment.level,
              prediction: assessment.riskScore,
              assessedAt: assessment.assessedAt,
              weatherSummary: weather?.location ?? 'Tuguegarao City',
            },
            detail: null,
          }
        : EMPTY_LOCAL_RECORD;

  const structuredRecommendationsSource =
    latestAssessment.detail?.prediction.structuredRecommendations;

  const structuredRecommendationsKey = assessment
    ? `${assessment.level}|${assessment.riskScore}|${assessment.heatIndexC}|${assessment.assessedAt}|${assessment.primaryRiskFactors.join(',')}`
    : structuredRecommendationsSource
      ? structuredRecommendationsSource
          .map((section) => `${section.id}:${section.title}:${section.tips.join('\x1f')}`)
          .join('\x1e')
      : '';

  const profileForTips = latestAssessment.detail?.profile;

  const structuredRecommendations: SafetyRecommendationSection[] = useMemo(() => {
    if (assessment) {
      return buildStructuredSafetyRecommendations({
        assessment,
        profile: profileForTips,
      }).sections;
    }

    if (structuredRecommendationsSource?.length) {
      return filterConditionSafetySections(
        structuredRecommendationsSource.map((section) => ({
          id: section.id,
          title: section.title,
          tips: section.tips,
        })),
      );
    }

    return [];
  }, [structuredRecommendationsKey]);

  const recommendationsKey = assessment
    ? structuredRecommendationsKey
    : latestAssessment.detail?.prediction.recommendations?.join('\x1f') ??
      structuredRecommendationsKey;

  const recommendations = useMemo(() => {
    if (assessment) {
      return buildStructuredSafetyRecommendations({
        assessment,
        profile: profileForTips,
      }).flat;
    }

    return [];
  }, [recommendationsKey, assessment, profileForTips]);

  return {
    weather,
    latestAssessment,
    displayRiskLevel,
    displayRiskScore,
    displayAssessedAt,
    liveAssessment: assessment,
    recommendations,
    structuredRecommendations,
    lastUpdated: lastRefreshedAt,
    isWeatherLoading: isLoading,
    isWeatherRefreshing: isRefreshing,
    isRiskLoading: isLoading && !assessment,
    isRiskRefreshing: isRefreshing,
    secondsUntilRefresh,
    refreshIntervalSec,
    weatherError: error,
    riskError: null,
    refreshDashboard,
    retryWeather,
    retryRisk,
  };
}
