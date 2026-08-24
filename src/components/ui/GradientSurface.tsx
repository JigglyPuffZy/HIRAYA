import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BorderRadius, getGradientPresets } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

type GradientPreset = 'hero' | 'primary' | 'warm' | 'soft' | 'sky';

interface GradientSurfaceProps {
  children: ReactNode;
  preset?: GradientPreset;
  style?: ViewStyle;
  borderRadius?: number;
}

export function GradientSurface({
  children,
  preset = 'hero',
  style,
  borderRadius = BorderRadius.xxl,
}: GradientSurfaceProps) {
  const { colors } = useTheme();
  const presets = getGradientPresets(colors);
  const config = presets[preset];

  return (
    <View style={[styles.wrap, { borderRadius }, style]}>
      <LinearGradient
        colors={[...config.colors]}
        start={config.start}
        end={config.end}
        style={[StyleSheet.absoluteFill, { borderRadius }]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    position: 'relative',
  },
});
