import { environmentalService } from '@/services/environmental/environmental.service';
import { STUDY_AREA } from '@/constants/study-area';
import { WeatherData, WeatherLocationQuery } from '@/types/weather';
import { CurrentWeatherSnapshot } from '@/types/environmental';

export function snapshotToWeatherData(
  snapshot: CurrentWeatherSnapshot,
  source?: WeatherData['dataSource'],
): WeatherData {
  return {
    location: snapshot.location,
    temperature: snapshot.temperature,
    feelsLike: snapshot.feelsLike,
    humidity: snapshot.humidity,
    heatIndex: snapshot.heatIndex,
    uvIndex: 0,
    windSpeed: Math.round((snapshot.windKph / 3.6) * 10) / 10,
    windKph: snapshot.windKph,
    windDir: snapshot.windDir,
    condition: snapshot.condition,
    description: snapshot.description,
    updatedAt: snapshot.updatedAt,
    dataSource: source,
  };
}

export const weatherService = {
  /** Live weather for Tuguegarao study area via Open-Meteo. */
  async getCurrentWeather(
    _query?: WeatherLocationQuery,
    _token?: string | null,
  ): Promise<WeatherData> {
    const snapshot = await environmentalService.fetchWithFallback();
    return snapshotToWeatherData(snapshot.weather, snapshot.source);
  },

  getStudyAreaQuery(): WeatherLocationQuery {
    return {
      latitude: STUDY_AREA.latitude,
      longitude: STUDY_AREA.longitude,
    };
  },
};
