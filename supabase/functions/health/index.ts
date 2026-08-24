const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

Deno.serve((_req) => {
  return new Response(
    JSON.stringify({
      status: 'ok',
      modelReady: true,
      supabaseConfigured: true,
      provider: 'supabase-edge',
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  );
});
