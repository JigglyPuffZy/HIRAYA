import { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface IconCircleProps {
  name: IoniconName;
  size?: number;
  iconSize?: number;
  color?: string;
  backgroundColor?: string;
  borderless?: boolean;
  elevated?: boolean;
}

export function IconCircle({
  name,
  size = 72,
  iconSize = 32,
  color,
  backgroundColor,
  borderless = false,
  elevated = false,
}: IconCircleProps) {
  const { colors, shadows } = useTheme();

  return (
    <View
      style={[
        styles.circle,
        borderless && styles.borderless,
        elevated && shadows.card,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: backgroundColor ?? colors.surfaceMuted,
          borderColor: colors.borderLight,
        },
      ]}
    >
      <Ionicons name={name} size={iconSize} color={color ?? colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  borderless: {
    borderWidth: 0,
  },
});
