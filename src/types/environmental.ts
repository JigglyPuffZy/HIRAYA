export type HeatDataSource = 'live' | 'cached' | 'unavailable';

export interface HeatReading {
  heatIndex: number;
  wbgt: number;
  latitude: number;
  longitude: number;
  capturedAt: string;
  status: HeatDataSource;
}

export interface CurrentWeatherSnapshot {
  location: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  heatIndex: number;
  wbgt: number;
  condition: string;
  description: string;
  windKph: number;
  windDir: string;
  updatedAt: string;
}

export interface EnvironmentalSnapshot {
  heatReading: HeatReading;
  weather: CurrentWeatherSnapshot;
  source: HeatDataSource;
}
