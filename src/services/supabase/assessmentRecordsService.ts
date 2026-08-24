import { supabase } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/config/env';
import { AssessmentHistoryItem } from '@/types/assessmentHistory';
import { RiskResultPayload } from '@/types/prediction';
import { parseRiskResultPayload } from '@/utils/riskResultPayload';
import {
  AssessmentRecordSource,
  SupabaseAssessmentRecordRow,
} from '@/services/supabase/types';

export interface InsertAssessmentRecordInput {
  userId: string;
  payload: RiskResultPayload;
  source: AssessmentRecordSource;
}

function mapHistoryItem(row: SupabaseAssessmentRecordRow): AssessmentHistoryItem {
  return {
    id: row.id,
    assessedAt: row.assessed_at,
    riskLevel: row.risk_level,
    prediction: row.prediction,
    weatherSummary: row.weather_summary,
    model: row.model,
    modelVersion: row.model_version,
    source: row.source,
  };
}

function mapInsertError(message: string): Error {
  if (
    message.includes('source') ||
    message.includes('column') ||
    message.includes('schema cache')
  ) {
    return new Error(
      'Assessment history database is not ready. Run supabase/migrations/003_live_refresh_history.sql and 004_user_refresh_history.sql in the Supabase SQL Editor, then try again.',
    );
  }

  return new Error(`Unable to save assessment history to Supabase: ${message}`);
}

export const supabaseAssessmentRecordsService = {
  async insertRecord(input: InsertAssessmentRecordInput): Promise<string | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const { payload, source, userId } = input;
    const prediction = payload.prediction;

    const { data, error } = await supabase
      .from('assessment_records')
      .insert({
        user_id: userId,
        assessed_at: payload.submittedAt,
        risk_level: prediction.riskLevel,
        prediction: prediction.prediction,
        model: prediction.model,
        model_version: prediction.modelVersion,
        weather_summary: payload.weather.location,
        payload_json: JSON.stringify({ ...payload, source }),
        source,
      })
      .select('id')
      .single();

    if (error) {
      throw mapInsertError(error.message);
    }

    return data?.id ?? null;
  },

  async listRecords(userId: string, limit = 200): Promise<AssessmentHistoryItem[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    const { data, error } = await supabase
      .from('assessment_records')
      .select(
        'id, assessed_at, risk_level, prediction, model, model_version, weather_summary, source',
      )
      .eq('user_id', userId)
      .order('assessed_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw mapInsertError(error.message);
    }

    return (data as SupabaseAssessmentRecordRow[]).map(mapHistoryItem);
  },

  async getRecordPayload(
    userId: string,
    recordId: string,
  ): Promise<RiskResultPayload | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const { data, error } = await supabase
      .from('assessment_records')
      .select('payload_json, user_id')
      .eq('id', recordId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw mapInsertError(error.message);
    }

    if (!data?.payload_json) {
      return null;
    }

    try {
      return parseRiskResultPayload(JSON.parse(data.payload_json as string));
    } catch {
      return null;
    }
  },
};
