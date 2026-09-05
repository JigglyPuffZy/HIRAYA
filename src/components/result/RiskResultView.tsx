import { StyleSheet, View } from 'react-native';
import { RiskResultPayload } from '@/types/prediction';
import { RiskLevelBanner } from '@/components/result/RiskLevelBanner';
import { RiskResultWeatherSection } from '@/components/result/RiskResultWeatherSection';
import { RiskResultAssessmentSection } from '@/components/result/RiskResultAssessmentSection';
import { RiskResultRecommendations } from '@/components/result/RiskResultRecommendations';
import { RiskExplanationSection } from '@/components/result/RiskExplanationSection';
import { AppText } from '@/components/ui/AppText';
import { Spacing } from '@/constants/theme';
import { formatDateTime } from '@/utils/formatters';

interface RiskResultViewProps {
  payload: RiskResultPayload;
}

export function RiskResultView({ payload }: RiskResultViewProps) {
  const { prediction, weather, assessment, profile, submittedAt } = payload;

  return (
    <View style={styles.container}>
      <RiskLevelBanner
        riskLevel={prediction.riskLevel}
        score={prediction.prediction}
        assessedAt={submittedAt}
        heatIndexC={weather.heatIndex}
      />

      <RiskExplanationSection
        riskLevel={prediction.riskLevel}
        explanation={prediction.riskExplanation}
        primaryRiskFactors={prediction.primaryRiskFactors}
      />

      <RiskResultRecommendations structuredSections={prediction.structuredRecommendations} />

      <RiskResultWeatherSection weather={weather} />

      <RiskResultAssessmentSection assessment={assessment} profile={profile} />

      <View style={styles.footerMeta}>
        <AppText variant="caption" muted>
          {formatDateTime(submittedAt)}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.lg,
  },
  footerMeta: {
    paddingTop: Spacing.xs,
  },
});
