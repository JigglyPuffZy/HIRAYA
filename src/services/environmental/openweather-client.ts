import { env } from '@/config/env';
import { STUDY_AREA, STUDY_AREA_LABEL } from '@/constants/study-area';
import { resolveHeatIndexC } from '@/services/environmental/pagasa/heat-index-calculator';
import { CurrentWeatherSnapshot, HeatReading } from '@/types/environmental';
import { ApiError } from '@/types/api';

const OPEN_WEATHER_BASE = 'https://api.openweathermap.org/data/2.5/weather';

interface OpenWeatherResponse {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  wind: {
    speed: number;
    deg?: number;
  };
  weather: Array<{ main: string; description: string }>;
}

function mapOpenWeatherResponse(payload: OpenWeatherResponse): {
  weather: CurrentWeatherSnapshot;
  heatReading: HeatReading;
} {
  const heatIndex = resolveHeatIndexC({
    tempC: payload.main.temp,
    humidity: payload.main.humidity,
    feelsLikeC: payload.main.feels_like,
  });

  const capturedAt = new Date().toISOString();
  const windKph = Math.round(payload.wind.speed * 3.6 * 10) / 10;

  const heatReading: HeatReading = {
    heatIndex,
    latitude: STUDY_AREA.latitude,
    longitude: STUDY_AREA.longitude,
    capturedAt,
    status: 'live',
  };

  const weather: CurrentWeatherSnapshot = {
    location: payload.name || STUDY_AREA_LABEL,
    temperature: payload.main.temp,
    feelsLike: payload.main.feels_like,
    humidity: payload.main.humidity,
    heatIndex,
    condition: payload.weather[0]?.main ?? 'Unknown',
    description: payload.weather[0]?.description ?? '',
    windKph,
    windDir: payload.wind.deg !== undefined ? `${payload.wind.deg}°` : 'N/A',
    updatedAt: capturedAt,
  };

  return { weather, heatReading };
}

/** OpenWeather fallback using EXPO_PUBLIC_WEATHER_API_KEY */
export async function fetchOpenWeatherCurrent(): Promise<{
  weather: CurrentWeatherSnapshot;
  heatReading: HeatReading;
}> {
  if (!env.openWeatherApiKey) {
    throw new ApiError(
      'OpenWeather is not configured. Set EXPO_PUBLIC_WEATHER_API_KEY in .env',
      0,
    );
  }

  const params = new URLSearchParams({
    lat: String(STUDY_AREA.latitude),
    lon: String(STUDY_AREA.longitude),
    appid: env.openWeatherApiKey,
    units: 'metric',
  });

  let response: Response;

  try {
    response = await fetch(`${OPEN_WEATHER_BASE}?${params.toString()}`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Weather request failed';
    throw new ApiError(message, 0);
  }

  if (response.status === 401) {
    throw new ApiError(
      'Invalid OpenWeather API key. Check EXPO_PUBLIC_WEATHER_API_KEY in .env',
      response.status,
    );
  }

  if (!response.ok) {
    throw new ApiError(
      `OpenWeather request failed (${response.status})`,
      response.status,
    );
  }

  const payload = (await response.json()) as OpenWeatherResponse;
  return mapOpenWeatherResponse(payload);
}
