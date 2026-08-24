import { FlatList, StyleSheet, View } from 'react-native';
import { AssessmentHistoryItem } from '@/types/assessmentHistory';
import { AssessmentHistoryCard } from '@/components/history/AssessmentHistoryCard';
import { Spacing } from '@/constants/theme';

interface AssessmentHistoryListProps {
  items: AssessmentHistoryItem[];
  onSelect: (item: AssessmentHistoryItem) => void;
}

export function AssessmentHistoryList({
  items,
  onSelect,
}: AssessmentHistoryListProps) {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <AssessmentHistoryCard item={item} onPress={onSelect} />
      )}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      scrollEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: Spacing.sm,
  },
  separator: {
    height: Spacing.md,
  },
});
