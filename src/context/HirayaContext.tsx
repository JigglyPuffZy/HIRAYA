import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { environmentalService } from '@/services/environmental/environmental.service';
import { riskAssessmentService } from '@/services/risk-assessment/risk-assessment.service';
import { profileService } from '@/services/profileService';
import { localAssessmentService } from '@/services/localAssessmentService';
import { assessmentSubmissionService } from '@/services/assessmentSubmissionService';
import { snapshotToWeatherData } from '@/services/weatherService';
import { useAuth } from '@/hooks/useAuth';
import {
  WEATHER_REFRESH_INTERVAL_MS,
  WEATHER_REFRESH_INTERVAL_SEC,
} from '@/constants/liveRefresh';
import {
  RefreshHeatDataOptions,
  refreshSourceFromTrigger,
} from '@/constants/assessmentHistorySource';
import {
  CurrentWeatherSnapshot,
  HeatDataSource,
  HeatReading,
} from '@/types/environmental';
import { HeatRiskAssessmentResult } from '@/types/riskAssessment';
import { AssessmentInputData, HeatRiskPrediction } from '@/types/prediction';

interface HirayaContextValue {
  heatReading: HeatReading | null;
  currentWeather: CurrentWeatherSnapshot | null;
  assessment: HeatRiskAssessmentResult | null;
  heatDataSource: HeatDataSource;
  heatError: string | null;
  isRefreshing: boolean;
  isInitialLoading: boolean;
  lastRefreshedAt: string | null;
  secondsUntilRefresh: number;
  refreshIntervalSec: number;
  refreshHeatData: (options?: RefreshHeatDataOptions) => Promise<void>;
  runAssessment: (inputs?: AssessmentInputData) => Promise<HeatRiskAssessmentResult | null>;
}

const HirayaContext = createContext<HirayaContextValue | null>(null);

function latestToAssessment(
  prediction: HeatRiskPrediction,
  payloadSubmittedAt: string,
  heatIndex?: number,
): HeatRiskAssessmentResult {
  return {
    level: prediction.riskLevel as HeatRiskAssessmentResult['level'],
    riskScore: prediction.prediction,
    environmentalLevel: prediction.riskLevel as HeatRiskAssessmentResult['environmentalLevel'],
    vulnerabilityScore: 0,
    primaryRiskFactors: prediction.recommendations?.slice(1) ?? [],
    reason: 'Loaded from your most recent assessment.',
    recommendedAction:
      prediction.recommendations?.[0] ??
      'Review your heat safety plan for Tuguegarao.',
    heatIndexC: heatIndex ?? 0,
    assessedAt: payloadSubmittedAt,
  };
}

function isSameAssessment(
  a: HeatRiskAssessmentResult | null,
  b: HeatRiskAssessmentResult,
): boolean {
  if (!a) {
    return false;
  }

  return (
    a.level === b.level &&
    a.riskScore === b.riskScore &&
    a.heatIndexC === b.heatIndexC &&
    a.environmentalLevel === b.environmentalLevel
  );
}

