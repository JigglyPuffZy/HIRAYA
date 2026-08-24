import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { ProfileEditForm } from '@/components/profile/ProfileEditForm';
import { ProfileStatusBanner } from '@/components/profile/ProfileStatusBanner';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth, useCurrentUser } from '@/hooks/useAuth';
import { useHealthProfileGate } from '@/hooks/useHealthProfileGate';
import { useUserProfile } from '@/hooks/useUserProfile';
import { PROFILE_FIELD_DEFINITIONS } from '@/constants/profileFields';
import { ROUTES } from '@/constants/routes';
import { BorderRadius, FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

export default function HealthProfileSetupScreen() {
  const router = useRouter();
  const { colors, shadows } = useTheme();
  const user = useCurrentUser();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isComplete, isLoading: gateLoading, refresh } = useHealthProfileGate();
  const {
    formValues,
    fieldErrors,
    isSaving,
    isSaveSuccess,
    isSaveError,
    saveError,
    setFieldValue,
    saveProfile,
    dismissSuccess,
    isLoading: profileLoading,
  } = useUserProfile();

  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    if (!isSaveSuccess) {
      return;
    }

    dismissSuccess();
    void refresh().then((complete) => {
      if (complete) {
        router.replace(ROUTES.DASHBOARD);
      }
    });
  }, [dismissSuccess, isSaveSuccess, refresh, router]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        hero: {
          borderRadius: BorderRadius.xxl,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: colors.accentPeach,
          ...shadows.card,
        },
        heroInner: {
          padding: Spacing.lg,
          gap: Spacing.md,
        },
        iconWrap: {
          width: 56,
          height: 56,
          borderRadius: 18,
          backgroundColor: colors.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: colors.accentPeach,
        },
        title: {
          fontSize: FontSize.xl,
          fontWeight: '800',
          letterSpacing: -0.4,
          color: colors.text,
        },
        subtitle: {
          color: colors.textSecondary,
          lineHeight: 22,
        },
        greeting: {
          color: colors.primary,
          fontWeight: '700',
          fontSize: FontSize.sm,
        },
        checklist: {
          gap: Spacing.xs,
          padding: Spacing.md,
          borderRadius: BorderRadius.lg,
          backgroundColor: colors.chipBackground,
          borderWidth: 1,
          borderColor: colors.glassBorder,
        },
        checklistRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
        },
        checklistText: {
          color: colors.textSecondary,
          fontSize: FontSize.sm,
          flex: 1,
        },
        footer: {
          gap: Spacing.sm,
          padding: Spacing.md,
          borderRadius: BorderRadius.xl,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.borderLight,
          ...shadows.sm,
        },
        footerHint: {
          textAlign: 'center',
          lineHeight: 20,
        },
        sectionGap: {
          gap: Spacing.lg,
        },
      }),
    [colors, shadows],
  );

  const handleSave = async () => {
    setSubmitAttempted(true);
    await saveProfile();
  };

  if (authLoading || gateLoading || profileLoading) {
    return (
      <ScreenContainer scrollable={false} centered decorative>
        <LoadingSpinner
          message="Preparing your health profile..."
          variant="splash"
          icon="fitness-outline"
          size="lg"
        />
      </ScreenContainer>
    );
  }

  if (!isAuthenticated || !user) {
    return <Redirect href={ROUTES.LOGIN} />;
  }

  if (isComplete) {
    return <Redirect href={ROUTES.DASHBOARD} />;
  }

  const firstName = user.fullName.trim().split(/\s+/)[0] || 'there';

  return (
    <ScreenContainer decorative keyboardAvoiding>
      <View style={styles.sectionGap}>
        <View style={styles.hero}>
          <LinearGradient
            colors={[colors.heroGradientStart, colors.heroGradientMid, colors.heroGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroInner}>
            <View style={styles.iconWrap}>
              <Ionicons name="heart-circle-outline" size={28} color={colors.primary} />
            </View>
            <AppText style={styles.greeting}>Welcome, {firstName}</AppText>
            <AppText style={styles.title}>Set up your health profile</AppText>
            <AppText style={styles.subtitle}>
              HIRAYA needs a few details to personalize heat-stroke risk scores and safety tips
              for you in Tuguegarao.
            </AppText>
            <View style={styles.checklist}>
              {[
                'Age and daily activity level',
                'Usual hydration and wellness baseline',
                'Heat-sensitive health conditions (optional)',
              ].map((item) => (
                <View key={item} style={styles.checklistRow}>
                  <Ionicons name="checkmark-circle-outline" size={16} color={colors.primary} />
                  <AppText style={styles.checklistText}>{item}</AppText>
                </View>
              ))}
            </View>
          </View>
        </View>

        {isSaveError && saveError ? (
          <ProfileStatusBanner type="error" message={saveError} />
        ) : null}

        {submitAttempted && Object.keys(fieldErrors).length > 0 ? (
          <ProfileStatusBanner
            type="error"
            message="Please complete all required fields before continuing."
          />
        ) : null}

        <ProfileEditForm
          fields={PROFILE_FIELD_DEFINITIONS}
          values={formValues}
          fieldErrors={fieldErrors}
          onFieldChange={setFieldValue}
          title="Your health details"
          subtitle="Fill in the required fields below"
          showInfoTip={false}
        />

        <View style={styles.footer}>
          <AppText variant="caption" muted style={styles.footerHint}>
            Required fields must be completed before you can use the app.
          </AppText>
          <Button
            title="Save & Continue"
            onPress={handleSave}
            loading={isSaving}
            fullWidth
            accessibilityLabel="Save health profile and continue to dashboard"
          />
        </View>
      </View>
    </ScreenContainer>
  );
}
