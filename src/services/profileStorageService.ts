import { STORAGE_KEYS } from '@/constants/storageKeys';
import { storageService } from '@/services/storageService';
import { StoredUserProfile } from '@/types/userProfile';

export const profileStorageService = {
  async getProfile(userId: string): Promise<StoredUserProfile | null> {
    const raw = await storageService.getItem(STORAGE_KEYS.userProfile(userId));

    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as StoredUserProfile;

      if (
        !parsed ||
        typeof parsed !== 'object' ||
        typeof parsed.updatedAt !== 'string' ||
        !parsed.fields ||
        typeof parsed.fields !== 'object'
      ) {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  },

  async saveProfile(
    userId: string,
    profile: StoredUserProfile,
  ): Promise<void> {
    await storageService.setItem(
      STORAGE_KEYS.userProfile(userId),
      JSON.stringify(profile),
    );
  },

  async clearProfile(userId: string): Promise<void> {
    await storageService.removeItem(STORAGE_KEYS.userProfile(userId));
  },
};
