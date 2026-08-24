import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface ProfileStatusBannerProps {
  type: 'success' | 'error';
  message: string;
  onDismiss?: () => void;
}

export function ProfileStatusBanner({
  type,
  message,
  onDismiss,
}: ProfileStatusBannerProps) {
  const { colors } = useTheme();
  const isSuccess = type === 'success';

  useEffect(() => {
    if (type !== 'success' || !onDismiss) {
      return;
    }

    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [type, onDismiss]);

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: isSuccess ? colors.successSoft : colors.errorSoft,
          borderColor: isSuccess ? colors.successBorder : colors.error,
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Ionicons
        name={isSuccess ? 'checkmark-circle' : 'alert-circle'}
        size={18}
        color={isSuccess ? colors.success : colors.error}
      />
      <AppText
        variant="body"
        style={{
          flex: 1,
          lineHeight: 22,
          color: isSuccess ? colors.success : colors.error,
        }}
      >
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
});
