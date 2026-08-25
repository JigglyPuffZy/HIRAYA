import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { AuthScreenLayout } from '@/components/auth/AuthScreenLayout';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { Card } from '@/components/ui/Card';
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
import { Spacing } from '@/constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { colors } = useTheme();
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
      // Error (including email-confirm instructions) shown via auth context.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthScreenLayout>
      <AuthHeader
        title="Create account"
        subtitle="Join HIRAYA to monitor heat stroke risk in real time."
      />

      <Card variant="elevated" style={styles.formCard}>
        <View style={styles.form}>
          <AuthInput
            label="Full Name"
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
            Use a real email and password (8+ characters). If create account says
            “confirm email”, open Supabase → Authentication → Providers → Email and
            turn OFF Confirm email, then try again.
          </AppText>

          <AuthButton
            title="Create Account"
            onPress={handleRegister}
            loading={isSubmitting}
            fullWidth
          />
        </View>
      </Card>

      <View style={styles.footer}>
        <AppText variant="body" muted>
          Already have an account?
        </AppText>
        <Link href={ROUTES.LOGIN} asChild>
          <Pressable accessibilityRole="button" style={({ pressed }) => pressed && styles.pressed}>
            <AppText style={[styles.link, { color: colors.primary }]}>Sign in</AppText>
          </Pressable>
        </Link>
      </View>

      <AuthButton
        title="Back to Login"
        variant="outline"
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
            return;
          }

          router.replace(ROUTES.LOGIN);
        }}
        fullWidth
      />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  formCard: {
    width: '100%',
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
