import { ComponentProps } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useHealthProfileGate } from '@/hooks/useHealthProfileGate';
import { ROUTES } from '@/constants/routes';
import { useTheme } from '@/context/ThemeContext';
import { BorderRadius, FontSize } from '@/constants/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface TabIconConfig {
  active: IoniconName;
  inactive: IoniconName;
}

const TAB_ICONS = {
  dashboard: { active: 'grid', inactive: 'grid-outline' },
  assessment: { active: 'thermometer', inactive: 'thermometer-outline' },
  history: { active: 'clipboard', inactive: 'clipboard-outline' },
  profile: { active: 'person-circle', inactive: 'person-circle-outline' },
} satisfies Record<string, TabIconConfig>;

function TabBarIcon({
  icons,
  focused,
  color,
}: {
  icons: TabIconConfig;
  focused: boolean;
  color: string;
}) {
  return (
    <Ionicons
      name={focused ? icons.active : icons.inactive}
      size={focused ? 25 : 23}
      color={color}
    />
  );
}

export default function MainTabLayout() {
  const { colors, shadows } = useTheme();
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
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: Platform.OS === 'ios' ? 84 : 68,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          ...shadows.sm,
        },
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarAccessibilityLabel: 'Dashboard overview',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon icons={TAB_ICONS.dashboard} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="assessment"
        options={{
          title: 'Assess',
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
    letterSpacing: 0.2,
    marginTop: 2,
  },
  tabItem: {
    borderRadius: BorderRadius.md,
  },
});
