import { profileService } from '@/services/profileService';
import { PROFILE_FIELD_DEFINITIONS } from '@/constants/profileFields';
import { ROUTES } from '@/constants/routes';
import { isHealthProfileComplete } from '@/utils/profileCompletion';
import type { Href } from 'expo-router';

export async function resolvePostAuthRoute(userId: string): Promise<Href> {
  const fields = await profileService.getProfileDataForPrediction(userId);

  if (isHealthProfileComplete(PROFILE_FIELD_DEFINITIONS, fields)) {
    return ROUTES.DASHBOARD;
  }

  return ROUTES.HEALTH_PROFILE_SETUP;
}
