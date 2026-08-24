import { supabase } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/config/env';
import {
  ProfileFieldValues,
  ProfileServiceError,
  UserAccountInfo,
} from '@/types/userProfile';

interface RemoteProfileRecord {
  full_name: string | null;
  email: string | null;
  profile_fields: ProfileFieldValues | null;
  updated_at: string | null;
}

export interface RemoteProfileSnapshot {
  fullName: string;
  email: string;
  fields: ProfileFieldValues;
  updatedAt: string | null;
}

function mapSupabaseError(message: string): ProfileServiceError {
  if (
    message.includes('profile_fields') ||
    message.includes('column') ||
    message.includes('schema cache')
  ) {
    return new ProfileServiceError(
      'Profile database is not ready. Run supabase/migrations/002_profile_fields.sql in the Supabase SQL Editor, then try again.',
      'SYNC_ERROR',
    );
  }

  return new ProfileServiceError(
    `Unable to sync profile with Supabase: ${message}`,
    'SYNC_ERROR',
  );
}

export const supabaseProfileService = {
  async fetchRemoteProfile(userId: string): Promise<RemoteProfileSnapshot | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, email, profile_fields, updated_at')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw mapSupabaseError(error.message);
    }

    if (!data) {
      return null;
    }

    const record = data as RemoteProfileRecord;

    return {
      fullName: record.full_name?.trim() ?? '',
      email: record.email?.trim() ?? '',
      fields: record.profile_fields ?? {},
      updatedAt: record.updated_at,
    };
  },

  /** @deprecated Use fetchRemoteProfile */
  async fetchProfileFields(
    userId: string,
  ): Promise<{ fields: ProfileFieldValues; updatedAt: string | null } | null> {
    const remote = await this.fetchRemoteProfile(userId);
    if (!remote) {
      return null;
    }

    return {
      fields: remote.fields,
      updatedAt: remote.updatedAt,
    };
  },

  async saveProfileFields(
    account: UserAccountInfo,
    fields: ProfileFieldValues,
  ): Promise<string> {
    if (!isSupabaseConfigured()) {
      throw new ProfileServiceError(
        'Supabase is not configured.',
        'SYNC_ERROR',
      );
    }

    const updatedAt = new Date().toISOString();

    const { error } = await supabase.from('profiles').upsert(
      {
        id: account.userId,
        email: account.email,
        full_name: account.fullName,
        profile_fields: fields,
        updated_at: updatedAt,
      },
      { onConflict: 'id' },
    );

    if (error) {
      throw mapSupabaseError(error.message);
    }

    return updatedAt;
  },
};
