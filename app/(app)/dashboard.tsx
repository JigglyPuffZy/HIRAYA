import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardWeatherPanel } from '@/components/dashboard/DashboardWeatherPanel';
import { DashboardRiskStatus } from '@/components/dashboard/DashboardRiskStatus';
import { DashboardQuickActions } from '@/components/dashboard/DashboardQuickActions';
import { SafetyRecommendations } from '@/components/dashboard/SafetyRecommendations';
import { useCurrentUser } from '@/hooks/useAuth';
import { useDashboardData } from '@/hooks/useDashboardData';
import { ROUTES } from '@/constants/routes';

export default function DashboardScreen() {
  const router = useRouter();
  const user = useCurrentUser();
  const {
    weather,
    latestAssessment,
    displayRiskLevel,
    displayRiskScore,
    displayAssessedAt,
    structuredRecommendations: safetySections,
    lastUpdated,
    isWeatherLoading,
    isWeatherRefreshing,
    isRiskLoading,
    isRiskRefreshing,
    secondsUntilRefresh,
    refreshIntervalSec,
    weatherError,
    riskError,
    refreshDashboard,
    retryWeather,
    retryRisk,
  } = useDashboardData();

  useEffect(() => {
    if (!user) {
      router.replace(ROUTES.LOGIN);
    }
  }, [user, router]);

  return (
    <ScreenContainer
      showTopAccent
      decorative
      refreshing={isWeatherRefreshing}
      onRefresh={() => refreshDashboard({ trigger: 'user' })}
    >
      <DashboardHeader userName={user?.fullName} lastUpdated={lastUpdated} />

      <DashboardWeatherPanel
        weather={weather}
        isLoading={isWeatherLoading}
        isRefreshing={isWeatherRefreshing}
        secondsUntilRefresh={secondsUntilRefresh}
        refreshIntervalSec={refreshIntervalSec}
        error={weatherError}
        onRetry={retryWeather}
      />

      <DashboardQuickActions />

      <DashboardRiskStatus
        riskLevel={displayRiskLevel}
        prediction={displayRiskScore}
        assessedAt={displayAssessedAt}
        assessmentId={latestAssessment.historyItem?.id}
        isLoading={isRiskLoading}
        isRefreshing={isRiskRefreshing}
        error={riskError}
        onRetry={retryRisk}
      />

      <SafetyRecommendations structuredSections={safetySections} />
    </ScreenContainer>
  );
}
