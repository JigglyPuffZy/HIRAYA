import { STORAGE_KEYS } from '@/constants/storageKeys';
import { fetchOpenMeteoCurrent } from '@/services/environmental/open-meteo-client';
import { fetchOpenWeatherCurrent } from '@/services/environmental/openweather-client';
import { fetchWeatherApiCurrent } from '@/services/environmental/weatherapi-client';
import { resolveWbgtC } from '@/services/environmental/wbgt-calculator';
import { storageService } from '@/services/storageService';
import {
  getActiveWeatherProvider,
  getWeatherConfigHint,
} from '@/config/env';
import {
  CurrentWeatherSnapshot,
  EnvironmentalSnapshot,
  HeatReading,
} from '@/types/environmental';
import { ApiError } from '@/types/api';

interface CachedEnvironmentalPayload {
  heatReading: HeatReading;
  weather: CurrentWeatherSnapshot;
}

function withResolvedWbgt(
  weather: CurrentWeatherSnapshot,
  heatReading: HeatReading,
): { weather: CurrentWeatherSnapshot; heatReading: HeatReading } {
  const wbgt = resolveWbgtC({
    tempC: weather.temperature,
    humidity: weather.humidity,
    wbgtC: weather.wbgt,
  });

  return {
    weather: { ...weather, wbgt },
    heatReading: { ...heatReading, wbgt },
  };
}

function validateSnapshot(
  payload: CachedEnvironmentalPayload | null,
): EnvironmentalSnapshot | null {
  if (!payload?.heatReading || !payload?.weather) {
    return null;
  }

  const resolved = withResolvedWbgt(payload.weather, payload.heatReading);

  return {
    heatReading: { ...resolved.heatReading, status: 'cached' },
    weather: resolved.weather,
    source: 'cached',
  };
}

async function fetchFromConfiguredProvider(): Promise<{
  weather: CurrentWeatherSnapshot;
  heatReading: HeatReading;
}> {
  const provider = getActiveWeatherProvider();

  if (provider === 'openmeteo') {
    return fetchOpenMeteoCurrent();
  }

  if (provider === 'weatherapi') {
    return fetchWeatherApiCurrent();
  }

  if (provider === 'openweather') {
    return fetchOpenWeatherCurrent();
  }

  throw new ApiError(getWeatherConfigHint(), 0);
}

export const environmentalService = {
  async fetchLive(): Promise<EnvironmentalSnapshot> {
    const { weather, heatReading } = await fetchFromConfiguredProvider();

    const snapshot: CachedEnvironmentalPayload = { heatReading, weather };
    await storageService.setItem(
      STORAGE_KEYS.ENVIRONMENTAL_CACHE,
      JSON.stringify(snapshot),
    );

    return {
      heatReading,
      weather,
      source: 'live',
    };
  },

  async getCached(): Promise<EnvironmentalSnapshot | null> {
    const raw = await storageService.getItem(STORAGE_KEYS.ENVIRONMENTAL_CACHE);

    if (!raw) {
      return null;
    }

    try {
      return validateSnapshot(JSON.parse(raw) as CachedEnvironmentalPayload);
    } catch {
      return null;
    }
  },

  async fetchWithFallback(): Promise<EnvironmentalSnapshot> {
    try {
      return await this.fetchLive();
    } catch (error) {
      const cached = await this.getCached();

      if (cached) {
        return cached;
      }

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError('Unable to load environmental data.', 0);
    }
  },
};

