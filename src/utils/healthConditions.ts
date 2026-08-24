import {
  DISEASE_RISK_CONFIG,
  HEAT_SENSITIVE_CONDITION_IDS,
  HeatSensitiveConditionId,
} from '@/constants/health-vulnerability';

const VALID_IDS = new Set<string>(HEAT_SENSITIVE_CONDITION_IDS);

function isValidConditionId(value: string): value is HeatSensitiveConditionId {
  return VALID_IDS.has(value);
}

/**
 * Parse health conditions from profile storage (array, JSON string, CSV, or legacy single value).
 */
export function parseHealthConditions(value: unknown): HeatSensitiveConditionId[] {
  if (value === undefined || value === null || value === '') {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim().toLowerCase())
      .filter(isValidConditionId);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || trimmed === 'none') {
      return [];
    }

    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        return parseHealthConditions(parsed);
      } catch {
        // fall through
      }
    }

    if (trimmed.includes(',')) {
      return trimmed
        .split(',')
        .map((part) => part.trim().toLowerCase())
        .filter(isValidConditionId);
    }

    const normalized = trimmed.toLowerCase();
    if (normalized === 'respiratory') {
      return ['copd'];
    }

    return isValidConditionId(normalized) ? [normalized] : [];
  }

  return [];
}

export function formatHealthConditionLabels(ids: HeatSensitiveConditionId[]): string[] {
  return ids.map((id) => DISEASE_RISK_CONFIG[id].label);
}

export function healthConditionsToStorage(ids: HeatSensitiveConditionId[]): string[] {
  return [...new Set(ids.filter(isValidConditionId))];
}

export function encodeHealthConditionsForMl(ids: HeatSensitiveConditionId[]): Record<string, number> {
  const encoded: Record<string, number> = {};
  for (const id of HEAT_SENSITIVE_CONDITION_IDS) {
    encoded[id] = ids.includes(id) ? 1 : 0;
  }
  return encoded;
}

export function combinedConditionKey(ids: HeatSensitiveConditionId[]): string {
  return [...ids].sort().join('+');
}
