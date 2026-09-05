export interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  heatIndex: number;
  wbgt: number;
  uvIndex: number;
  windSpeed: number;
  windKph: number;
  windDir: string;
  condition: string;
  description: string;
  updatedAt: string;
  dataSource?: 'live' | 'cached' | 'unavailable';
}

export interface WeatherLocationQuery {
  latitude: number;
  longitude: number;
}
