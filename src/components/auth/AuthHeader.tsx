import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/components/ui/AppText';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { BorderRadius, FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  const { shadows, isDark } = useTheme();

  const cardColors = isDark
    ? (['#5C2618', '#32140E', '#1A0A08'] as const)
    : (['#FFF7ED', '#FFFFFF', '#FFEDD5'] as const);

  return (
    <View style={[styles.container, shadows.elevated]}>
      <LinearGradient
        colors={[...cardColors]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        <BrandLogo size="lg" withGlow style={styles.logo} />

        <View style={styles.divider} />

        <AppText style={[styles.title, { color: isDark ? '#FFFFFF' : '#1C1917' }]}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText
            style={[
              styles.subtitle,
              { color: isDark ? 'rgba(255,255,255,0.78)' : '#57534E' },
            ]}
          >
            {subtitle}
          </AppText>
        ) : null}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.xxl,
  },
  card: {
    borderRadius: BorderRadius.xxl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
    overflow: 'hidden',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  glowTop: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(251,146,60,0.18)',
    top: -80,
    right: -50,
  },
  glowBottom: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(234,88,12,0.12)',
    bottom: -50,
    left: -40,
  },
  logo: {
    marginBottom: Spacing.xs,
  },
  divider: {
    width: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(251,146,60,0.85)',
    marginVertical: Spacing.xs,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    lineHeight: 36,
    textAlign: 'center',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: FontSize.md,
    lineHeight: 23,
    textAlign: 'center',
    maxWidth: 300,
    fontWeight: '500',
  },
});
