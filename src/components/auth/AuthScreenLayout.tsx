import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { DecorativeBackground } from '@/components/ui/DecorativeBackground';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface AuthScreenLayoutProps {
  children: ReactNode;
  contentStyle?: ViewStyle;
}

export function AuthScreenLayout({ children, contentStyle }: AuthScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { screenPadding, maxContentWidth } = useResponsiveLayout();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <DecorativeBackground />
      <View style={[styles.topAccent, { backgroundColor: colors.primary }]} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: Math.max(insets.bottom, Spacing.xl),
              paddingHorizontal: screenPadding,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.content, { maxWidth: maxContentWidth }, contentStyle]}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  topAccent: {
    height: 4,
    opacity: 0.9,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Spacing.xl,
  },
  content: {
    gap: Spacing.lg,
    width: '100%',
    alignSelf: 'center',
    zIndex: 1,
  },
});
