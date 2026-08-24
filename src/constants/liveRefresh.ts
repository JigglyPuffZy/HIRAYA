/** How often live weather auto-refreshes (15 minutes). */
export const WEATHER_REFRESH_INTERVAL_SEC = 15 * 60;

export const WEATHER_REFRESH_INTERVAL_MS =
  WEATHER_REFRESH_INTERVAL_SEC * 1000;

/** Max assessment history rows kept on device. */
export const LOCAL_ASSESSMENT_HISTORY_LIMIT = 200;

/** Optional ML backend — short timeout; on-device tree is primary. */
export const ASSESSMENT_ML_TIMEOUT_MS = 8000;
