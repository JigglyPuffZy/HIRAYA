import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { AuthSession } from '@/types/auth';

export const storageService = {
  async getItem(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  },

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },

  async getBoolean(key: string): Promise<boolean> {
    const value = await AsyncStorage.getItem(key);
    return value === 'true';
  },

  async setBoolean(key: string, value: boolean): Promise<void> {
    await AsyncStorage.setItem(key, value ? 'true' : 'false');
  },

  async getSession(): Promise<AuthSession | null> {
    const [token, userJson] = await AsyncStorage.multiGet([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USER,
    ]);

    const tokenValue = token[1];
    const userValue = userJson[1];

    if (!tokenValue || !userValue) {
      return null;
    }

    try {
      return {
        token: tokenValue,
        user: JSON.parse(userValue),
      };
    } catch {
      await this.clearSession();
      return null;
    }
  },

  async saveSession(session: AuthSession): Promise<void> {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.AUTH_TOKEN, session.token],
      [STORAGE_KEYS.USER, JSON.stringify(session.user)],
    ]);
  },

  async clearSession(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USER,
    ]);
  },

  async isOnboardingComplete(): Promise<boolean> {
    return this.getBoolean(STORAGE_KEYS.ONBOARDING_COMPLETE);
  },

  async setOnboardingComplete(value: boolean): Promise<void> {
    await this.setBoolean(STORAGE_KEYS.ONBOARDING_COMPLETE, value);
  },
};
