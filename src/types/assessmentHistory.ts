/**
 * Summary item returned by the backend assessment history endpoint.
 */
export interface AssessmentHistoryItem {
  id: string;
  assessedAt: string;
  riskLevel: string;
  prediction?: number;
  weatherSummary?: string;
  model?: string;
  modelVersion?: string;
  source?: 'live_refresh' | 'user_refresh' | 'manual_assessment';
}

export class AssessmentHistoryError extends Error {
  constructor(
    message: string,
    public code:
      | 'NETWORK_ERROR'
      | 'HTTP_ERROR'
      | 'MALFORMED_RESPONSE'
      | 'NOT_FOUND'
      | 'UNAUTHORIZED',
    public status?: number,
  ) {
    super(message);
    this.name = 'AssessmentHistoryError';
  }
}

export type AssessmentHistoryLoadState =
  | 'idle'
  | 'loading'
  | 'success'
  | 'error'
  | 'empty';
