import { isSupabaseFunctionsApi } from '@/config/env';

export const API_ENDPOINTS = {
  assessment: {
    history: '/assessments/history',
    detail: (id: string) => `/assessments/${id}`,
  },
  prediction: {
    // Supabase Edge Function name cannot contain `/predictions/heat-risk`
    heatRisk: isSupabaseFunctionsApi()
      ? '/predictions-heat-risk'
      : '/predictions/heat-risk',
  },
} as const;
