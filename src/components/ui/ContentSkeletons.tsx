import { StyleSheet, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { GradientSurface } from '@/components/ui/GradientSurface';
import { Skeleton, SkeletonCircle, SkeletonGroup } from '@/components/ui/Skeleton';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

export function RiskStatusSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={[styles.riskHero, { backgroundColor: colors.surfaceMuted, borderColor: colors.borderLight }]}>
      <View style={styles.riskBody}>
        <SkeletonGroup style={styles.riskLeft}>
          <Skeleton width={100} height={12} borderRadius={BorderRadius.full} />
          <Skeleton width="70%" height={32} borderRadius={BorderRadius.lg} />
          <Skeleton width={80} height={10} borderRadius={BorderRadius.full} />
        </SkeletonGroup>
        <SkeletonCircle size={72} />
      </View>
    </View>
  );
}

export function WeatherPanelSkeleton() {
  const { colors } = useTheme();

  return (
    <GradientSurface
      preset="sky"
      style={{ ...styles.weatherCard, borderColor: colors.borderLight }}
    >
      <View style={styles.weatherInner}>
        <View style={styles.weatherTopRow}>
          <Skeleton width="55%" height={28} borderRadius={BorderRadius.full} />
          <Skeleton width={56} height={28} borderRadius={BorderRadius.full} />
        </View>
        <View style={styles.weatherHero}>
          <SkeletonCircle size={80} />
          <Skeleton width={120} height={48} borderRadius={BorderRadius.lg} />
          <Skeleton width="60%" height={18} borderRadius={BorderRadius.md} />
          <Skeleton width={90} height={12} borderRadius={BorderRadius.full} />
        </View>
        <View style={styles.metricsRow}>
          <Skeleton style={styles.metric} height={72} borderRadius={BorderRadius.lg} />
          <Skeleton style={styles.metric} height={72} borderRadius={BorderRadius.lg} />
          <Skeleton style={styles.metric} height={72} borderRadius={BorderRadius.lg} />
        </View>
      </View>
    </GradientSurface>
  );
}

export function ProfileSkeleton() {
  return (
    <View style={styles.profileWrap}>
      <Card variant="soft">
        <View style={styles.profileHeader}>
          <SkeletonCircle size={56} />
          <SkeletonGroup style={styles.profileMeta}>
            <Skeleton width="55%" height={18} />
            <Skeleton width="40%" height={12} />
          </SkeletonGroup>
        </View>
      </Card>
      <Card>
        <SkeletonGroup>
          <Skeleton width="35%" height={14} />
          <Skeleton height={44} borderRadius={BorderRadius.lg} />
          <Skeleton width="35%" height={14} />
          <Skeleton height={44} borderRadius={BorderRadius.lg} />
          <Skeleton width="35%" height={14} />
          <Skeleton height={44} borderRadius={BorderRadius.lg} />
        </SkeletonGroup>
      </Card>
    </View>
  );
}

export function HistoryListSkeleton() {
  return (
    <View style={styles.historyWrap}>
      {[0, 1, 2].map((key) => (
        <Card key={key} variant="soft">
          <View style={styles.historyRow}>
            <SkeletonCircle size={44} />
            <SkeletonGroup style={styles.historyMeta}>
              <Skeleton width="50%" height={16} />
              <Skeleton width="35%" height={12} />
              <Skeleton width="70%" height={12} />
            </SkeletonGroup>
            <Skeleton width={48} height={24} borderRadius={BorderRadius.full} />
          </View>
        </Card>
      ))}
    </View>
  );
}

export function ResultSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={styles.resultWrap}>
      <View style={[styles.resultBanner, { backgroundColor: colors.surfaceMuted, borderColor: colors.borderLight }]}>
        <SkeletonCircle size={40} />
        <SkeletonGroup style={styles.resultBannerText}>
          <Skeleton width="60%" height={22} />
          <Skeleton width="40%" height={12} />
        </SkeletonGroup>
      </View>
      <Card>
        <SkeletonGroup>
          <Skeleton width="45%" height={14} />
          <Skeleton height={56} borderRadius={BorderRadius.lg} />
          <Skeleton height={56} borderRadius={BorderRadius.lg} />
        </SkeletonGroup>
      </Card>
      <Card variant="soft">
        <SkeletonGroup>
          <Skeleton width="50%" height={14} />
          <Skeleton height={14} />
          <Skeleton height={14} />
          <Skeleton width="85%" height={14} />
        </SkeletonGroup>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  riskHero: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  riskBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  riskLeft: {
    flex: 1,
  },
  weatherCard: {
    borderWidth: 1,
  },
  weatherInner: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  weatherTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  weatherHero: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  metric: {
    flex: 1,
  },
  profileWrap: {
    gap: Spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  profileMeta: {
    flex: 1,
  },
  historyWrap: {
    gap: Spacing.md,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  historyMeta: {
    flex: 1,
  },
  resultWrap: {
    gap: Spacing.lg,
  },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  resultBannerText: {
    flex: 1,
  },
});
