import { useMemo } from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useTheme } from '@/context/ThemeContext';

type TextVariant = 'display' | 'title' | 'subtitle' | 'body' | 'caption' | 'label';

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  muted?: boolean;
}

export function AppText({
  variant = 'body',
  muted = false,
  style,
  ...props
}: AppTextProps) {
  const { colors } = useTheme();
  const { font } = useResponsiveLayout();

  const variantStyles = useMemo(
    () =>
      StyleSheet.create({
        display: {
          fontSize: font.display,
          fontWeight: '800',
          lineHeight: Math.round(font.display * 1.15),
          letterSpacing: -1.2,
        },
        title: {
          fontSize: font.title,
          fontWeight: '700',
          lineHeight: Math.round(font.title * 1.22),
          letterSpacing: -0.6,
        },
        subtitle: {
          fontSize: font.subtitle,
          fontWeight: '600',
          lineHeight: Math.round(font.subtitle * 1.25),
          letterSpacing: -0.3,
        },
        body: {
          fontSize: font.body,
          lineHeight: Math.round(font.body * 1.5),
        },
        caption: {
          fontSize: font.caption,
          lineHeight: Math.round(font.caption * 1.4),
        },
        label: {
          fontSize: font.label,
          fontWeight: '600',
          lineHeight: Math.round(font.label * 1.4),
          letterSpacing: 0.1,
        },
      }),
    [font],
  );

  return (
    <Text
      style={[
        { color: colors.text },
        variantStyles[variant],
        muted && { color: colors.textMuted },
        style,
      ]}
      maxFontSizeMultiplier={1.25}
      {...props}
    />
  );
}
