import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { OnboardingSlideView } from '@/components/onboarding/OnboardingSlideView';
import { Button } from '@/components/ui/Button';
import { AppText } from '@/components/ui/AppText';
import { ONBOARDING_SLIDES } from '@/constants/onboarding';
import { ROUTES } from '@/constants/routes';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Colors, Spacing } from '@/constants/theme';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useOnboarding();
  const [currentIndex, setCurrentIndex] = useState(0);

  const isLastSlide = currentIndex === ONBOARDING_SLIDES.length - 1;
  const slide = ONBOARDING_SLIDES[currentIndex];

  const handleNext = async () => {
    if (isLastSlide) {
      await completeOnboarding();
      router.replace(ROUTES.LOGIN);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const handleSkip = async () => {
    await completeOnboarding();
    router.replace(ROUTES.LOGIN);
  };

  return (
    <ScreenContainer scrollable={false} showTopAccent decorative>
      <View style={styles.header}>
        <AppText variant="label" style={styles.brand}>
          HIRAYA
        </AppText>
        <Button title="Skip" variant="ghost" size="sm" onPress={handleSkip} />
      </View>

      <ScrollView
        style={styles.slideScroll}
        contentContainerStyle={styles.slideContent}
        showsVerticalScrollIndicator={false}
      >
        <OnboardingSlideView slide={slide} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
        <View style={styles.dots}>
          {ONBOARDING_SLIDES.map((item, index) => (
            <View
              key={item.id}
              style={[styles.dot, index === currentIndex && styles.dotActive]}
            />
          ))}
        </View>
        <Button
          title={isLastSlide ? 'Get Started' : 'Next'}
          onPress={handleNext}
          fullWidth
          size="lg"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  brand: {
    color: Colors.primary,
    letterSpacing: 1.5,
    fontSize: 15,
  },
  slideScroll: {
    flex: 1,
  },
  slideContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  footer: {
    gap: Spacing.lg,
    paddingTop: Spacing.md,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
});
