import { StyleSheet, View } from 'react-native';
import { OnboardingSlide } from '@/constants/onboarding';
import { AppText } from '@/components/ui/AppText';
import { IconCircle } from '@/components/ui/IconCircle';
import { GradientSurface } from '@/components/ui/GradientSurface';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';

interface OnboardingSlideViewProps {
  slide: OnboardingSlide;
}

export function OnboardingSlideView({ slide }: OnboardingSlideViewProps) {
  return (
    <View style={styles.container}>
      <GradientSurface preset="warm" style={styles.iconCard}>
        <IconCircle
          name={slide.icon}
          size={96}
          iconSize={44}
          color={Colors.primary}
          backgroundColor={Colors.surface}
          borderless
          elevated
        />
      </GradientSurface>

      <AppText variant="title" style={styles.title}>
        {slide.title}
      </AppText>
      <AppText variant="body" muted style={styles.description}>
        {slide.description}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  iconCard: {
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.accentPeach,
    ...Shadows.card,
  },
  title: {
    textAlign: 'center',
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.6,
  },
  description: {
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 24,
  },
});
