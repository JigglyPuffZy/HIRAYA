import { Image, ImageStyle, StyleProp, StyleSheet } from 'react-native';

const LOGO_TRANSPARENT = require('../../../assets/hiraya-logo-transparent.png');

type BrandLogoSize = 'sm' | 'md' | 'lg' | 'hero';

interface BrandLogoProps {
  size?: BrandLogoSize;
  style?: StyleProp<ImageStyle>;
}

/** Aspect ~2.46 (wide wordmark) — keep logo readable on phone screens. */
const SIZE_MAP: Record<BrandLogoSize, { width: number; height: number }> = {
  sm: { width: 196, height: 80 },
  md: { width: 260, height: 106 },
  lg: { width: 308, height: 125 },
  hero: { width: 344, height: 140 },
};

export function BrandLogo({ size = 'md', style }: BrandLogoProps) {
  const dims = SIZE_MAP[size];

  return (
    <Image
      source={LOGO_TRANSPARENT}
      accessibilityLabel="HIRAYA logo"
      resizeMode="contain"
      style={[styles.logo, dims, style]}
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
});
