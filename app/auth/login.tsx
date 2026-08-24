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
import { isValidEmail, isValidPassword } from '@/utils/validation';
import { Spacing } from '@/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { login, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!isValidEmail(email)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!isValidPassword(password)) {
      nextErrors.password = 'Password must be at least 8 characters.';
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = async () => {
    clearError();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const session = await login({ email: email.trim(), password });
      router.replace(await resolvePostAuthRoute(session.user.id));
    } catch {
      // Error is handled in auth context.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthScreenLayout>
      <AuthHeader
        title="Welcome back"
        subtitle="Sign in to access your heat safety dashboard."
      />

      <Card variant="elevated" style={styles.formCard}>
        <View style={styles.form}>
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
            autoComplete="password"
            placeholder="Your password"
            error={fieldErrors.password}
          />

          {error ? <ErrorMessage message={error} /> : null}

          <AuthButton
            title="Sign In"
            onPress={handleLogin}
            loading={isSubmitting}
            fullWidth
          />
        </View>
      </Card>

      <View style={styles.footer}>
        <AppText variant="body" muted>
          Don&apos;t have an account?
        </AppText>
        <Link href={ROUTES.REGISTER} asChild>
          <Pressable accessibilityRole="button" style={({ pressed }) => pressed && styles.pressed}>
            <AppText style={[styles.link, { color: colors.primary }]}>Create account</AppText>
          </Pressable>
        </Link>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  formCard: {
    width: '100%',
  },
  form: {
    gap: Spacing.md,
    width: '100%',
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
