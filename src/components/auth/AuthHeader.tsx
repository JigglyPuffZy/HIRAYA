import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Card } from '@/components/ui/Card';
import { BorderRadius, FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  const { colors } = useTheme();

  return (
    <Card variant="elevated" padded={false} style={styles.container}>
      <View style={[styles.stripe, { backgroundColor: colors.primary }]} />
      <View style={styles.inner}>
        <BrandLogo size="lg" style={styles.logo} />
        <View style={styles.textBlock}>
          <AppText style={[styles.title, { color: colors.text }]}>{title}</AppText>
          {subtitle ? (
            <AppText style={[styles.subtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  stripe: {
    height: 4,
    width: '100%',
  },
  inner: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  logo: {
    marginBottom: Spacing.xs,
  },
  textBlock: {
    alignItems: 'center',
    gap: Spacing.sm,
    maxWidth: 320,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    lineHeight: 34,
    textAlign: 'center',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: FontSize.md,
    lineHeight: 23,
    textAlign: 'center',
    fontWeight: '500',
  },
});
