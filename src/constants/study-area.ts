/** Fixed study area — live heat/weather always uses Tuguegarao, not phone GPS. */
export const STUDY_AREA = {
  city: 'Tuguegarao City',
  province: 'Cagayan',
  latitude: 17.6132,
  longitude: 121.7270,
} as const;

export const STUDY_AREA_LABEL = `${STUDY_AREA.city}, ${STUDY_AREA.province}`;

/** Open-Meteo — primary weather source (no API key). */
export const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
export const OPEN_METEO_TIMEZONE = 'Asia/Manila';

/** WeatherAPI.com `q` parameter — coords preferred, city name as fallback. */
export const WEATHERAPI_LOCATION_QUERIES = [
  `${STUDY_AREA.latitude},${STUDY_AREA.longitude}`,
  'Tuguegarao',
] as const;

export const WEATHERAPI_CURRENT_URL =
  'https://api.weatherapi.com/v1/current.json';

