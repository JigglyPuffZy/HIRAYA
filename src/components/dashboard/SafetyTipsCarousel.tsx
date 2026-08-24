import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import {
  buildLoopedSafetyTips,
  loopedIndexToRealIndex,
  SafetyTipCarouselItem,
} from '@/utils/safetyTipsCarousel';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { DASHBOARD_ICONS } from '@/constants/dashboardIcons';
import { BorderRadius, FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const AUTO_ADVANCE_MS = 4500;
const PAUSE_AFTER_SWIPE_MS = 8000;

function buildTipsKey(tips: SafetyTipCarouselItem[]): string {
  return tips.map((tip) => tip.id).join('|');
}

interface SafetyTipsCarouselProps {
  tips: SafetyTipCarouselItem[];
  /** Shown above the card when tips are grouped by condition. */
  title?: string;
  /** Hide the in-slide condition chip when title is shown above. */
  showGroupChip?: boolean;
}

export function SafetyTipsCarousel({
  tips,
  title,
  showGroupChip = !title,
}: SafetyTipsCarouselProps) {
  const { colors } = useTheme();
  const { size, isCompact } = useResponsiveLayout();
  const listRef = useRef<FlatList<SafetyTipCarouselItem>>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const loopedIndexRef = useRef(0);
  const userInteractedAtRef = useRef(0);
  const isDraggingRef = useRef(false);

  const tipsKey = buildTipsKey(tips);
  const loopedTips = useMemo(() => buildLoopedSafetyTips(tips), [tipsKey, tips]);
  const isInfinite = tips.length > 1;
  const initializedTipsKeyRef = useRef<string | null>(null);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        groupHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.xs,
          paddingHorizontal: Spacing.xs,
          marginBottom: Spacing.xs,
        },
        groupHeaderText: {
          color: colors.primary,
          fontWeight: '800',
          fontSize: FontSize.sm,
          flexShrink: 1,
        },
        wrap: {
          gap: Spacing.xs,
        },
        card: {
          overflow: 'hidden',
          padding: 0,
        },
        slide: {
          padding: Spacing.lg,
          gap: Spacing.md,
          minHeight: size.carouselMinHeight,
          justifyContent: 'center',
        },
        groupChip: {
          alignSelf: 'flex-start',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: colors.primarySoft,
          paddingHorizontal: Spacing.sm,
          paddingVertical: 6,
          borderRadius: BorderRadius.full,
          maxWidth: '100%',
        },
        groupChipText: {
          color: colors.primary,
          fontWeight: '800',
          fontSize: FontSize.sm,
          flexShrink: 1,
        },
        tipBadgeRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: Spacing.sm,
        },
        tipBadge: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: colors.surfaceMuted,
          paddingHorizontal: Spacing.sm,
          paddingVertical: 6,
          borderRadius: BorderRadius.full,
        },
        tipBadgeText: {
          color: colors.textSecondary,
          fontWeight: '700',
          fontSize: FontSize.sm,
        },
        tipCounter: {
          color: colors.textMuted,
          fontWeight: '600',
        },
        tipText: {
          lineHeight: 24,
          color: colors.text,
          fontSize: FontSize.md,
        },
        footer: {
          flexDirection: isCompact ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: Spacing.sm,
          paddingBottom: Spacing.md,
          paddingHorizontal: Spacing.lg,
        },
        dots: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        },
        dot: {
          height: 6,
          borderRadius: 3,
          backgroundColor: colors.borderLight,
        },
        dotActive: {
          backgroundColor: colors.primary,
        },
        swipeHint: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        },
        swipeHintText: {
          color: colors.textMuted,
          fontSize: 11,
        },
      }),
    [colors, isCompact, size.carouselMinHeight],
  );

  const scrollToLoopedIndex = useCallback(
    (loopedIndex: number, animated = true) => {
      if (containerWidth <= 0 || loopedTips.length === 0) {
        return;
      }

      listRef.current?.scrollToOffset({
        offset: loopedIndex * containerWidth,
        animated,
      });

      loopedIndexRef.current = loopedIndex;

      if (isInfinite) {
        setActiveIndex(loopedIndexToRealIndex(loopedIndex, tips.length));
      } else {
        setActiveIndex(0);
      }
    },
    [containerWidth, isInfinite, loopedTips.length, tips.length],
  );

  const settleLoopedIndex = useCallback(
    (loopedIndex: number) => {
      if (!isInfinite) {
        setActiveIndex(0);
        return;
      }

      if (loopedIndex === 0) {
        const target = tips.length;
        loopedIndexRef.current = target;
        listRef.current?.scrollToOffset({
          offset: target * containerWidth,
          animated: false,
        });
        setActiveIndex(tips.length - 1);
        return;
      }

      if (loopedIndex === loopedTips.length - 1) {
        loopedIndexRef.current = 1;
        listRef.current?.scrollToOffset({
          offset: containerWidth,
          animated: false,
        });
        setActiveIndex(0);
        return;
      }

      loopedIndexRef.current = loopedIndex;
      setActiveIndex(loopedIndexToRealIndex(loopedIndex, tips.length));
    },
    [containerWidth, isInfinite, loopedTips.length, tips.length],
  );

  useEffect(() => {
    if (containerWidth <= 0) {
      return;
    }

    const isNewTips = initializedTipsKeyRef.current !== tipsKey;
    if (isNewTips) {
      initializedTipsKeyRef.current = tipsKey;
      loopedIndexRef.current = isInfinite ? 1 : 0;
      setActiveIndex(0);
    }

    listRef.current?.scrollToOffset({
      offset: loopedIndexRef.current * containerWidth,
      animated: false,
    });
  }, [tipsKey, containerWidth, isInfinite]);

  useEffect(() => {
    if (!isInfinite) {
      return;
    }

    const timer = setInterval(() => {
      if (isDraggingRef.current) {
        return;
      }

      if (Date.now() - userInteractedAtRef.current < PAUSE_AFTER_SWIPE_MS) {
        return;
      }

      const nextLoopedIndex = loopedIndexRef.current + 1;
      scrollToLoopedIndex(nextLoopedIndex, true);

      if (nextLoopedIndex === loopedTips.length - 1) {
        setTimeout(() => {
          settleLoopedIndex(nextLoopedIndex);
        }, 420);
      }
    }, AUTO_ADVANCE_MS);

    return () => clearInterval(timer);
  }, [isInfinite, loopedTips.length, scrollToLoopedIndex, settleLoopedIndex, tipsKey]);

  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (containerWidth <= 0) {
        return;
      }

      const loopedIndex = Math.round(event.nativeEvent.contentOffset.x / containerWidth);
      settleLoopedIndex(loopedIndex);
      userInteractedAtRef.current = Date.now();
    },
    [containerWidth, settleLoopedIndex],
  );

  const renderItem = useCallback(
    ({ item }: { item: SafetyTipCarouselItem }) => (
      <View style={[styles.slide, { width: containerWidth }]}>
        {showGroupChip ? (
          <View style={styles.groupChip}>
            <Ionicons name="medkit-outline" size={14} color={colors.primary} />
            <AppText style={styles.groupChipText} numberOfLines={1}>
              {item.groupLabel}
            </AppText>
          </View>
        ) : null}

        <View style={styles.tipBadgeRow}>
          <View style={styles.tipBadge}>
            <Ionicons name={DASHBOARD_ICONS.safety.tip} size={14} color={colors.textSecondary} />
            <AppText style={styles.tipBadgeText}>
              Tip {item.tipIndexInGroup} of {item.groupTipCount}
            </AppText>
          </View>
          <AppText variant="caption" style={styles.tipCounter}>
            {activeIndex + 1} / {tips.length}
          </AppText>
        </View>

        <AppText variant="body" style={styles.tipText}>
          {item.text}
        </AppText>
      </View>
    ),
    [activeIndex, colors.primary, colors.textSecondary, containerWidth, showGroupChip, styles, tips.length],
  );

  if (tips.length === 0) {
    return null;
  }

  const dotWindowStart = Math.max(0, Math.min(activeIndex - 2, tips.length - 5));
  const visibleDots =
    tips.length <= 7
      ? tips.map((_, index) => index)
      : Array.from({ length: Math.min(5, tips.length) }, (_, index) => dotWindowStart + index);

  return (
    <View style={styles.wrap}>
      {title ? (
        <View style={styles.groupHeader}>
          <Ionicons name="medkit-outline" size={16} color={colors.primary} />
          <AppText style={styles.groupHeaderText} numberOfLines={1}>
            {title}
          </AppText>
        </View>
      ) : null}

      <Card padded={false} style={styles.card}>
      <View
        style={{ width: '100%' }}
        onLayout={(event) => {
          const nextWidth = Math.round(event.nativeEvent.layout.width);
          if (nextWidth > 0 && nextWidth !== containerWidth) {
            setContainerWidth(nextWidth);
          }
        }}
      >
        {containerWidth > 0 ? (
          <FlatList
            ref={listRef}
            key={tipsKey}
            data={loopedTips}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            extraData={activeIndex}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            bounces={false}
            scrollEventThrottle={16}
            getItemLayout={(_, index) => ({
              length: containerWidth,
              offset: containerWidth * index,
              index,
            })}
            onScrollBeginDrag={() => {
              isDraggingRef.current = true;
              userInteractedAtRef.current = Date.now();
            }}
            onScrollEndDrag={() => {
              isDraggingRef.current = false;
            }}
            onMomentumScrollEnd={handleScrollEnd}
            accessibilityLabel="Safety tips carousel. Swipe left or right to browse tips."
          />
        ) : (
          <View style={styles.slide}>{renderItem({ item: tips[0] })}</View>
        )}
      </View>

      {isInfinite ? (
        <View style={styles.footer}>
          <View style={styles.dots}>
            {visibleDots.map((dotIndex) => (
              <View
                key={dotIndex}
                style={[
                  styles.dot,
                  {
                    width: dotIndex === activeIndex ? 18 : 6,
                  },
                  dotIndex === activeIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>
          <View style={styles.swipeHint}>
            <Ionicons name="chevron-forward" size={12} color={colors.textMuted} />
            <AppText variant="caption" style={styles.swipeHintText}>
              Auto-slides · swipe anytime
            </AppText>
          </View>
        </View>
      ) : null}
      </Card>
    </View>
  );
}
