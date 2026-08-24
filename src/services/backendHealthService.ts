import { env, isApiConfigured, isSupabaseFunctionsApi } from '@/config/env';

export interface BackendHealthResult {
  ok: boolean;
  message: string;
  url: string;
}

let reachabilityCache: { ok: boolean; checkedAt: number } | null = null;
const REACHABILITY_CACHE_MS = 60_000;

function healthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { Accept: 'application/json' };

  if (isSupabaseFunctionsApi() && env.supabaseAnonKey) {
    headers.apikey = env.supabaseAnonKey;
    headers.Authorization = `Bearer ${env.supabaseAnonKey}`;
  }

  return headers;
}

/** Fast ping (1.5s) — skips slow ML calls when backend is offline. */
export async function isBackendQuicklyReachable(
  timeoutMs = 1500,
): Promise<boolean> {
  if (!isApiConfigured()) {
    return false;
  }

  const now = Date.now();
  if (
    reachabilityCache &&
    now - reachabilityCache.checkedAt < REACHABILITY_CACHE_MS
  ) {
    return reachabilityCache.ok;
  }

  const base = env.apiUrl.replace(/\/$/, '');
  const url = `${base}/health`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      method: 'GET',
      headers: healthHeaders(),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const ok = response.ok;
    reachabilityCache = { ok, checkedAt: now };
    return ok;
  } catch {
    reachabilityCache = { ok: false, checkedAt: now };
    return false;
  }
}

export async function testBackendConnection(): Promise<BackendHealthResult> {
  if (!isApiConfigured()) {
    return {
      ok: false,
      message: 'EXPO_PUBLIC_API_URL is not set in .env',
      url: '',
    };
  }

  const base = env.apiUrl.replace(/\/$/, '');
  const url = `${base}/health`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      method: 'GET',
      headers: healthHeaders(),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return {
        ok: false,
        message: `Backend responded with status ${response.status}`,
        url,
      };
    }

    const body = (await response.json()) as { status?: string };
    if (body.status === 'ok') {
      return {
        ok: true,
        message: isSupabaseFunctionsApi()
          ? 'Supabase ML Edge Function is reachable.'
          : 'Backend is reachable from this device.',
        url,
      };
    }

    return {
      ok: false,
      message: 'Unexpected health response from backend.',
      url,
    };
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : 'Network request failed';

    return {
      ok: false,
      message: `Cannot reach ${url}. (${detail})`,
      url,
    };
  }
}
