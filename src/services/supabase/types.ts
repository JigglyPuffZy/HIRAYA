export type AssessmentRecordSource =
  | 'live_refresh'
  | 'user_refresh'
  | 'manual_assessment';

export interface SupabaseAssessmentRecordRow {
  id: string;
  user_id: string;
  assessed_at: string;
  risk_level: string;
  prediction: number;
  model: string;
  model_version: string;
  weather_summary: string;
  payload_json: string;
  source: AssessmentRecordSource;
  created_at: string;
}
