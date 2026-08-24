import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { GradientSurface } from '@/components/ui/GradientSurface';
import { IconCircle } from '@/components/ui/IconCircle';
import { FontSize, Spacing, BorderRadius } from '@/constants/theme';
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
          <IconCircle
            name="flame"
            size={64}
            iconSize={30}
            color={colors.onPrimary}
            backgroundColor={colors.primary}
            elevated
          />
          <AppText style={[styles.brand, { color: colors.primary }]}>HIRAYA</AppText>
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
  heroCard: {
    borderWidth: 1,
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
  brand: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    letterSpacing: 3,
    marginTop: Spacing.xs,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    lineHeight: 38,
    textAlign: 'center',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: FontSize.md,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 320,
  },
});
