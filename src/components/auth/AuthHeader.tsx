import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { GradientSurface } from '@/components/ui/GradientSurface';
import { FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  const { colors, shadows } = useTheme();

  return (
    <View style={styles.container}>
      <GradientSurface
        preset="warm"
        style={{
          borderWidth: 1,
          borderColor: colors.accentPeach,
          ...shadows.card,
        }}
      >
        <View
          style={[
            styles.decorOrb,
            { backgroundColor: colors.primaryMuted },
          ]}
        />
        <View style={styles.content}>
          <BrandLogo size="lg" />
          <AppText style={[styles.title, { color: colors.text }]}>{title}</AppText>
          {subtitle ? (
            <AppText style={[styles.subtitle, { color: colors.textMuted }]}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
      </GradientSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xs,
  },
  decorOrb: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.2,
    top: -24,
    right: -20,
  },
  content: {
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    lineHeight: 38,
    textAlign: 'center',
    letterSpacing: -0.6,
    marginTop: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 320,
  },
});
