import { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

/** Consistent Ionicons used across the dashboard home screen. */
export const DASHBOARD_ICONS = {
  brand: 'sunny' satisfies IoniconName,
  quickAction: {
    section: 'pulse-outline' satisfies IoniconName,
    card: 'pulse' satisfies IoniconName,
    trailing: 'chevron-forward' satisfies IoniconName,
  },
  weather: {
    section: 'cloud-outline' satisfies IoniconName,
    wind: 'leaf-outline' satisfies IoniconName,
    humidity: 'water-outline' satisfies IoniconName,
    feelsLike: 'thermometer-outline' satisfies IoniconName,
    details: 'chevron-forward' satisfies IoniconName,
  },
  risk: {
    section: 'speedometer-outline' satisfies IoniconName,
    empty: 'clipboard-outline' satisfies IoniconName,
    viewResult: 'chevron-forward' satisfies IoniconName,
  },
  safety: {
    section: 'heart-circle-outline' satisfies IoniconName,
    tip: 'checkmark-circle' satisfies IoniconName,
    empty: 'information-circle-outline' satisfies IoniconName,
    swipe: 'chevron-back' satisfies IoniconName,
  },
} as const;

export function weatherConditionIcon(condition: string): IoniconName {
  const c = condition.toLowerCase();
  if (c.includes('rain') || c.includes('drizzle')) return 'rainy';
  if (c.includes('storm') || c.includes('thunder')) return 'thunderstorm';
  if (c.includes('fog') || c.includes('mist')) return 'cloud';
  if (c.includes('overcast')) return 'cloudy';
  if (c.includes('cloud')) return 'cloudy-night';
  if (c.includes('clear') || c.includes('sun')) return 'sunny';
  return 'partly-sunny';
}
