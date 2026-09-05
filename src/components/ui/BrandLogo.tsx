import { Image, ImageStyle, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

const LOGO_TRANSPARENT = require('../../../assets/hiraya-logo-transparent.png');
const LOGO_OPAQUE = require('../../../assets/hiraya-logo.png');

type BrandLogoSize = 'sm' | 'md' | 'lg' | 'hero';

interface BrandLogoProps {
  size?: BrandLogoSize;
  style?: StyleProp<ImageStyle>;
  /** Use on very light surfaces where transparency may be hard to read. */
  variant?: 'transparent' | 'opaque';
  /** Soft glow behind logo on dark surfaces (auth, splash-style headers). */
  withGlow?: boolean;
}

/** Aspect ~1.67 — keep logo readable on phone screens. */
const SIZE_MAP: Record<BrandLogoSize, { width: number; height: number }> = {
  sm: { width: 168, height: 101 },
  md: { width: 248, height: 149 },
  lg: { width: 288, height: 173 },
  hero: { width: 320, height: 192 },
};

export function BrandLogo({
  size = 'md',
  style,
  variant = 'transparent',
  withGlow = false,
}: BrandLogoProps) {
  const { colors, isDark } = useTheme();
  const dims = SIZE_MAP[size];
  const source = variant === 'transparent' ? LOGO_TRANSPARENT : LOGO_OPAQUE;

  const wrapStyle: ViewStyle = withGlow
    ? {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: isDark ? 0.55 : 0.28,
        shadowRadius: 18,
        elevation: 6,
      }
    : {};

  return (
    <View style={[styles.wrap, wrapStyle]}>
      {withGlow ? (
        <View
          style={[
            styles.glow,
            { backgroundColor: isDark ? 'rgba(251,146,60,0.22)' : colors.primaryMuted },
          ]}
        />
      ) : null}
      <Image
        source={source}
        accessibilityLabel="HIRAYA logo"
        resizeMode="contain"
        style={[styles.logo, dims, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    width: '88%',
    height: '72%',
    borderRadius: 999,
    opacity: 0.9,
  },
  logo: {
    alignSelf: 'center',
  },
});
