import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { AuthScreenLayout } from '@/components/auth/AuthScreenLayout';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { AppText } from '@/components/ui/AppText';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { ROUTES } from '@/constants/routes';
import { resolvePostAuthRoute } from '@/utils/postAuthRoute';
import {
  isValidEmail,
  isValidPassword,
  validateRequired,
} from '@/utils/validation';
import { BorderRadius, Spacing } from '@/constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { colors, isDark, shadows } = useTheme();
  const { register, error, clearError } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!validateRequired(fullName)) {
      nextErrors.fullName = 'Full name is required.';
    }

    if (!isValidEmail(email)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!isValidPassword(password)) {
      nextErrors.password = 'Password must be at least 8 characters.';
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRegister = async () => {
    clearError();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const session = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });
      router.replace(await resolvePostAuthRoute(session.user.id));
    } catch {
      // Error shown via auth context.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthScreenLayout>
      <AuthHeader
        title="Create account"
        subtitle="Join HIRAYA to monitor heat risk in real time."
      />

      <View
        style={[
          styles.formCard,
          shadows.card,
          {
            backgroundColor: isDark ? 'rgba(21, 31, 50, 0.92)' : colors.surface,
            borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.borderLight,
          },
        ]}
      >
        <LinearGradient
          colors={[colors.primaryLight, colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.formAccent}
        />
        <View style={styles.form}>
          <AuthInput
            label="Full name"
            value={fullName}
            onChangeText={setFullName}
            autoComplete="name"
            placeholder="Your full name"
            error={fieldErrors.fullName}
          />
          <AuthInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            placeholder="you@example.com"
            error={fieldErrors.email}
          />
          <AuthInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            placeholder="At least 8 characters"
            error={fieldErrors.password}
          />

          {error ? <ErrorMessage message={error} /> : null}

          <AppText variant="caption" muted style={styles.hint}>
            Use a valid email and a password with at least 8 characters.
          </AppText>

          <AuthButton
            title="Create account"
            onPress={handleRegister}
            loading={isSubmitting}
            fullWidth
          />
        </View>
      </View>

      <View style={styles.footer}>
        <AppText variant="body" muted>
          Already have an account?
        </AppText>
        <Link href={ROUTES.LOGIN} asChild>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => pressed && styles.pressed}
          >
            <AppText style={[styles.link, { color: colors.primary }]}>Sign in</AppText>
          </Pressable>
        </Link>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  formCard: {
    width: '100%',
    borderRadius: BorderRadius.xxl,
    borderWidth: 1,
    padding: Spacing.lg,
    overflow: 'hidden',
  },
  formAccent: {
    height: 3,
    width: '100%',
    marginBottom: Spacing.md,
    borderRadius: 2,
  },
  form: {
    gap: Spacing.md,
  },
  hint: {
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingTop: Spacing.sm,
  },
  link: {
    fontWeight: '700',
    fontSize: 16,
  },
  pressed: {
    opacity: 0.75,
  },
});
