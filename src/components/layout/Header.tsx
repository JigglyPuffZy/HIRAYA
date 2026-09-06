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
  const { colors, shadows } = useTheme();

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
              shadows.sm,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="arrow-back" size={18} color={colors.text} />
          </Pressable>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        {rightAction ?? <View style={styles.backPlaceholder} />}
      </View>

      <View style={styles.titleBlock}>
        <View style={styles.titleRow}>
          <View style={[styles.accentBar, { backgroundColor: colors.primary }]} />
          <View style={styles.titleText}>
            <AppText variant="title" style={styles.title} numberOfLines={2}>
              {title}
            </AppText>
            {subtitle ? (
              <AppText variant="body" muted numberOfLines={3} style={styles.subtitle}>
                {subtitle}
              </AppText>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPlaceholder: {
    width: 40,
    height: 40,
  },
  pressed: {
    opacity: 0.75,
  },
  titleBlock: {
    gap: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  accentBar: {
    width: 4,
    minHeight: 44,
    borderRadius: 2,
    marginTop: 4,
  },
  titleText: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.7,
    fontWeight: '800',
  },
  subtitle: {
    lineHeight: 22,
  },
});
