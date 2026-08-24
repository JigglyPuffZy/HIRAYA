import { isApiConfigured, isSupabaseConfigured } from '@/config/env';
import { PROFILE_FIELD_DEFINITIONS } from '@/constants/profileFields';
import { supabase } from '@/lib/supabase';
import { profileStorageService } from '@/services/profileStorageService';
import { supabaseProfileService } from '@/services/supabase/profileService';
import {
  ProfileFieldValues,
  ProfileFormValues,
  ProfileServiceError,
  StoredUserProfile,
  UserAccountInfo,
  UserProfile,
} from '@/types/userProfile';
import { validateProfileForm } from '@/utils/profileValidation';
import { parseHealthConditions, healthConditionsToStorage } from '@/utils/healthConditions';

function normalizeProfileFieldsForPrediction(fields: ProfileFieldValues): ProfileFieldValues {
  const normalized = { ...fields };
  const conditions = parseHealthConditions(normalized.health_conditions);
  const legacy = parseHealthConditions(normalized.health_condition);
  const merged = healthConditionsToStorage(
    conditions.length ? conditions : legacy,
  );

  if (merged.length) {
    normalized.health_conditions = merged;
  }

  return normalized;
}

function buildUserProfile(
  account: UserAccountInfo,
  stored: StoredUserProfile | null,
  identity?: { fullName?: string; email?: string },
): UserProfile {
  return {
    userId: account.userId,
    email: identity?.email?.trim() || account.email,
    fullName: identity?.fullName?.trim() || account.fullName,
    memberSince: account.memberSince,
    fields: stored?.fields ?? {},
    updatedAt: stored?.updatedAt ?? null,
  };
}

async function assertActiveSessionUser(expectedUserId: string): Promise<void> {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return;
  }

  if (data.user.id !== expectedUserId) {
    throw new ProfileServiceError(
      'Signed-in account changed while loading profile. Please try again.',
      'SYNC_ERROR',
    );
  }
}

async function cacheProfileLocally(
  userId: string,
  fields: ProfileFieldValues,
  updatedAt: string,
): Promise<StoredUserProfile> {
  const storedProfile: StoredUserProfile = {
    fields,
    updatedAt,
  };

  await profileStorageService.saveProfile(userId, storedProfile);
  return storedProfile;
}

export const profileService = {
  async getUserProfile(account: UserAccountInfo): Promise<UserProfile> {
    if (isSupabaseConfigured()) {
      await assertActiveSessionUser(account.userId);

      try {
        const remote = await supabaseProfileService.fetchRemoteProfile(
          account.userId,
        );

        if (remote) {
          const updatedAt = remote.updatedAt ?? new Date().toISOString();
          const stored = await cacheProfileLocally(
            account.userId,
            remote.fields,
            updatedAt,
          );
          return buildUserProfile(account, stored, {
            fullName: remote.fullName,
            email: remote.email,
          });
        }
      } catch (error) {
        if (error instanceof ProfileServiceError) {
          throw error;
        }
      }
    }

    const stored = await profileStorageService.getProfile(account.userId);
    return buildUserProfile(account, stored);
  },

  /**
   * Retrieves research-approved profile field values for the prediction system.
   */
  async getProfileDataForPrediction(userId: string): Promise<ProfileFieldValues> {
    if (isSupabaseConfigured()) {
      try {
        const remote = await supabaseProfileService.fetchProfileFields(userId);
        if (remote) {
          return normalizeProfileFieldsForPrediction(remote.fields);
        }
      } catch {
        // Fall back to local cache below.
      }
    }

    const stored = await profileStorageService.getProfile(userId);
    return normalizeProfileFieldsForPrediction(stored?.fields ?? {});
  },

  validateProfile(values: ProfileFormValues) {
    return validateProfileForm(values, PROFILE_FIELD_DEFINITIONS);
  },

  async saveUserProfile(
    account: UserAccountInfo,
    formValues: ProfileFormValues,
    _token?: string | null,
  ): Promise<UserProfile> {
    const validation = validateProfileForm(formValues, PROFILE_FIELD_DEFINITIONS);

    if (!validation.isValid || !validation.values) {
      throw new ProfileServiceError(
        'Please correct the highlighted profile fields.',
        'VALIDATION_ERROR',
        validation.fieldErrors,
      );
    }

    let updatedAt = new Date().toISOString();

    if (isSupabaseConfigured()) {
      updatedAt = await supabaseProfileService.saveProfileFields(
        account,
        validation.values,
      );
    }

    let storedProfile: StoredUserProfile;

    try {
      storedProfile = await cacheProfileLocally(
        account.userId,
        validation.values,
        updatedAt,
      );
    } catch {
      throw new ProfileServiceError(
        'Unable to save profile information locally.',
        'STORAGE_ERROR',
      );
    }

    // Backend ML sync is optional; endpoint may not exist on all deployments.
    if (isApiConfigured() && _token) {
      // Reserved for future backend profile sync.
    }

    return buildUserProfile(account, storedProfile);
  },
};

