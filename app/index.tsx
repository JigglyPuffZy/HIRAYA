import { Redirect } from 'expo-router';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useHealthProfileGate } from '@/hooks/useHealthProfileGate';
import { ROUTES } from '@/constants/routes';

export default function IndexScreen() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isComplete: onboardingComplete, isLoading: onboardingLoading } = useOnboarding();
  const { isComplete: healthProfileComplete, isLoading: profileGateLoading } =
    useHealthProfileGate();

  const isLoading = authLoading || onboardingLoading || (isAuthenticated && profileGateLoading);

  if (isLoading) {
    return (
      <ScreenContainer scrollable={false} centered>
        <LoadingSpinner
          message="Loading HIRAYA..."
          variant="splash"
          icon="flame"
          size="lg"
        />
      </ScreenContainer>
    );
  }

  if (!onboardingComplete) {
    return <Redirect href={ROUTES.ONBOARDING} />;
  }

  if (!isAuthenticated) {
    return <Redirect href={ROUTES.LOGIN} />;
  }

  if (!healthProfileComplete) {
    return <Redirect href={ROUTES.HEALTH_PROFILE_SETUP} />;
  }

  return <Redirect href={ROUTES.DASHBOARD} />;
}
