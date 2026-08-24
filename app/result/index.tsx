import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Header } from '@/components/layout/Header';
import { RiskResultView } from '@/components/result/RiskResultView';
import { PredictionUnavailableState } from '@/components/result/PredictionUnavailableState';
import { ResultSkeleton } from '@/components/ui/ContentSkeletons';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Button } from '@/components/ui/Button';
import { assessmentHistoryService } from '@/services/assessmentHistoryService';
import { localAssessmentService } from '@/services/localAssessmentService';
import { supabaseAssessmentRecordsService } from '@/services/supabase/assessmentRecordsService';
import { useAuth } from '@/hooks/useAuth';
import { isApiConfigured, isSupabaseConfigured } from '@/config/env';
import { AssessmentHistoryError } from '@/types/assessmentHistory';
import { RiskResultPayload } from '@/types/prediction';
import { parseRiskResultPayload } from '@/utils/riskResultPayload';
import { ROUTES } from '@/constants/routes';
import { Spacing } from '@/constants/theme';

export default function ResultScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const params = useLocalSearchParams<{ id?: string; payload?: string }>();
  const [payload, setPayload] = useState<RiskResultPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadResult = async () => {
      setIsLoading(true);
      setError(null);

      if (params.payload) {
        const parsed = parseRiskResultPayload(params.payload);

        if (mounted) {
          setPayload(parsed);
          setIsLoading(false);

          if (!parsed) {
            setError('The assessment result is invalid or incomplete.');
          }
        }

        return;
      }

      if (!params.id || !session?.user.id) {
        if (mounted) {
          setPayload(null);
          setError('Assessment result not found.');
          setIsLoading(false);
        }
        return;
      }

      const localRecord = await localAssessmentService.getAssessmentById(
        session.user.id,
        params.id,
      );

      if (localRecord && mounted) {
        setPayload(localRecord.payload);
        setIsLoading(false);
        return;
      }

      if (isSupabaseConfigured()) {
        try {
          const remotePayload = await supabaseAssessmentRecordsService.getRecordPayload(
            session.user.id,
            params.id,
          );

          if (remotePayload && mounted) {
            setPayload(remotePayload);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          if (mounted) {
            setPayload(null);
            setError(
              err instanceof Error
                ? err.message
                : 'Unable to load assessment result.',
            );
            setIsLoading(false);
          }
          return;
        }
      }

      if (!isApiConfigured() || !session.token) {
        if (mounted) {
          setPayload(null);
          setError('Assessment result not found.');
          setIsLoading(false);
        }
        return;
      }

      try {
        const detail = await assessmentHistoryService.getAssessmentDetail(
          params.id,
          session.token,
        );

        if (mounted) {
          setPayload(detail);
        }
      } catch (err) {
        if (mounted) {
          setPayload(null);
          setError(
            err instanceof AssessmentHistoryError
              ? err.message
              : 'Unable to load assessment result.',
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadResult();

    return () => {
      mounted = false;
    };
  }, [params.id, params.payload, session?.token, session?.user.id]);

  const hasValidPrediction = payload !== null;

  return (
    <ScreenContainer decorative contentStyle={styles.content}>
      <Header
        title="Your Risk Result"
        subtitle="Personalized from live weather and your check-in."
        showBack
      />

      {isLoading ? (
        <>
          <LoadingSpinner message="Loading result..." variant="card" icon="shield-checkmark-outline" size="md" />
          <ResultSkeleton />
        </>
      ) : null}

      {!isLoading && error ? <ErrorMessage message={error} /> : null}

      {!isLoading && hasValidPrediction ? (
        <RiskResultView payload={payload} />
      ) : null}

      {!isLoading && !hasValidPrediction && !error ? (
        <PredictionUnavailableState />
      ) : null}

      {!isLoading && hasValidPrediction ? (
        <View style={styles.actions}>
          <Button
            title="New Assessment"
            onPress={() => router.push(ROUTES.ASSESSMENT)}
            fullWidth
            size="lg"
            accessibilityLabel="Perform new assessment"
          />
          <Button
            title="Back to Dashboard"
            variant="outline"
            fullWidth
            onPress={() => router.replace(ROUTES.DASHBOARD)}
            accessibilityLabel="Back to dashboard"
          />
        </View>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  actions: {
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
});
