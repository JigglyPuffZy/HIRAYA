import { useMemo } from 'react';

import { StyleSheet, View } from 'react-native';

import { useRouter } from 'expo-router';

import { ScreenContainer } from '@/components/layout/ScreenContainer';

import { ProfileHero } from '@/components/profile/ProfileHero';

import { ProfileQuickStats } from '@/components/profile/ProfileQuickStats';

import { ProfileFieldsView } from '@/components/profile/ProfileFieldsView';

import { ProfileEditForm } from '@/components/profile/ProfileEditForm';

import { ProfileMenuList } from '@/components/profile/ProfileMenuList';

import { ProfileStatusBanner } from '@/components/profile/ProfileStatusBanner';

import { Button } from '@/components/ui/Button';

import { AppText } from '@/components/ui/AppText';

import { ProfileSkeleton } from '@/components/ui/ContentSkeletons';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

import { useAuth, useCurrentUser } from '@/hooks/useAuth';

import { useUserProfile } from '@/hooks/useUserProfile';

import { PROFILE_FIELD_DEFINITIONS } from '@/constants/profileFields';

import { ROUTES } from '@/constants/routes';

import { BorderRadius, FontSize, Spacing } from '@/constants/theme';

import { getProfileCompletionPercent } from '@/utils/profileCompletion';

import { useTheme } from '@/context/ThemeContext';



export default function ProfileScreen() {

  const router = useRouter();

  const { colors, shadows } = useTheme();

  const user = useCurrentUser();

  const { logout } = useAuth();

  const {

    profile,

    formValues,

    fieldErrors,

    isEditing,

    isLoading,

    isSaving,

    isSaveSuccess,

    isSaveError,

    saveError,

    hasProfileFieldsConfigured,

    setFieldValue,

    startEditing,

    cancelEditing,

    saveProfile,

    dismissSuccess,

  } = useUserProfile();



  const fieldValues = profile?.fields ?? {};

  const completionPercent = getProfileCompletionPercent(

    PROFILE_FIELD_DEFINITIONS,

    fieldValues,

  );



  const styles = useMemo(

    () =>

      StyleSheet.create({

        pageTitle: {

          fontSize: FontSize.xxl,

          fontWeight: '800',

          letterSpacing: -0.6,

          color: colors.text,

        },

        pageSubtitle: {

          color: colors.textSecondary,

          lineHeight: 22,

          marginTop: 4,

        },

        sectionGap: {

          gap: Spacing.lg,

        },

        editBar: {

          gap: Spacing.sm,

          padding: Spacing.md,

          borderRadius: BorderRadius.xl,

          backgroundColor: colors.surface,

          borderWidth: 1,

          borderColor: colors.borderLight,

          ...shadows.sm,

        },

        editBarHint: {

          textAlign: 'center',

          marginBottom: Spacing.xs,

        },

      }),

    [colors, shadows],

  );



  const handleLogout = async () => {

    await logout();

    router.replace(ROUTES.LOGIN);

  };



  const menuItems = [

    {

      id: 'settings',

      label: 'Settings',

      subtitle: 'Appearance and app information',

      icon: 'settings-outline' as const,

      onPress: () => router.push(ROUTES.SETTINGS),

    },

    {

      id: 'about',

      label: 'About',

      subtitle: 'App version and medical disclaimer',

      icon: 'information-circle-outline' as const,

      onPress: () => router.push(ROUTES.ABOUT),

    },

    {

      id: 'privacy',

      label: 'Privacy',

      subtitle: 'How your data is used',

      icon: 'shield-checkmark-outline' as const,

      onPress: () => router.push(ROUTES.PRIVACY),

    },

    {

      id: 'terms',

      label: 'Terms of use',

      subtitle: 'Important usage guidelines',

      icon: 'document-text-outline' as const,

      onPress: () => router.push(ROUTES.TERMS),

    },

    {

      id: 'logout',

      label: 'Sign Out',

      subtitle: 'Log out of your HIRAYA account',

      icon: 'log-out-outline' as const,

      onPress: () => void handleLogout(),

      destructive: true,

    },

  ];



  if (!user) {

    return null;

  }



  return (

    <ScreenContainer decorative>

      <View>

        <AppText style={styles.pageTitle}>Profile</AppText>

        <AppText style={styles.pageSubtitle}>

          Manage your account and health details for personalized heat-risk guidance.

        </AppText>

      </View>



      {isSaveSuccess ? (

        <ProfileStatusBanner

          type="success"

          message="Profile saved successfully."

          onDismiss={dismissSuccess}

        />

      ) : null}



      {isSaveError && saveError ? (

        <ProfileStatusBanner type="error" message={saveError} />

      ) : null}



      <View style={styles.sectionGap}>

        <ProfileHero

          profile={{

            userId: user.id,

            fullName: user.fullName || 'User',

            email: user.email,

            memberSince: user.createdAt,

            fields: fieldValues,

            updatedAt: profile?.updatedAt ?? null,

          }}

          completionPercent={completionPercent}

          isEditing={isEditing}

          onEditPress={startEditing}

          editDisabled={!hasProfileFieldsConfigured || isEditing || isLoading}

        />



        {isSaving ? (

          <LoadingSpinner message="Saving profile..." variant="card" icon="save-outline" size="sm" />

        ) : null}



        {isLoading ? (

          <>

            <LoadingSpinner message="Loading health profile..." variant="card" icon="fitness-outline" size="md" />

            <ProfileSkeleton />

          </>

        ) : (

          <>

            {!isEditing ? <ProfileQuickStats fields={fieldValues} /> : null}



            {isEditing ? (

              <>

                <ProfileEditForm

                  fields={PROFILE_FIELD_DEFINITIONS}

                  values={formValues}

                  fieldErrors={fieldErrors}

                  onFieldChange={setFieldValue}

                />



                <View style={styles.editBar}>

                  <AppText variant="caption" muted style={styles.editBarHint}>

                    Review your details before saving

                  </AppText>

                  <Button

                    title="Save Changes"

                    onPress={saveProfile}

                    loading={isSaving}

                    fullWidth

                    accessibilityLabel="Save profile changes"

                  />

                  <Button

                    title="Cancel"

                    variant="outline"

                    onPress={cancelEditing}

                    disabled={isSaving}

                    fullWidth

                    accessibilityLabel="Cancel editing"

                  />

                </View>

              </>

            ) : (

              <>

                <ProfileFieldsView

                  fields={PROFILE_FIELD_DEFINITIONS}

                  values={fieldValues}

                />

                <ProfileMenuList items={menuItems} />

              </>

            )}

          </>

        )}

      </View>

    </ScreenContainer>

  );

}


