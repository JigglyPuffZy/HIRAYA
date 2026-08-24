import Constants from 'expo-constants';

type ExtraConfig = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  apiUrl?: string;
  allowCleartext?: boolean;
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExtraConfig;

const getEnv = (key: string, extraValue?: string, fallback = ''): string => {
  const fromProcess = process.env[key]?.trim();
  if (fromProcess) {
    return fromProcess;
  }

  const fromExtra = extraValue?.trim();
  if (fromExtra) {
    return fromExtra;
  }

  return fallback;
};

export const env = {
  apiUrl: getEnv('EXPO_PUBLIC_API_URL', extra.apiUrl),
  supabaseUrl: getEnv('EXPO_PUBLIC_SUPABASE_URL', extra.supabaseUrl),
  supabaseAnonKey: getEnv(
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    extra.supabaseAnonKey,
  ),
  /** Optional override: openmeteo | weatherapi | openweather */
  weatherProvider: getEnv('EXPO_PUBLIC_WEATHER_PROVIDER'),
  /** WeatherAPI.com — optional fallback when EXPO_PUBLIC_WEATHER_PROVIDER=weatherapi */
  weatherApiKey: getEnv('EXPO_PUBLIC_WEATHERAPI_KEY'),
  /** OpenWeatherMap — optional fallback when EXPO_PUBLIC_WEATHER_PROVIDER=openweather */
  openWeatherApiKey: getEnv('EXPO_PUBLIC_WEATHER_API_KEY'),
  defaultLatitude: getEnv('EXPO_PUBLIC_DEFAULT_LATITUDE'),
  defaultLongitude: getEnv('EXPO_PUBLIC_DEFAULT_LONGITUDE'),
  apiTimeoutMs: getEnv('EXPO_PUBLIC_API_TIMEOUT_MS', undefined, '30000'),
  devManualHeat: getEnv('EXPO_PUBLIC_DEV_MANUAL_HEAT') === 'true',
} as const;

export type WeatherProvider = 'openmeteo' | 'weatherapi' | 'openweather' | 'none';

export function getActiveWeatherProvider(): WeatherProvider {
  const forced = env.weatherProvider.toLowerCase();

  if (forced === 'weatherapi' && env.weatherApiKey.length > 0) {
    return 'weatherapi';
  }

  if (forced === 'openweather' && env.openWeatherApiKey.length > 0) {
    return 'openweather';
  }

  if (forced === 'openmeteo') {
    return 'openmeteo';
  }

  // Default: Open-Meteo for Tuguegarao (free, no key needed).
  return 'openmeteo';
}

export const isApiConfigured = (): boolean => env.apiUrl.length > 0;

export const isSupabaseConfigured = (): boolean =>
  env.supabaseUrl.length > 0 &&
  env.supabaseAnonKey.length > 0 &&
  !env.supabaseUrl.includes('placeholder');

/** True when EXPO_PUBLIC_API_URL points at Supabase Edge Functions. */
export const isSupabaseFunctionsApi = (): boolean =>
  /supabase\.co\/functions\/v1/i.test(env.apiUrl);

export const isWeatherApiConfigured = (): boolean =>
  getActiveWeatherProvider() !== 'none';

/** Alias used across the app */
export const isWeatherConfigured = isWeatherApiConfigured;

export function getWeatherConfigHint(): string {
  return 'Weather uses Open-Meteo for Tuguegarao by default. Optional: set EXPO_PUBLIC_WEATHER_PROVIDER to weatherapi or openweather with the matching API key.';
}
