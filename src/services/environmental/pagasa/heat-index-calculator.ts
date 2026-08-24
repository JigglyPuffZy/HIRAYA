/**
 * Rothfusz / NWS heat index formula (input °F) converted to °C output.
 * PAGASA uses temperature + relative humidity for public heat index.
 */
export function computeHeatIndexC(tempC: number, humidity: number): number {
  const tempF = (tempC * 9) / 5 + 32;
  const rh = humidity;

  let hiF =
    -42.379 +
    2.04901523 * tempF +
    10.14333127 * rh -
    0.22475541 * tempF * rh -
    0.00683783 * tempF * tempF -
    0.05481717 * rh * rh +
    0.00122874 * tempF * tempF * rh +
    0.00085282 * tempF * rh * rh -
    0.00000199 * tempF * tempF * rh * rh;

  if (rh < 13 && tempF >= 80 && tempF <= 112) {
    hiF -= ((13 - rh) / 4) * Math.sqrt((17 - Math.abs(tempF - 95)) / 17);
  }

  if (rh > 85 && tempF >= 80 && tempF <= 87) {
    hiF += ((rh - 85) / 10) * ((87 - tempF) / 5);
  }

  return ((hiF - 32) * 5) / 9;
}

/**
 * Resolve PAGASA-style heat index from live weather.
 * Uses temp + humidity (not the max of all fields) so risk tracks real conditions.
 */
export function resolveHeatIndexC(input: {
  tempC: number;
  humidity: number;
  heatIndexC?: number | null;
  feelsLikeC?: number | null;
}): number {
  if (Number.isFinite(input.tempC) && Number.isFinite(input.humidity)) {
    const computed = computeHeatIndexC(input.tempC, input.humidity);

    if (typeof input.heatIndexC === 'number' && Number.isFinite(input.heatIndexC)) {
      const delta = Math.abs(input.heatIndexC - computed);
      if (delta <= 5) {
        return Math.round(input.heatIndexC * 10) / 10;
      }
    }

    return Math.round(computed * 10) / 10;
  }

  if (typeof input.heatIndexC === 'number' && Number.isFinite(input.heatIndexC)) {
    return Math.round(input.heatIndexC * 10) / 10;
  }

  if (typeof input.feelsLikeC === 'number' && Number.isFinite(input.feelsLikeC)) {
    return Math.round(input.feelsLikeC * 10) / 10;
  }

  if (Number.isFinite(input.tempC)) {
    return Math.round(input.tempC * 10) / 10;
  }

  return 0;
}
