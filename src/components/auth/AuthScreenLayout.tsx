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
    ? (['#05060A', '#0A0F18', '#121A28'] as const)
    : ([colors.background, colors.backgroundAlt, colors.surfaceMuted] as const);

  return (
    <View style={styles.root}>
      <LinearGradient colors={[...backdrop]} style={StyleSheet.absoluteFill} />
      <View style={[styles.orbTop, { backgroundColor: isDark ? colors.primary : colors.accentNavySoft }]} />
      <View style={[styles.orbBottom, { backgroundColor: isDark ? colors.accentNavySoft : colors.primarySoft }]} />

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
            <View style={[styles.content, { maxWidth: maxContentWidth }, contentStyle]}>
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
  orbTop: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.35,
    top: -100,
    right: -80,
  },
  orbBottom: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.3,
    bottom: 40,
    left: -80,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: Spacing.xl,
  },
  content: {
    gap: Spacing.lg,
    width: '100%',
    alignSelf: 'center',
    zIndex: 1,
  },
});
