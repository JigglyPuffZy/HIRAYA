import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface ProfileMenuItem {
  id: string;
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
}

interface ProfileMenuListProps {
  items: ProfileMenuItem[];
}

export function ProfileMenuList({ items }: ProfileMenuListProps) {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          gap: 0,
          paddingVertical: Spacing.xs,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.md,
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.sm,
          borderRadius: BorderRadius.md,
        },
        rowBorder: {
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.borderLight,
        },
        iconWrap: {
          width: 40,
          height: 40,
          borderRadius: BorderRadius.md,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
        },
        textWrap: {
          flex: 1,
          gap: 2,
          minWidth: 0,
        },
      }),
    [colors],
  );

  return (
    <View>
      <SectionHeader title="Account & App" icon="layers-outline" />
      <Card style={styles.card}>
        {items.map((item, index) => {
          const tint = item.destructive ? colors.error : colors.primary;
          const bg = item.destructive ? colors.errorSoft : colors.primarySoft;
          const border = item.destructive ? colors.errorSoft : colors.accentPeach;

          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              onPress={item.onPress}
              style={({ pressed }) => [
                styles.row,
                index > 0 && styles.rowBorder,
                pressed && { backgroundColor: colors.surfaceMuted },
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: bg, borderColor: border }]}>
                <Ionicons name={item.icon} size={18} color={tint} />
              </View>
              <View style={styles.textWrap}>
                <AppText variant="label" style={item.destructive ? { color: colors.error } : undefined}>
                  {item.label}
                </AppText>
                <AppText variant="caption" muted numberOfLines={2}>
                  {item.subtitle}
                </AppText>
              </View>
              <Ionicons
                name={item.destructive ? 'log-out-outline' : 'chevron-forward'}
                size={18}
                color={item.destructive ? colors.error : colors.textMuted}
              />
            </Pressable>
          );
        })}
      </Card>
    </View>
  );
}
