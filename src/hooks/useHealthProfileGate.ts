import { useCallback, useEffect, useState } from 'react';
import { profileService } from '@/services/profileService';
import { useCurrentUser } from '@/hooks/useAuth';
import { PROFILE_FIELD_DEFINITIONS } from '@/constants/profileFields';
import { isHealthProfileComplete } from '@/utils/profileCompletion';

export function useHealthProfileGate() {
  const user = useCurrentUser();
  const userId = user?.id ?? null;
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(userId));

  const refresh = useCallback(async () => {
    if (!userId) {
      setIsComplete(false);
      setIsLoading(false);
      return false;
    }

    setIsLoading(true);

    try {
      const fields = await profileService.getProfileDataForPrediction(userId);
      const complete = isHealthProfileComplete(PROFILE_FIELD_DEFINITIONS, fields);
      setIsComplete(complete);
      return complete;
    } catch {
      setIsComplete(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    isComplete,
    isLoading,
    refresh,
  };
}
