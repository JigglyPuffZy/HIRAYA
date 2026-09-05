import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface AuthScreenLayoutProps {
  children: ReactNode;
  contentStyle?: ViewStyle;
}

export function AuthScreenLayout({ children, contentStyle }: AuthScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { screenPadding, maxContentWidth } = useResponsiveLayout();

  const backdrop = isDark
    ? (['#05060A', '#0B0F17', '#120D14'] as const)
    : ([colors.background, colors.backgroundAlt, colors.primarySoft] as const);

  return (
    <View style={styles.root}>
      <LinearGradient colors={[...backdrop]} style={StyleSheet.absoluteFill} />
      <View style={[styles.orbTop, { backgroundColor: isDark ? '#EA580C' : colors.primaryMuted }]} />
      <View style={[styles.orbBottom, { backgroundColor: isDark ? '#9A3412' : colors.accentBlue }]} />
      <View style={styles.vignette} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingBottom: Math.max(insets.bottom, Spacing.xl) + Spacing.lg,
                paddingHorizontal: screenPadding,
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[styles.content, { maxWidth: maxContentWidth }, contentStyle]}
            >
              {children}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  vignette: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  orbTop: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.14,
    top: -110,
    right: -90,
  },
  orbBottom: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    opacity: 0.1,
    bottom: 20,
    left: -100,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: Spacing.lg,
  },
  content: {
    gap: Spacing.lg,
    width: '100%',
    alignSelf: 'center',
    zIndex: 1,
  },
});
