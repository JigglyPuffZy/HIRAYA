import { ReactNode, useContext } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { BottomTabBarHeightContext } from 'expo-router/js-tabs';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { DecorativeBackground } from '@/components/ui/DecorativeBackground';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface ScreenContainerProps {
  children: ReactNode;
  scrollable?: boolean;
  centered?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  keyboardAvoiding?: boolean;
  showTopAccent?: boolean;
  decorative?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void | Promise<void>;
}

export function ScreenContainer({
  children,
  scrollable = true,
  centered = false,
  style,
  contentStyle,
  keyboardAvoiding = false,
  showTopAccent = false,
  decorative = false,
  refreshing,
  onRefresh,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  const tabBarHeightRaw = useContext(BottomTabBarHeightContext);
  const tabBarHeight =
    typeof tabBarHeightRaw === 'number' && Number.isFinite(tabBarHeightRaw)
      ? tabBarHeightRaw
      : 0;
  const { colors } = useTheme();
  const { screenPadding, maxContentWidth } = useResponsiveLayout();
  const bottomPadding = Math.max(insets.bottom, Spacing.xl) + tabBarHeight;

  const inner = (
    <View
      style={[
        scrollable ? styles.inner : styles.content,
        !scrollable && styles.contentFlex,
        centered && styles.centered,
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  const refreshControl =
    scrollable && onRefresh ? (
      <RefreshControl
        refreshing={refreshing ?? false}
        onRefresh={() => {
          void onRefresh();
        }}
        tintColor={colors.primary}
        colors={[colors.primary]}
      />
    ) : undefined;

  const body = scrollable ? (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingBottom: bottomPadding,
          paddingHorizontal: screenPadding,
        },
        centered && styles.centered,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    >
      {inner}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.contentFlex,
        {
          paddingHorizontal: screenPadding,
          paddingTop: Spacing.md,
          paddingBottom: bottomPadding,
        },
      ]}
    >
      {inner}
    </View>
  );

  const wrapped = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
    >
      {body}
    </KeyboardAvoidingView>
  ) : (
    body
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }, style]}
      edges={['top', 'left', 'right']}
    >
      {decorative ? <DecorativeBackground /> : null}
      {showTopAccent ? (
        <View style={[styles.topAccent, { backgroundColor: colors.primary }]} />
      ) : null}
      <View style={[styles.contentWrap, { maxWidth: maxContentWidth }]}>
        {wrapped}
      </View>
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
    height: 3,
  },
  contentWrap: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Spacing.md,
  },
  inner: {
    gap: Spacing.lg,
  },
  content: {
    flex: 1,
    gap: Spacing.lg,
  },
  contentFlex: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
  },
});
