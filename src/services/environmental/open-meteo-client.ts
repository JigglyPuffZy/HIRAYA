import {
  OPEN_METEO_FORECAST_URL,
  OPEN_METEO_TIMEZONE,
  STUDY_AREA,
  STUDY_AREA_LABEL,
} from '@/constants/study-area';
import { resolveHeatIndexC } from '@/services/environmental/pagasa/heat-index-calculator';
import { resolveWbgtC } from '@/services/environmental/wbgt-calculator';
import { CurrentWeatherSnapshot, HeatReading } from '@/types/environmental';
import { ApiError } from '@/types/api';

const CURRENT_FIELDS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'precipitation',
  'weather_code',
  'wind_speed_10m',
] as const;

interface OpenMeteoCurrent {
  time: string;
  interval: number;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  precipitation: number;
  weather_code: number;
  wind_speed_10m: number;
}

interface OpenMeteoForecastResponse {
  current?: OpenMeteoCurrent;
}

/** WMO weather interpretation codes (Open-Meteo). */
const WMO_WEATHER_LABELS: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

export function describeWmoWeatherCode(code: number): string {
  return WMO_WEATHER_LABELS[code] ?? 'Unknown';
}

export function buildOpenMeteoForecastUrl(
  latitude = STUDY_AREA.latitude,
  longitude = STUDY_AREA.longitude,
): string {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: CURRENT_FIELDS.join(','),
    timezone: OPEN_METEO_TIMEZONE,
  });

  return `${OPEN_METEO_FORECAST_URL}?${params.toString()}`;
}

function mapOpenMeteoResponse(payload: OpenMeteoForecastResponse): {
  weather: CurrentWeatherSnapshot;
  heatReading: HeatReading;
} {
  const current = payload.current;

  if (!current) {
    throw new ApiError('Open-Meteo response did not include current conditions.', 0);
  }

  const condition = describeWmoWeatherCode(current.weather_code);
  const heatIndex = resolveHeatIndexC({
    tempC: current.temperature_2m,
    humidity: current.relative_humidity_2m,
    feelsLikeC: current.apparent_temperature,
  });
  const wbgt = resolveWbgtC({
    tempC: current.temperature_2m,
    humidity: current.relative_humidity_2m,
  });

  const capturedAt = new Date().toISOString();

  const heatReading: HeatReading = {
    heatIndex,
    wbgt,
    latitude: STUDY_AREA.latitude,
    longitude: STUDY_AREA.longitude,
    capturedAt,
    status: 'live',
  };

  const weather: CurrentWeatherSnapshot = {
    location: STUDY_AREA_LABEL,
    temperature: current.temperature_2m,
    feelsLike: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    heatIndex,
    wbgt,
    condition,
    description: condition.toLowerCase(),
    windKph: current.wind_speed_10m,
    windDir: 'N/A',
    updatedAt: capturedAt,
  };

  return { weather, heatReading };
}

/**
 * Open-Meteo forecast API for Tuguegarao — free, no API key required.
 * @see https://open-meteo.com/en/docs
 */
export async function fetchOpenMeteoCurrent(): Promise<{
  weather: CurrentWeatherSnapshot;
  heatReading: HeatReading;
}> {
  const url = buildOpenMeteoForecastUrl();

  let response: Response;

  try {
    response = await fetch(url);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Open-Meteo request failed';
    throw new ApiError(message, 0);
  }

  if (!response.ok) {
    throw new ApiError(
      `Open-Meteo request failed (${response.status})`,
      response.status,
    );
  }

  const payload = (await response.json()) as OpenMeteoForecastResponse;
  return mapOpenMeteoResponse(payload);
}
