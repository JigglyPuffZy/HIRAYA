import { ComponentProps } from 'react';
import { ColorValue, Platform, StyleSheet, View } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useHealthProfileGate } from '@/hooks/useHealthProfileGate';
import { ROUTES } from '@/constants/routes';
import { useTheme } from '@/context/ThemeContext';
import { BorderRadius, FontSize, Spacing } from '@/constants/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface TabIconConfig {
  active: IoniconName;
  inactive: IoniconName;
}

const TAB_ICONS = {
  dashboard: { active: 'home', inactive: 'home-outline' },
  assessment: { active: 'pulse', inactive: 'pulse-outline' },
  history: { active: 'time', inactive: 'time-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
} satisfies Record<string, TabIconConfig>;

function TabBarIcon({
  icons,
  focused,
  color,
}: {
  icons: TabIconConfig;
  focused: boolean;
  color: ColorValue;
}) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Ionicons
        name={focused ? icons.active : icons.inactive}
        size={focused ? 22 : 21}
        color={color}
      />
    </View>
  );
}

export default function MainTabLayout() {
  const { colors, shadows, isDark } = useTheme();
  const { isComplete, isLoading } = useHealthProfileGate();

  if (isLoading) {
    return (
      <ScreenContainer scrollable={false} centered>
        <LoadingSpinner message="Loading..." variant="card" icon="grid-outline" size="md" />
      </ScreenContainer>
    );
  }

  if (!isComplete) {
    return <Redirect href={ROUTES.HEALTH_PROFILE_SETUP} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          left: Spacing.md,
          right: Spacing.md,
          bottom: Platform.OS === 'ios' ? Spacing.lg : Spacing.md,
          height: Platform.OS === 'ios' ? 72 : 64,
          paddingTop: Spacing.sm,
          paddingBottom: Platform.OS === 'ios' ? Spacing.md : Spacing.sm,
          backgroundColor: isDark ? colors.surfaceElevated : colors.surface,
          borderTopWidth: 0,
          borderRadius: BorderRadius.xxl,
          borderWidth: 1,
          borderColor: colors.borderLight,
          ...shadows.elevated,
        },
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarAccessibilityLabel: 'Dashboard overview',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon icons={TAB_ICONS.dashboard} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="assessment"
        options={{
          title: 'Check-in',
          tabBarAccessibilityLabel: 'Heat risk assessment',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon icons={TAB_ICONS.assessment} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarAccessibilityLabel: 'Assessment history',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon icons={TAB_ICONS.history} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarAccessibilityLabel: 'User profile and health info',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon icons={TAB_ICONS.profile} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="weather"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.1,
    marginTop: 2,
  },
  tabItem: {
    borderRadius: BorderRadius.md,
    paddingTop: 2,
  },
  iconWrap: {
    width: 36,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  iconWrapActive: {
    transform: [{ scale: 1.05 }],
  },
});
