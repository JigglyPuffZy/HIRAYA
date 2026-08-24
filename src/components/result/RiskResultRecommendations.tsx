import { SafetyRecommendationSection } from '@/types/riskAssessment';

import { filterConditionSafetySections } from '@/services/safety-recommendations/safety-recommendation.engine';

import { StructuredSafetyRecommendations } from '@/components/safety/StructuredSafetyRecommendations';

import { Card } from '@/components/ui/Card';

import { SectionHeader } from '@/components/ui/SectionHeader';

import { AppText } from '@/components/ui/AppText';

import { Spacing } from '@/constants/theme';



interface RiskResultRecommendationsProps {

  structuredSections?: SafetyRecommendationSection[];

}



export function RiskResultRecommendations({

  structuredSections,

}: RiskResultRecommendationsProps) {

  const conditionSections = filterConditionSafetySections(structuredSections ?? []);



  if (conditionSections.length === 0) {

    return null;

  }



  return (

    <Card style={{ gap: Spacing.md }} accessibilityLabel="Safety tips section">

      <SectionHeader title="Safety Tips" icon="shield-checkmark-outline" />

      <StructuredSafetyRecommendations sections={conditionSections} />

    </Card>

  );

}


