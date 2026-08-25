import { Image, ImageStyle, StyleProp, StyleSheet } from 'react-native';

const LOGO = require('../../../assets/hiraya-logo.png');

type BrandLogoSize = 'sm' | 'md' | 'lg' | 'hero';

interface BrandLogoProps {
  size?: BrandLogoSize;
  style?: StyleProp<ImageStyle>;
}

/** Aspect ~1.64 after crop — keep logo readable on phone screens. */
const SIZE_MAP: Record<BrandLogoSize, { width: number; height: number }> = {
  sm: { width: 148, height: 90 },
  md: { width: 220, height: 134 },
  lg: { width: 280, height: 171 },
  hero: { width: 320, height: 195 },
};

export function BrandLogo({ size = 'md', style }: BrandLogoProps) {
  const dims = SIZE_MAP[size];

  return (
    <Image
      source={LOGO}
      accessibilityLabel="HIRAYA logo"
      resizeMode="contain"
      style={[styles.logo, dims, style]}
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    alignSelf: 'center',
  },
});
