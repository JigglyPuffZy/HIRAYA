import { SafetyRecommendationSection } from '@/types/riskAssessment';
import { filterConditionSafetySections } from '@/services/safety-recommendations/safety-recommendation.engine';

export interface SafetyTipCarouselItem {
  id: string;
  text: string;
  groupId: string;
  groupLabel: string;
  tipIndexInGroup: number;
  groupTipCount: number;
}

export interface SafetyTipCarouselGroup {
  id: string;
  label: string;
  tips: SafetyTipCarouselItem[];
}

function resolveGroupLabel(section: SafetyRecommendationSection): string {
  if (section.id.startsWith('condition_')) {
    return section.title.replace(/^Safety Tips for /i, '').trim() || section.title;
  }

  return section.title;
}

function normalizeTipText(tip: string): string {
  return tip.replace(/^•\s*/, '').replace(/^---\s*|\s*---$/g, '').trim();
}

function buildGroupFromSection(
  section: SafetyRecommendationSection,
): SafetyTipCarouselGroup | null {
  const groupId = section.id;
  const groupLabel = resolveGroupLabel(section);
  const validTips = section.tips
    .map(normalizeTipText)
    .filter((text) => text.length > 0 && !text.startsWith('---'));

  if (validTips.length === 0) {
    return null;
  }

  return {
    id: groupId,
    label: groupLabel,
    tips: validTips.map((text, index) => ({
      id: `${groupId}-${index}`,
      text,
      groupId,
      groupLabel,
      tipIndexInGroup: index + 1,
      groupTipCount: validTips.length,
    })),
  };
}

/** One carousel group per selected health condition only. */
export function buildSafetyTipCarouselGroups(
  structuredSections?: SafetyRecommendationSection[],
): SafetyTipCarouselGroup[] {
  return filterConditionSafetySections(structuredSections ?? [])
    .map(buildGroupFromSection)
    .filter((group): group is SafetyTipCarouselGroup => group !== null);
}

/** @deprecated Use buildSafetyTipCarouselGroups for separate condition carousels. */
export function buildSafetyTipCarouselItems(
  structuredSections?: SafetyRecommendationSection[],
): SafetyTipCarouselItem[] {
  return buildSafetyTipCarouselGroups(structuredSections).flatMap(
    (group) => group.tips,
  );
}

export function buildLoopedSafetyTips(
  tips: SafetyTipCarouselItem[],
): SafetyTipCarouselItem[] {
  if (tips.length <= 1) {
    return tips;
  }

  const first = tips[0];
  const last = tips[tips.length - 1];

  return [
    { ...last, id: `__loop_head__${last.id}` },
    ...tips,
    { ...first, id: `__loop_tail__${first.id}` },
  ];
}

export function loopedIndexToRealIndex(
  loopedIndex: number,
  tipCount: number,
): number {
  if (tipCount <= 1) {
    return 0;
  }

  if (loopedIndex === 0) {
    return tipCount - 1;
  }

  if (loopedIndex === tipCount + 1) {
    return 0;
  }

  return loopedIndex - 1;
}
