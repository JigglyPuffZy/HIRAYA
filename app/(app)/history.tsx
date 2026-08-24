import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Href, useFocusEffect, useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Header } from '@/components/layout/Header';
import { AssessmentHistoryList } from '@/components/history/AssessmentHistoryList';
import { AssessmentHistoryEmptyState } from '@/components/history/AssessmentHistoryEmptyState';
import { HistoryListSkeleton } from '@/components/ui/ContentSkeletons';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Button } from '@/components/ui/Button';
import { useAssessmentHistory } from '@/hooks/useAssessmentHistory';
import { AssessmentHistoryItem } from '@/types/assessmentHistory';
import { ROUTES } from '@/constants/routes';
import { Spacing } from '@/constants/theme';

export default function HistoryScreen() {
  const router = useRouter();
  const {
    items,
    isLoading,
    isEmpty,
    isError,
    error,
    fetchHistory,
    retry,
  } = useAssessmentHistory();

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory]),
  );

  const handleSelect = (item: AssessmentHistoryItem) => {
    router.push({
      pathname: ROUTES.RESULT,
      params: { id: item.id },
    } as Href);
  };

  return (
    <ScreenContainer>
      <Header
        title="History"
        subtitle="Review your past heat risk assessments."
        showBack
      />

      {isLoading ? (
        <>
          <LoadingSpinner message="Loading history..." variant="card" icon="time-outline" size="md" />
          <HistoryListSkeleton />
        </>
      ) : null}

      {isError && error ? (
        <View style={styles.stateBlock}>
          <ErrorMessage message={error} />
          <Button
            title="Retry"
            variant="outline"
            onPress={retry}
            accessibilityLabel="Retry loading assessment history"
          />
        </View>
      ) : null}

      {!isLoading && !isError && isEmpty ? <AssessmentHistoryEmptyState /> : null}

      {!isLoading && !isError && items.length > 0 ? (
        <AssessmentHistoryList items={items} onSelect={handleSelect} />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  stateBlock: {
    gap: Spacing.md,
  },
});
