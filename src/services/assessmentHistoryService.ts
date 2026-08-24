import { apiRequest, API_ENDPOINTS } from '@/api/client';
import { ApiError } from '@/types/api';
import {
  AssessmentHistoryError,
  AssessmentHistoryItem,
} from '@/types/assessmentHistory';
import { RiskResultPayload } from '@/types/prediction';
import {
  validateAssessmentHistoryDetail,
  validateAssessmentHistoryList,
} from '@/utils/assessmentHistoryValidation';

function mapApiError(error: ApiError): AssessmentHistoryError {
  if (error.status === 0) {
    return new AssessmentHistoryError(
      error.message || 'Unable to reach the assessment history service.',
      'NETWORK_ERROR',
      error.status,
    );
  }

  if (error.status === 401 || error.status === 403) {
    return new AssessmentHistoryError(
      'Your session has expired. Please sign in again.',
      'UNAUTHORIZED',
      error.status,
    );
  }

  if (error.status === 404) {
    return new AssessmentHistoryError(
      'Assessment record not found.',
      'NOT_FOUND',
      error.status,
    );
  }

  return new AssessmentHistoryError(
    error.message || `History request failed with status ${error.status}.`,
    'HTTP_ERROR',
    error.status,
  );
}

export const assessmentHistoryService = {
  async getCompletedAssessments(
    token: string,
  ): Promise<AssessmentHistoryItem[]> {
    let response: unknown;

    try {
      response = await apiRequest<unknown>(API_ENDPOINTS.assessment.history, {
        token,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw mapApiError(error);
      }

      throw new AssessmentHistoryError(
        'Unable to load assessment history.',
        'NETWORK_ERROR',
      );
    }

    return validateAssessmentHistoryList(response);
  },

  async getAssessmentDetail(
    id: string,
    token: string,
  ): Promise<RiskResultPayload> {
    let response: unknown;

    try {
      response = await apiRequest<unknown>(
        API_ENDPOINTS.assessment.detail(id),
        { token },
      );
    } catch (error) {
      if (error instanceof ApiError) {
        throw mapApiError(error);
      }

      throw new AssessmentHistoryError(
        'Unable to load assessment details.',
        'NETWORK_ERROR',
      );
    }

    const detail = validateAssessmentHistoryDetail(response);

    if (!detail) {
      throw new AssessmentHistoryError(
        'The assessment detail response was malformed.',
        'MALFORMED_RESPONSE',
      );
    }

    return detail;
  },
};
