import { useCallback, useState } from 'react';
import { assessmentSubmissionService } from '@/services/assessmentSubmissionService';
import { authService } from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';
import { ASSESSMENT_STEP_MIN_MS } from '@/constants/liveRefresh';
import {
  AssessmentSubmissionError,
  AssessmentSubmissionStep,
} from '@/types/assessment';
import { RiskResultPayload } from '@/types/prediction';

export function useAssessmentSubmission() {
  const { session } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] =
    useState<AssessmentSubmissionStep>('idle');
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const clearSubmissionError = useCallback(() => {
    setSubmissionError(null);
  }, []);

  const submitAssessment = useCallback(
    async (
      userInputs: Record<string, string | number | boolean>,
    ): Promise<RiskResultPayload> => {
      const freshSession = (await authService.getStoredSession()) ?? session;

      if (!freshSession?.token || !freshSession.user.id) {
        const error = new AssessmentSubmissionError(
          'You must be signed in to submit an assessment.',
          'UNAUTHORIZED',
        );
        setSubmissionError(error.message);
        throw error;
      }

      setIsSubmitting(true);
      setSubmissionError(null);

      try {
        setSubmissionStep('fetching_weather');

        const result = await assessmentSubmissionService.submitForPrediction(
          userInputs,
          freshSession.token,
          freshSession.user.id,
          (step) => setSubmissionStep(step),
        );

        setSubmissionStep('complete');
        await new Promise((resolve) =>
          setTimeout(resolve, ASSESSMENT_STEP_MIN_MS.complete),
        );
        return result;
      } catch (error) {
        if (error instanceof AssessmentSubmissionError) {
          setSubmissionError(error.message);
          throw error;
        }

        const fallback = new AssessmentSubmissionError(
          'An unexpected error occurred while requesting a prediction.',
          'BACKEND_FAILURE',
        );
        setSubmissionError(fallback.message);
        throw fallback;
      } finally {
        setIsSubmitting(false);
        setSubmissionStep('idle');
      }
    },
    [session],
  );

  return {
    submitAssessment,
    isSubmitting,
    submissionStep,
    submissionError,
    clearSubmissionError,
  };
}
