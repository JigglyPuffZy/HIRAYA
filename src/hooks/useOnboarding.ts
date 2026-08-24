import { useCallback, useEffect, useState } from 'react';
import { storageService } from '@/services/storageService';

export function useOnboarding() {
  const [isComplete, setIsComplete] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const complete = await storageService.isOnboardingComplete();
      if (mounted) {
        setIsComplete(complete);
        setIsLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const completeOnboarding = useCallback(async () => {
    await storageService.setOnboardingComplete(true);
    setIsComplete(true);
  }, []);

  return {
    isComplete,
    isLoading,
    completeOnboarding,
  };
}
