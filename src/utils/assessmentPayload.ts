import {
  AssessmentSubmissionPayload,
  EnvironmentalData,
} from '@/types/assessment';
import { WeatherData } from '@/types/weather';
import { WeatherLocationQuery } from '@/types/weather';

export function buildEnvironmentalData(
  weather: WeatherData,
  coordinates: WeatherLocationQuery,
): EnvironmentalData {
  return {
    location: weather.location,
    temperature: weather.temperature,
    feelsLike: weather.feelsLike,
    humidity: weather.humidity,
    heatIndex: weather.heatIndex,
    uvIndex: weather.uvIndex,
    windSpeed: weather.windSpeed,
    windKph: weather.windKph,
    windDir: weather.windDir,
    condition: weather.condition,
    description: weather.description,
    capturedAt: weather.updatedAt,
    coordinates,
  };
}

export function buildAssessmentPayload(
  userInputs: Record<string, string | number | boolean>,
  weather: WeatherData,
  coordinates: WeatherLocationQuery,
): AssessmentSubmissionPayload {
  return {
    userInputs,
    environmental: buildEnvironmentalData(weather, coordinates),
    submittedAt: new Date().toISOString(),
  };
}
