import { env, isApiConfigured, isSupabaseFunctionsApi } from '@/config/env';
import { API_ENDPOINTS } from '@/api/endpoints';
import { ApiError, ApiErrorBody } from '@/types/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal;
  timeoutMs?: number;
}

const buildUrl = (path: string): string => {
  if (!isApiConfigured()) {
    throw new ApiError(
      'API URL is not configured. Set EXPO_PUBLIC_API_URL in your environment.',
      0,
    );
  }

  const base = env.apiUrl.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

const parseErrorBody = async (
  response: Response,
): Promise<ApiErrorBody | undefined> => {
  try {
    return (await response.json()) as ApiErrorBody;
  } catch {
    return undefined;
  }
};

const resolveTimeoutMs = (timeoutMs?: number): number => {
  if (timeoutMs !== undefined && timeoutMs > 0) {
    return timeoutMs;
  }

  const configured = Number(env.apiTimeoutMs);
  return Number.isFinite(configured) && configured > 0 ? configured : 30000;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, token, signal, timeoutMs } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), resolveTimeoutMs(timeoutMs));

  const abortFromParent = () => controller.abort();
  signal?.addEventListener('abort', abortFromParent);

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Supabase Edge Functions require the project anon key on every request.
  if (isSupabaseFunctionsApi() && env.supabaseAnonKey) {
    headers.apikey = env.supabaseAnonKey;
    if (!headers.Authorization) {
      headers.Authorization = `Bearer ${env.supabaseAnonKey}`;
    }
  }

  let response: Response;

  try {
    response = await fetch(buildUrl(path), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(
        'The request timed out before the server responded.',
        408,
      );
    }

    const message =
      error instanceof Error ? error.message : 'Network request failed';
    const isLocalHost =
      env.apiUrl.includes('127.0.0.1') || env.apiUrl.includes('localhost');

    if (isLocalHost) {
      throw new ApiError(
        'Cannot reach the backend. On a phone, 127.0.0.1 points to the phone itself — not your PC. Set EXPO_PUBLIC_API_URL to your PC LAN IP in .env (example: http://10.41.89.88:8000), then run: npx expo start --clear',
        0,
      );
    }

    throw new ApiError(
      `Cannot reach the backend at ${env.apiUrl}. Original error: ${message}`,
      0,
    );
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abortFromParent);
  }

  if (!response.ok) {
    const errorBody = await parseErrorBody(response);
    const message =
      errorBody?.message ??
      errorBody?.error ??
      `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, errorBody);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export { API_ENDPOINTS };
