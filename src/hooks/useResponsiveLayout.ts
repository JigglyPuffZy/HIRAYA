import { useMemo } from 'react';
import { PixelRatio, useWindowDimensions } from 'react-native';
import { FontSize, Layout, Spacing } from '@/constants/theme';

const REFERENCE_WIDTH = 390;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/** Scale a design-token size to the current screen width. */
export function scaleSize(size: number, width: number) {
  const scaled = (size * width) / REFERENCE_WIDTH;
  return Math.round(
    PixelRatio.roundToNearestPixel(clamp(scaled, size * 0.86, size * 1.14)),
  );
}

export function useResponsiveLayout() {
  const { width, height, fontScale } = useWindowDimensions();

  return useMemo(() => {
    const isCompact = width < 360;
    const isSmallPhone = width < 375;
    const isLargePhone = width >= 428;
    const isShortScreen = height < 700;

    const screenPadding = isCompact
      ? Spacing.md
      : isSmallPhone
        ? Spacing.md + 4
        : Spacing.lg;

    const maxContentWidth = Math.min(width, Layout.maxContentWidth);
    const s = (size: number) => scaleSize(size, width);

    return {
      width,
      height,
      fontScale,
      isCompact,
      isSmallPhone,
      isLargePhone,
      isShortScreen,
      screenPadding,
      maxContentWidth,
      contentWidth: width - screenPadding * 2,
      scale: width / REFERENCE_WIDTH,
      s,
      font: {
        display: s(FontSize.display),
        title: s(FontSize.xxl),
        subtitle: s(FontSize.xl),
        body: s(FontSize.md),
        caption: s(FontSize.sm),
        label: s(FontSize.sm),
        heroGreeting: s(isCompact ? 26 : isLargePhone ? 32 : 30),
        sectionTitle: s(17),
        riskLevel: s(isCompact ? 28 : 32),
        tempHero: s(isCompact ? 40 : isLargePhone ? 52 : 48),
        tempHeroUnit: s(isCompact ? FontSize.lg : FontSize.xl),
      },
      size: {
        carouselMinHeight: s(isShortScreen ? 132 : isCompact ? 150 : 176),
        scoreRing: s(isCompact ? 60 : 72),
        weatherIconOrb: s(isCompact ? 48 : 56),
        quickActionIcon: s(isCompact ? 40 : 44),
        sectionIcon: s(isCompact ? 20 : 22),
      },
    };
  }, [width, height, fontScale]);
}
