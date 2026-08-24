import { useCallback, useEffect, useState } from 'react';

import { assessmentHistoryService } from '@/services/assessmentHistoryService';

import { localAssessmentService } from '@/services/localAssessmentService';

import { supabaseAssessmentRecordsService } from '@/services/supabase/assessmentRecordsService';

import { useAuth } from '@/hooks/useAuth';

import { isApiConfigured, isSupabaseConfigured } from '@/config/env';

import {

  AssessmentHistoryError,

  AssessmentHistoryItem,

  AssessmentHistoryLoadState,

} from '@/types/assessmentHistory';



function mapLocalRecords(userId: string): Promise<AssessmentHistoryItem[]> {

  return localAssessmentService.listAssessments(userId).then((records) =>

    records.map((record) => ({

      id: record.id,

      riskLevel: record.payload.prediction.riskLevel,

      prediction: record.payload.prediction.prediction,

      assessedAt: record.payload.submittedAt,

      weatherSummary: record.payload.weather.location,

      model: record.payload.prediction.model,

      source: record.payload.source,

    })),

  );

}



export function useAssessmentHistory() {

  const { session } = useAuth();

  const [items, setItems] = useState<AssessmentHistoryItem[]>([]);

  const [loadState, setLoadState] = useState<AssessmentHistoryLoadState>('idle');

  const [error, setError] = useState<string | null>(null);



  useEffect(() => {

    setItems([]);

    setLoadState('idle');

    setError(null);

  }, [session?.user.id]);



  const fetchHistory = useCallback(async () => {

    if (!session?.user.id) {

      setItems([]);

      setLoadState('empty');

      return [];

    }



    setLoadState('loading');

    setError(null);



    try {

      if (isSupabaseConfigured()) {

        const remoteHistory = await supabaseAssessmentRecordsService.listRecords(

          session.user.id,

        );



        if (remoteHistory.length > 0) {

          setItems(remoteHistory);

          setLoadState('success');

          return remoteHistory;

        }

      }



      const localHistory = await mapLocalRecords(session.user.id);



      if (localHistory.length > 0 || !isApiConfigured() || !session.token) {

        setItems(localHistory);

        setLoadState(localHistory.length > 0 ? 'success' : 'empty');

        return localHistory;

      }



      const history = await assessmentHistoryService.getCompletedAssessments(

        session.token,

      );



      setItems(history);

      setLoadState(history.length > 0 ? 'success' : 'empty');

      return history;

    } catch (err) {

      const localFallback = await mapLocalRecords(session.user.id);



      if (localFallback.length > 0) {

        setItems(localFallback);

        setLoadState('success');

        return localFallback;

      }



      const message =

        err instanceof AssessmentHistoryError

          ? err.message

          : err instanceof Error

            ? err.message

            : 'Unable to load assessment history.';



      setError(message);

      setItems([]);

      setLoadState('error');

      return [];

    }

  }, [session?.token, session?.user.id]);



  const retry = useCallback(async () => {

    await fetchHistory();

  }, [fetchHistory]);



  return {

    items,

    loadState,

    error,

    isLoading: loadState === 'loading',

    isEmpty: loadState === 'empty',

    isError: loadState === 'error',

    fetchHistory,

    retry,

  };

}

