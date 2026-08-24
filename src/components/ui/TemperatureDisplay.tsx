import { StyleSheet, View, ViewStyle } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useTheme } from '@/context/ThemeContext';
import { formatTemperatureValue } from '@/utils/formatters';

type TemperatureSize = 'sm' | 'md' | 'lg' | 'hero';

interface TemperatureDisplayProps {
  celsius: number;
  size?: TemperatureSize;
  style?: ViewStyle;
}

export function TemperatureDisplay({
  celsius,
  size = 'lg',
  style,
}: TemperatureDisplayProps) {
  const { colors } = useTheme();
  const { font, s } = useResponsiveLayout();
  const displayValue = formatTemperatureValue(celsius);

  const sizes: Record<
    TemperatureSize,
    { value: { fontSize: number; lineHeight: number }; unit: { fontSize: number; lineHeight: number } }
  > = {
    sm: {
      value: { fontSize: font.subtitle, lineHeight: Math.round(font.subtitle * 1.2) },
      unit: { fontSize: font.caption, lineHeight: Math.round(font.caption * 1.4) },
    },
    md: {
      value: { fontSize: font.title, lineHeight: Math.round(font.title * 1.15) },
      unit: { fontSize: font.body, lineHeight: Math.round(font.body * 1.5) },
    },
    lg: {
      value: { fontSize: s(36), lineHeight: s(42) },
      unit: { fontSize: font.subtitle, lineHeight: Math.round(font.subtitle * 1.25) },
    },
    hero: {
      value: { fontSize: font.tempHero, lineHeight: Math.round(font.tempHero * 1.08) },
      unit: { fontSize: font.tempHeroUnit, lineHeight: Math.round(font.tempHeroUnit * 1.25) },
    },
  };

  const selected = sizes[size];

  return (
    <View style={[styles.row, style]} accessibilityLabel={`${displayValue} degrees Celsius`}>
      <AppText style={[styles.value, selected.value, { color: colors.text }]}>
        {displayValue}
      </AppText>
      <AppText style={[styles.unit, selected.unit, { color: colors.textSecondary }]}>
        °C
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  value: {
    fontWeight: '800',
    letterSpacing: -1,
  },
  unit: {
    fontWeight: '600',
    marginTop: 4,
    marginLeft: 2,
  },
});
