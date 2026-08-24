import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { ROUTES } from '@/constants/routes';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: ReactNode;
}

export function Header({ title, subtitle, showBack = false, rightAction }: HeaderProps) {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {showBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
                return;
              }

              router.replace(ROUTES.DASHBOARD);
            }}
            style={({ pressed }) => [
              styles.backButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.borderLight,
              },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </Pressable>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        {rightAction ?? <View style={styles.backPlaceholder} />}
      </View>

      <View style={styles.titleBlock}>
        <AppText variant="title" style={styles.title} numberOfLines={2}>
          {title}
        </AppText>
        <View style={[styles.accentLine, { backgroundColor: colors.primary }]} />
        {subtitle ? (
          <AppText variant="body" muted numberOfLines={3} style={styles.subtitle}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPlaceholder: {
    width: 42,
    height: 42,
  },
  pressed: {
    opacity: 0.75,
  },
  titleBlock: {
    gap: Spacing.sm,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.8,
  },
  accentLine: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  subtitle: {
    lineHeight: 22,
  },
});
