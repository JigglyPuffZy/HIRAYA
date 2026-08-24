import { env, getWeatherConfigHint, isWeatherApiConfigured } from '@/config/env';
import {
  STUDY_AREA,
  STUDY_AREA_LABEL,
  WEATHERAPI_CURRENT_URL,
  WEATHERAPI_LOCATION_QUERIES,
} from '@/constants/study-area';
import { resolveHeatIndexC } from '@/services/environmental/pagasa/heat-index-calculator';
import { CurrentWeatherSnapshot, HeatReading } from '@/types/environmental';
import { ApiError } from '@/types/api';

interface WeatherApiCurrentResponse {
  location: { name: string; region: string; localtime: string };
  current: {
    temp_c: number;
    feelslike_c: number;
    heatindex_c?: number;
    humidity: number;
    wind_kph: number;
    wind_dir: string;
    last_updated: string;
    condition: { text: string };
  };
}

function buildCurrentUrl(query: string): string {
  const params = new URLSearchParams({
    key: env.weatherApiKey,
    q: query,
    aqi: 'no',
  });

  return `${WEATHERAPI_CURRENT_URL}?${params.toString()}`;
}

function mapResponse(payload: WeatherApiCurrentResponse): {
  weather: CurrentWeatherSnapshot;
  heatReading: HeatReading;
} {
  const current = payload.current;

  const heatIndex = resolveHeatIndexC({
    tempC: current.temp_c,
    humidity: current.humidity,
    heatIndexC: current.heatindex_c,
    feelsLikeC: current.feelslike_c,
  });

  const capturedAt = new Date().toISOString();
  const apiLocation = payload.location.name
    ? `${payload.location.name}${payload.location.region ? `, ${payload.location.region}` : ''}`
    : STUDY_AREA_LABEL;

  const heatReading: HeatReading = {
    heatIndex,
    latitude: STUDY_AREA.latitude,
    longitude: STUDY_AREA.longitude,
    capturedAt,
    status: 'live',
  };

  const weather: CurrentWeatherSnapshot = {
    location: apiLocation,
    temperature: current.temp_c,
    feelsLike: current.feelslike_c,
    humidity: current.humidity,
    heatIndex,
    condition: current.condition.text,
    description: current.condition.text,
    windKph: current.wind_kph,
    windDir: current.wind_dir,
    updatedAt: current.last_updated || capturedAt,
  };

  return { weather, heatReading };
}

async function requestCurrent(query: string): Promise<WeatherApiCurrentResponse> {
  let response: Response;

  try {
    response = await fetch(buildCurrentUrl(query));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Weather request failed';
    throw new ApiError(message, 0);
  }

  if (response.status === 401 || response.status === 403) {
    throw new ApiError(
      'Invalid WeatherAPI key. Set EXPO_PUBLIC_WEATHERAPI_KEY in .env and restart Expo.',
      response.status,
    );
  }

  if (!response.ok) {
    throw new ApiError(
      `WeatherAPI request failed (${response.status}) for q=${query}`,
      response.status,
    );
  }

  return (await response.json()) as WeatherApiCurrentResponse;
}

/**
 * GET https://api.weatherapi.com/v1/current.json?key=...&q=17.6131,121.7269&aqi=no
 * Falls back to q=Tuguegarao if the coordinate query fails.
 */
export async function fetchWeatherApiCurrent(): Promise<{
  weather: CurrentWeatherSnapshot;
  heatReading: HeatReading;
}> {
  if (!isWeatherApiConfigured() || !env.weatherApiKey) {
    throw new ApiError(getWeatherConfigHint(), 0);
  }

  let lastError: ApiError | null = null;

  for (const query of WEATHERAPI_LOCATION_QUERIES) {
    try {
      const payload = await requestCurrent(query);
      return mapResponse(payload);
    } catch (error) {
      if (error instanceof ApiError) {
        lastError = error;
        if (error.status === 401 || error.status === 403) {
          throw error;
        }
        continue;
      }

      throw error;
    }
  }

  throw (
    lastError ??
    new ApiError('Unable to fetch weather data from WeatherAPI.com', 0)
  );
}
