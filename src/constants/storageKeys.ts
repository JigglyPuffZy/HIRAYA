export const STORAGE_KEYS = {
  ONBOARDING_COMPLETE: '@hiraya/onboarding_complete',
  AUTH_TOKEN: '@hiraya/auth_token',
  USER: '@hiraya/user',
  ENVIRONMENTAL_CACHE: '@hiraya/environmental_cache',
  LOCAL_ASSESSMENTS: '@hiraya/local_assessments',
  THEME_PREFERENCE: '@hiraya/theme_preference',
  userProfile: (userId: string) => `@hiraya/user_profile/${userId}`,
} as const;
