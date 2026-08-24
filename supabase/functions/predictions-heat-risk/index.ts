import { scoreToRiskLevel, recommendationsForLevel } from '../_shared/risk.ts';
import { predictProbability } from '../_shared/scorer.ts';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Authentication required.' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let body: {
    assessment?: Record<string, unknown>;
    weather?: Record<string, unknown>;
    profile?: Record<string, unknown>;
  };

  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const probability = predictProbability({
    assessment: body.assessment ?? {},
    weather: body.weather ?? {},
    profile: body.profile ?? {},
  });
  const riskLevel = scoreToRiskLevel(probability);
  const timestamp = new Date().toISOString();

  return new Response(
    JSON.stringify({
      prediction: Number(probability.toFixed(4)),
      riskLevel,
      model: 'HIRAYA-Supabase',
      modelVersion: 'edge-1.0.0',
      timestamp,
      recommendations: recommendationsForLevel(riskLevel),
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  );
});
