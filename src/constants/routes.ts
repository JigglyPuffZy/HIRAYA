import type { Href } from 'expo-router';

export const ROUTES = {
  ROOT: '/',
  ONBOARDING: '/onboarding',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  HEALTH_PROFILE_SETUP: '/health-profile-setup' as Href,
  DASHBOARD: '/dashboard',
  ASSESSMENT: '/assessment',
  RESULT: '/result',
  HISTORY: '/history',
  WEATHER: '/weather',
  PROFILE: '/profile',
  SETTINGS: '/profile/settings',
  ABOUT: '/profile/about' as Href,
  PRIVACY: '/profile/privacy' as Href,
  TERMS: '/profile/terms' as Href,
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
