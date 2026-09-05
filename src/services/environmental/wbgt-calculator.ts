/**
 * Estimated Wet Bulb Globe Temperature (WBGT) from air temperature + RH.
 *
 * True instrument WBGT needs wet-bulb and globe sensors. Without those,
 * HIRAYA estimates outdoor shade WBGT as:
 *   WBGT ≈ 0.7·Tw + 0.3·Ta
 * where Tw is Stull (2011) wet-bulb temperature from Ta and RH.
 *
 * Risk classification still uses PAGASA heat index; WBGT is shown as a
 * complementary occupational-style heat-stress metric.
 *
 * @see Stull, R. (2011). Wet-Bulb Temperature from Relative Humidity and
 *      Air Temperature. Journal of Applied Meteorology and Climatology.
 */

/** Stull (2011) wet-bulb approximation (°C). */
export function estimateWetBulbC(tempC: number, humidity: number): number {
  const ta = tempC;
  const rh = Math.min(100, Math.max(0, humidity));

  const tw =
    ta * Math.atan(0.151977 * (rh + 8.313659) ** 0.5) +
    Math.atan(ta + rh) -
    Math.atan(rh - 1.676331) +
    0.00391838 * rh ** 1.5 * Math.atan(0.023101 * rh) -
    4.686035;

  return Math.round(tw * 10) / 10;
}

/**
 * Estimated outdoor shade WBGT (°C) from temperature + humidity.
 * Assumes globe temperature ≈ air temperature (no direct solar globe).
 */
export function estimateWbgtC(tempC: number, humidity: number): number {
  if (!Number.isFinite(tempC) || !Number.isFinite(humidity)) {
    return 0;
  }

  const wetBulb = estimateWetBulbC(tempC, humidity);
  const wbgt = 0.7 * wetBulb + 0.3 * tempC;
  return Math.round(wbgt * 10) / 10;
}

export function resolveWbgtC(input: {
  tempC: number;
  humidity: number;
  wbgtC?: number | null;
}): number {
  if (typeof input.wbgtC === 'number' && Number.isFinite(input.wbgtC)) {
    return Math.round(input.wbgtC * 10) / 10;
  }

  return estimateWbgtC(input.tempC, input.humidity);
}
