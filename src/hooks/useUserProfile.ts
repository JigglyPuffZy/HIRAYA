import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { profileService } from '@/services/profileService';
import { useAuth, useCurrentUser } from '@/hooks/useAuth';
import {
  PROFILE_FIELD_DEFINITIONS,
  hasProfileFieldsConfigured,
} from '@/constants/profileFields';
import {
  ProfileFieldValues,
  ProfileFormValues,
  ProfileSaveState,
  ProfileServiceError,
} from '@/types/userProfile';
import {
  createInitialProfileValues,
  profileValuesToFormValues,
} from '@/utils/profileValidation';

function emptyFormValues(): ProfileFormValues {
  return createInitialProfileValues(PROFILE_FIELD_DEFINITIONS);
}

export function useUserProfile() {
  const user = useCurrentUser();
  const { session } = useAuth();
  const userId = user?.id ?? null;
  const userRef = useRef(user);
  userRef.current = user;

  const [fields, setFields] = useState<ProfileFieldValues>({});
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<ProfileFormValues>(emptyFormValues);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [saveState, setSaveState] = useState<ProfileSaveState>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  const resetProfileState = useCallback(() => {
    setFields({});
    setUpdatedAt(null);
    setFormValues(emptyFormValues());
    setFieldErrors({});
    setIsEditing(false);
    setSaveError(null);
    setSaveState('idle');
  }, []);

  const loadProfile = useCallback(async () => {
    const currentUser = userRef.current;

    if (!currentUser) {
      resetProfileState();
      return;
    }

    const activeUserId = currentUser.id;

    setFields({});
    setUpdatedAt(null);
    setIsEditing(false);
    setFieldErrors({});
    setSaveError(null);
    setSaveState('loading');

    try {
      const loaded = await profileService.getUserProfile({
        userId: activeUserId,
        email: currentUser.email,
        fullName: currentUser.fullName,
        memberSince: currentUser.createdAt,
      });

      if (loaded.userId !== activeUserId) {
        return;
      }

      setFields(loaded.fields);
      setUpdatedAt(loaded.updatedAt);
      setFormValues(
        profileValuesToFormValues(loaded.fields, PROFILE_FIELD_DEFINITIONS),
      );
      setSaveState('idle');
    } catch {
      setSaveError('Unable to load profile information.');
      setSaveState('error');
    }
  }, [resetProfileState]);

  useEffect(() => {
    if (!userId) {
      resetProfileState();
      return;
    }

    void loadProfile();
  }, [userId, loadProfile, resetProfileState]);

  const setFieldValue = useCallback((fieldId: string, value: string | boolean | string[]) => {
    setFormValues((current) => ({ ...current, [fieldId]: value }));
    setFieldErrors((current) => {
      if (!current[fieldId]) {
        return current;
      }

      const next = { ...current };
      delete next[fieldId];
      return next;
    });
    setSaveError(null);
    setSaveState('idle');
  }, []);

  const startEditing = useCallback(() => {
    setFormValues(profileValuesToFormValues(fields, PROFILE_FIELD_DEFINITIONS));
    setFieldErrors({});
    setSaveError(null);
    setSaveState('idle');
    setIsEditing(true);
  }, [fields]);

  const cancelEditing = useCallback(() => {
    setFormValues(profileValuesToFormValues(fields, PROFILE_FIELD_DEFINITIONS));
    setFieldErrors({});
    setSaveError(null);
    setSaveState('idle');
    setIsEditing(false);
  }, [fields]);

  const saveProfile = useCallback(async () => {
    const currentUser = userRef.current;
    if (!currentUser) {
      return;
    }

    setSaveState('saving');
    setSaveError(null);
    setFieldErrors({});

    try {
      const updated = await profileService.saveUserProfile(
        {
          userId: currentUser.id,
          email: currentUser.email,
          fullName: currentUser.fullName,
          memberSince: currentUser.createdAt,
        },
        formValues,
        session?.token,
      );

      if (updated.userId !== currentUser.id) {
        return;
      }

      setFields(updated.fields);
      setUpdatedAt(updated.updatedAt);
      setFormValues(
        profileValuesToFormValues(updated.fields, PROFILE_FIELD_DEFINITIONS),
      );
      setIsEditing(false);
      setSaveState('success');
    } catch (error) {
      if (error instanceof ProfileServiceError) {
        setSaveError(error.message);
        if (error.fieldErrors) {
          setFieldErrors(error.fieldErrors);
        }
      } else {
        setSaveError('Unable to save profile changes.');
      }

      setSaveState('error');
    }
  }, [formValues, session?.token]);

  const dismissSuccess = useCallback(() => {
    if (saveState === 'success') {
      setSaveState('idle');
    }
  }, [saveState]);

  const profile = useMemo(() => {
    if (!user) {
      return null;
    }

    return {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      memberSince: user.createdAt,
      fields,
      updatedAt,
    };
  }, [fields, updatedAt, user]);

  return {
    profile,
    fields,
    formValues,
    fieldErrors,
    isEditing,
    saveState,
    saveError,
    hasProfileFieldsConfigured: hasProfileFieldsConfigured(),
    isLoading: saveState === 'loading',
    isSaving: saveState === 'saving',
    isSaveSuccess: saveState === 'success',
    isSaveError: saveState === 'error',
    setFieldValue,
    startEditing,
    cancelEditing,
    saveProfile,
    dismissSuccess,
    reloadProfile: loadProfile,
  };
}
