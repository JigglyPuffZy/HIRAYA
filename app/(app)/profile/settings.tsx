import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { APP_INFO } from '@/constants/appInfo';
import {
  env,
  getActiveWeatherProvider,
  isApiConfigured,
  isSupabaseConfigured,
  isWeatherApiConfigured,
} from '@/config/env';
import { testBackendConnection } from '@/services/backendHealthService';
import { BorderRadius, Spacing } from '@/constants/theme';
import { ColorSchemePreference, useTheme } from '@/context/ThemeContext';

const APPEARANCE_OPTIONS: { id: ColorSchemePreference; label: string }[] = [
  { id: 'dark', label: 'Dark' },
  { id: 'light', label: 'Light' },
  { id: 'system', label: 'System' },
];

function weatherProviderLabel(): string {
  switch (getActiveWeatherProvider()) {
    case 'openmeteo':
      return 'Open-Meteo';
    case 'weatherapi':
      return 'WeatherAPI.com';
    case 'openweather':
      return 'OpenWeatherMap';
    default:
      return 'Not configured';
  }
}

export default function SettingsScreen() {
  const { colors, preference, setPreference } = useTheme();
  const [isTesting, setIsTesting] = useState(false);
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const [testOk, setTestOk] = useState<boolean | null>(null);

  const handleTestBackend = async () => {
    setIsTesting(true);
    setTestMessage(null);
    setTestOk(null);

    const result = await testBackendConnection();
    setTestOk(result.ok);
    setTestMessage(result.message);
    setIsTesting(false);
  };

  return (
    <ScreenContainer>
      <Header
        title="Settings"
        subtitle="Appearance and app information."
        showBack
      />

      <Card style={styles.card}>
        <SectionHeader title="Appearance" icon="moon-outline" />
        <View style={styles.appearanceRow}>
          {APPEARANCE_OPTIONS.map((option) => {
            const selected = preference === option.id;
            return (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => void setPreference(option.id)}
                style={[
                  styles.appearanceChip,
                  {
                    backgroundColor: selected ? colors.primarySoft : colors.surfaceMuted,
                    borderColor: selected ? colors.primary : colors.borderLight,
                  },
                ]}
              >
                <AppText
                  variant="label"
                  style={{ color: selected ? colors.primary : colors.textSecondary }}
                >
                  {option.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
        <AppText variant="caption" muted>
          Dark mode improves visibility in low light. Choose System to follow your phone.
        </AppText>
      </Card>

      <Card style={styles.card}>
        <SectionHeader title="App" icon="information-circle-outline" />
        <SettingRow label="App version" value={APP_INFO.version} configured />
        <SettingRow label="Study area" value={APP_INFO.studyArea} configured />
        <SettingRow
          label="Account sync"
          value={isSupabaseConfigured() ? 'Enabled' : 'Not configured'}
          configured={isSupabaseConfigured()}
        />
        <SettingRow
          label="Weather"
          value={weatherProviderLabel()}
          configured={isWeatherApiConfigured()}
        />
        <AppText variant="caption" muted style={styles.disclaimer}>
          {APP_INFO.medicalDisclaimer}
        </AppText>
      </Card>

      {__DEV__ ? (
        <>
          <Card style={styles.card}>
            <SectionHeader title="Developer" icon="code-slash-outline" />
            <SettingRow
              label="API URL"
              value={isApiConfigured() ? env.apiUrl : 'Not configured'}
              configured={isApiConfigured()}
            />
            <SettingRow
              label="WeatherAPI key"
              value={env.weatherApiKey ? 'Configured' : 'Not set'}
              configured={env.weatherApiKey.length > 0}
            />
            <SettingRow
              label="OpenWeather key"
              value={env.openWeatherApiKey ? 'Configured' : 'Not set'}
              configured={env.openWeatherApiKey.length > 0}
            />
          </Card>

          <Card style={styles.card}>
            <SectionHeader title="Backend" icon="server-outline" />
            <Button
              title="Test backend connection"
              onPress={handleTestBackend}
              loading={isTesting}
              fullWidth
              variant="outline"
            />
            {testMessage && testOk ? (
              <View
                style={[
                  styles.successBox,
                  {
                    backgroundColor: colors.successSoft,
                    borderColor: colors.successBorder,
                  },
                ]}
              >
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <AppText
                  variant="body"
                  style={[styles.successText, { color: colors.success }]}
                >
                  {testMessage}
                </AppText>
              </View>
            ) : null}
            {testMessage && !testOk ? <ErrorMessage message={testMessage} /> : null}
          </Card>

          <AppText variant="caption" muted style={styles.note}>
            Developer tools are hidden in release builds. After changing .env, restart with
            npx expo start --clear.
          </AppText>
        </>
      ) : null}
    </ScreenContainer>
  );
}

function SettingRow({
  label,
  value,
  configured,
}: {
  label: string;
  value: string;
  configured: boolean;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.row, { borderTopColor: colors.borderLight }]}>
      <View style={styles.rowLeft}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: configured ? colors.success : colors.textMuted },
          ]}
        />
        <AppText variant="label">{label}</AppText>
      </View>
      <AppText variant="body" muted={!configured} numberOfLines={2} style={styles.rowValue}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.md,
  },
  appearanceRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  appearanceChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    minHeight: 44,
  },
  row: {
    gap: Spacing.xs,
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rowValue: {
    paddingLeft: 18,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
  },
  successText: {
    flex: 1,
    lineHeight: 22,
  },
  disclaimer: {
    lineHeight: 20,
    marginTop: Spacing.xs,
  },
  note: {
    lineHeight: 20,
  },
});
