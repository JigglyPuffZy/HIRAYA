const CONDITION_WEIGHTS: Record<string, number> = {
  asthma: 18,
  hypertension: 16,
  heart_disease: 26,
  diabetes: 15,
  kidney_disease: 24,
  copd: 22,
  obesity: 12,
  other_chronic: 10,
};

function asNumber(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function parseConditions(raw: unknown): string[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item).trim().toLowerCase()).filter(Boolean);
  }
  if (typeof raw === 'string') {
    const value = raw.trim().toLowerCase();
    if (!value || value === 'none') return [];
    if (value.startsWith('[')) {
      try {
        return parseConditions(JSON.parse(value));
      } catch {
        return [];
      }
    }
    if (value.includes(',')) {
      return value.split(',').map((part) => part.trim().toLowerCase()).filter(Boolean);
    }
    if (value === 'respiratory') return ['copd'];
    return [value];
  }
  return [];
}

function activityScore(value: unknown): number {
  if (typeof value === 'number') return Math.max(0, Math.min(2, value));
  const key = String(value ?? '').trim().toLowerCase();
  if (key === 'a' || key === 'low' || key === 'light') return 0;
  if (key === 'b' || key === 'moderate') return 1;
  if (key === 'c' || key === 'high' || key === 'heavy') return 2;
  return 1;
}

function hydrationPenalty(value: unknown): number {
  if (typeof value === 'boolean') return value ? 0 : 0.12;
  const key = String(value ?? '').trim().toLowerCase();
  if (key === 'well_hydrated' || key === 'well' || key === 'yes' || key === 'true') return 0;
  if (key === 'moderate') return 0.06;
  if (key === 'dehydrated' || key === 'no' || key === 'false') return 0.12;
  return 0.04;
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/**
 * Cloud heat-risk scorer aligned with HIRAYA training signals
 * (heat index, humidity, activity, hydration, age, health conditions).
 * Hosted on Supabase Edge for public HTTPS access from the APK.
 */
export function predictProbability(input: {
  assessment: Record<string, unknown>;
  weather: Record<string, unknown>;
  profile: Record<string, unknown>;
}): number {
  const merged = {
    ...input.profile,
    ...input.assessment,
  };

  const temp = asNumber(
    input.weather.temperature ?? input.weather.env_temperature ?? merged.env_temperature,
    32,
  );
  const humidity = asNumber(input.weather.humidity, 70);
  const feelsLike = asNumber(
    input.weather.feelsLike ?? input.weather.feels_like ?? input.weather.heatIndex,
    temp,
  );
  const heatIndex = asNumber(input.weather.heatIndex, feelsLike);
  const age = asNumber(merged.age, 30);
  const activity = activityScore(
    merged.activity_level ?? merged.activityLevel ?? merged.activity,
  );
  const hydration = hydrationPenalty(
    merged.hydration_status ?? merged.hydrationStatus ?? merged.hydration,
  );

  const conditions = parseConditions(
    merged.health_conditions ?? merged.healthConditions ?? merged.health_condition,
  );

  let conditionLoad = 0;
  for (const condition of conditions) {
    conditionLoad += CONDITION_WEIGHTS[condition] ?? 0;
  }
  conditionLoad = Math.min(1, conditionLoad / 80);

  // Logistic-style score calibrated to PAGASA-ish heat bands for Tuguegarao.
  const heatTerm = (heatIndex - 27) / 12;
  const humidityTerm = (humidity - 55) / 45;
  const ageTerm = age >= 60 ? 0.35 : age <= 5 ? 0.25 : age >= 45 ? 0.15 : 0;
  const activityTerm = activity * 0.18;

  const z =
    -1.15 +
    1.55 * heatTerm +
    0.55 * humidityTerm +
    activityTerm +
    hydration * 1.4 +
    ageTerm +
    1.25 * conditionLoad;

  return Math.max(0.02, Math.min(0.98, sigmoid(z)));
}
