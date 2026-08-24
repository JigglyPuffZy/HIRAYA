import { Image, ImageStyle, StyleProp, StyleSheet } from 'react-native';

const LOGO = require('../../../assets/hiraya-logo.png');

type BrandLogoSize = 'sm' | 'md' | 'lg' | 'hero';

interface BrandLogoProps {
  size?: BrandLogoSize;
  style?: StyleProp<ImageStyle>;
}

const SIZE_MAP: Record<BrandLogoSize, { width: number; height: number }> = {
  sm: { width: 120, height: 40 },
  md: { width: 180, height: 60 },
  lg: { width: 240, height: 80 },
  hero: { width: 280, height: 96 },
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
