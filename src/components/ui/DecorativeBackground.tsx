import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export function DecorativeBackground() {
  const { colors } = useTheme();

  return (
    <View style={styles.container} pointerEvents="none">
      <View
        style={[
          styles.orb,
          styles.orbPrimary,
          { backgroundColor: colors.decorativeOrbPrimary },
        ]}
      />
      <View
        style={[
          styles.orb,
          styles.orbSecondary,
          { backgroundColor: colors.decorativeOrbSecondary },
        ]}
      />
      <View
        style={[
          styles.orb,
          styles.orbAccent,
          { backgroundColor: colors.decorativeOrbAccent },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.55,
  },
  orbPrimary: {
    width: 280,
    height: 280,
    top: -80,
    right: -60,
  },
  orbSecondary: {
    width: 200,
    height: 200,
    top: 120,
    left: -80,
  },
  orbAccent: {
    width: 140,
    height: 140,
    bottom: 80,
    right: -30,
  },
});