export function HirayaProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [heatReading, setHeatReading] = useState<HeatReading | null>(null);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeatherSnapshot | null>(
    null,
  );
  const [assessment, setAssessment] = useState<HeatRiskAssessmentResult | null>(null);
  const [heatDataSource, setHeatDataSource] =
    useState<HeatDataSource>('unavailable');
  const [heatError, setHeatError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(
    WEATHER_REFRESH_INTERVAL_SEC,
  );

  const currentWeatherRef = useRef<CurrentWeatherSnapshot | null>(null);
  const heatDataSourceRef = useRef<HeatDataSource>('unavailable');
  const refreshInFlightRef = useRef(false);
  const nextRefreshAtRef = useRef(Date.now() + WEATHER_REFRESH_INTERVAL_MS);
  const sessionUserIdRef = useRef<string | undefined>(session?.user.id);

  currentWeatherRef.current = currentWeather;
  sessionUserIdRef.current = session?.user.id;

  const scheduleNextRefresh = useCallback(() => {
    nextRefreshAtRef.current = Date.now() + WEATHER_REFRESH_INTERVAL_MS;
    setSecondsUntilRefresh(WEATHER_REFRESH_INTERVAL_SEC);
  }, []);

  const applySnapshot = useCallback(
    (snapshot: Awaited<ReturnType<typeof environmentalService.fetchWithFallback>>) => {
      setHeatReading(snapshot.heatReading);
      setCurrentWeather(snapshot.weather);
      setHeatDataSource(snapshot.source);
      heatDataSourceRef.current = snapshot.source;
    },
    [],
  );

  const updateLiveAssessment = useCallback(
    async (
      weatherSnapshot: CurrentWeatherSnapshot,
      heatDataSource: HeatDataSource,
      options?: { persistHistory?: boolean; historySource?: 'live_refresh' | 'user_refresh' },
    ) => {
      const userId = sessionUserIdRef.current;
      if (!userId) {
        return;
      }

      const profile = await profileService.getProfileDataForPrediction(userId);
      const result = riskAssessmentService.assess({
        weather: weatherSnapshot,
        assessment: {},
        profile,
      });

      setAssessment((prev) => (isSameAssessment(prev, result) ? prev : result));

      if (options?.persistHistory === false) {
        return;
      }

      await assessmentSubmissionService.persistLiveSnapshot(
        userId,
        weatherSnapshot,
        heatDataSource,
        options?.historySource ?? 'live_refresh',
      );
    },
    [],
  );

  const refreshHeatData = useCallback(async (options?: RefreshHeatDataOptions) => {
    const trigger = options?.trigger ?? 'auto';
    const isUserRefresh = trigger === 'user';

    if (refreshInFlightRef.current && !isUserRefresh) {
      return;
    }

    refreshInFlightRef.current = true;
    setIsRefreshing(true);
    setHeatError(null);

    const historySource = refreshSourceFromTrigger(trigger);

    try {
      const snapshot = await environmentalService.fetchWithFallback();
      applySnapshot(snapshot);
      setLastRefreshedAt(new Date().toISOString());
      scheduleNextRefresh();
      await updateLiveAssessment(snapshot.weather, snapshot.source, {
        persistHistory: historySource !== null,
        historySource: historySource ?? 'live_refresh',
      });
    } catch (error) {
      setHeatError(
        error instanceof Error
          ? error.message
          : 'Unable to load live weather for Tuguegarao.',
      );
    } finally {
      setIsRefreshing(false);
      setIsInitialLoading(false);
      refreshInFlightRef.current = false;
    }
  }, [applySnapshot, scheduleNextRefresh, updateLiveAssessment]);

  const runAssessment = useCallback(
    async (inputs: AssessmentInputData = {}): Promise<HeatRiskAssessmentResult | null> => {
      if (!session?.user.id) {
        return null;
      }

      let weatherSnapshot = currentWeatherRef.current;

      if (!weatherSnapshot) {
        await refreshHeatData({ trigger: 'auto' });
        weatherSnapshot = currentWeatherRef.current;
      }

      if (!weatherSnapshot) {
        return null;
      }

      const profile = await profileService.getProfileDataForPrediction(
        session.user.id,
      );

      const result = riskAssessmentService.assess({
        weather: weatherSnapshot,
        assessment: inputs,
        profile,
      });

      setAssessment((prev) => (isSameAssessment(prev, result) ? prev : result));

      await assessmentSubmissionService.persistLiveSnapshot(
        session.user.id,
        weatherSnapshot,
        heatDataSourceRef.current,
        'user_refresh',
      );

      return result;
    },
    [refreshHeatData, session?.user.id],
  );

  useEffect(() => {
    const countdownId = setInterval(() => {
      const remainingMs = nextRefreshAtRef.current - Date.now();
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
      setSecondsUntilRefresh(remainingSec);

      if (remainingSec === 0 && !refreshInFlightRef.current) {
        void refreshHeatData({ trigger: 'auto' });
      }
    }, 1000);

    return () => clearInterval(countdownId);
  }, [refreshHeatData]);

  useEffect(() => {
    if (!session?.user.id) {
      setAssessment(null);
      setIsInitialLoading(true);
      return;
    }

    let mounted = true;

    void (async () => {
      setIsInitialLoading(true);
      await refreshHeatData({ trigger: 'auto' });

      if (!mounted) {
        return;
      }

      const latest = await localAssessmentService.getLatestAssessment(session.user.id);

      if (latest?.payload?.prediction) {
        setAssessment((current) => {
          if (current) {
            return current;
          }

          return latestToAssessment(
            latest.payload.prediction,
            latest.payload.submittedAt,
            latest.payload.weather.heatIndex,
          );
        });
      }
    })();

    return () => {
      mounted = false;
    };
  }, [session?.user.id, refreshHeatData]);

  const value = useMemo<HirayaContextValue>(
    () => ({
      heatReading,
      currentWeather,
      assessment,
      heatDataSource,
      heatError,
      isRefreshing,
      isInitialLoading,
      lastRefreshedAt,
      secondsUntilRefresh,
      refreshIntervalSec: WEATHER_REFRESH_INTERVAL_SEC,
      refreshHeatData,
      runAssessment,
    }),
    [
      heatReading,
      currentWeather,
      assessment,
      heatDataSource,
      heatError,
      isRefreshing,
      isInitialLoading,
      lastRefreshedAt,
      secondsUntilRefresh,
      refreshHeatData,
      runAssessment,
    ],
  );

  return (
    <HirayaContext.Provider value={value}>{children}</HirayaContext.Provider>
  );
}

export function useHiraya(): HirayaContextValue {
  const context = useContext(HirayaContext);

  if (!context) {
    throw new Error('useHiraya must be used within HirayaProvider');
  }

  return context;
}

export function useHirayaWeather() {
  const {
    currentWeather,
    heatReading,
    heatDataSource,
    heatError,
    isRefreshing,
    isInitialLoading,
    lastRefreshedAt,
    secondsUntilRefresh,
    refreshIntervalSec,
    refreshHeatData,
  } = useHiraya();

  const weather = currentWeather
    ? snapshotToWeatherData(currentWeather, heatDataSource)
    : null;

  return {
    weather,
    heatReading,
    heatDataSource,
    isLoading: isInitialLoading && currentWeather === null,
    isRefreshing,
    lastRefreshedAt,
    secondsUntilRefresh,
    refreshIntervalSec,
    error: heatError,
    refreshHeatData,
  };
}
