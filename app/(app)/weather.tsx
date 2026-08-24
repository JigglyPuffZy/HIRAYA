import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Header } from '@/components/layout/Header';
import { WeatherCard } from '@/components/weather/WeatherCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { WeatherPanelSkeleton } from '@/components/ui/ContentSkeletons';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { LiveRefreshStatus } from '@/components/ui/LiveRefreshStatus';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { AppText } from '@/components/ui/AppText';
import { useHirayaWeather } from '@/context/HirayaContext';
import { STUDY_AREA, STUDY_AREA_LABEL } from '@/constants/study-area';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

export default function WeatherScreen() {
  const { colors } = useTheme();
  const {
    weather,
    heatDataSource,
    isLoading,
    isRefreshing,
    secondsUntilRefresh,
    refreshIntervalSec,
    error,
    refreshHeatData,
  } = useHirayaWeather();

  const handleFetch = useCallback(async () => {
    await refreshHeatData({ trigger: 'user' });
  }, [refreshHeatData]);

  const styles = StyleSheet.create({
    content: {
      gap: Spacing.lg,
      paddingBottom: Spacing.xl,
    },
    locationCard: {
      marginBottom: 0,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    locationIcon: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.md,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    locationText: {
      flex: 1,
      gap: 2,
    },
    note: {
      lineHeight: 20,
    },
  });

  return (
    <ScreenContainer
      contentStyle={styles.content}
      refreshing={isRefreshing}
      onRefresh={handleFetch}
    >
      <Header
        title="Live Weather"
        subtitle="Real-time conditions for the Tuguegarao study area."
        showBack
      />

      <Card variant="soft" style={styles.locationCard}>
        <View style={styles.locationRow}>
          <View style={styles.locationIcon}>
            <Ionicons name="location" size={18} color={colors.primary} />
          </View>
          <View style={styles.locationText}>
            <AppText variant="label">{STUDY_AREA_LABEL}</AppText>
            <AppText variant="caption" muted>
              {STUDY_AREA.latitude}, {STUDY_AREA.longitude}
            </AppText>
          </View>
        </View>
      </Card>

      {!isLoading && (weather || isRefreshing) ? (
        <LiveRefreshStatus
          variant="panel"
          isRefreshing={isRefreshing}
          secondsUntilRefresh={secondsUntilRefresh}
          intervalSec={refreshIntervalSec}
        />
      ) : null}

      <Button
        title={isRefreshing ? 'Refreshing...' : 'Refresh Now'}
        onPress={handleFetch}
        loading={isRefreshing}
        disabled={isRefreshing}
        fullWidth
      />

      {isLoading ? (
        <>
          <LoadingSpinner message="Fetching live weather..." variant="card" icon="partly-sunny-outline" />
          <WeatherPanelSkeleton />
        </>
      ) : null}
      {error ? <ErrorMessage message={error} /> : null}
      {weather ? <WeatherCard weather={weather} isRefreshing={isRefreshing} /> : null}

      {heatDataSource === 'cached' ? (
        <AppText variant="caption" muted style={styles.note}>
          Showing cached data from your last refresh. Tap Refresh Now for the latest conditions.
        </AppText>
      ) : null}
    </ScreenContainer>
  );
}
