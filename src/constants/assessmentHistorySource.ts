export type AssessmentHistorySource =
  | 'live_refresh'
  | 'user_refresh'
  | 'manual_assessment';

export type RefreshTrigger = 'auto' | 'user' | 'silent';

export interface RefreshHeatDataOptions {
  trigger?: RefreshTrigger;
}

export function refreshSourceFromTrigger(
  trigger: RefreshTrigger,
): Extract<AssessmentHistorySource, 'live_refresh' | 'user_refresh'> | null {
  switch (trigger) {
    case 'auto':
      return 'live_refresh';
    case 'user':
      return 'user_refresh';
    case 'silent':
      return null;
    default:
      return 'live_refresh';
  }
}
