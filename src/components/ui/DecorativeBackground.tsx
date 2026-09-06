import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export function DecorativeBackground() {
  const { colors, isDark } = useTheme();

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
          styles.gridLine,
          styles.gridH1,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(11,18,32,0.04)' },
        ]}
      />
      <View
        style={[
          styles.gridLine,
          styles.gridH2,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(11,18,32,0.04)' },
        ]}
      />
      <View
        style={[
          styles.gridLine,
          styles.gridV1,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(11,18,32,0.04)' },
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
    opacity: 0.35,
  },
  orbPrimary: {
    width: 320,
    height: 320,
    top: -120,
    right: -100,
  },
  orbSecondary: {
    width: 220,
    height: 220,
    bottom: 60,
    left: -90,
    opacity: 0.25,
  },
  gridLine: {
    position: 'absolute',
  },
  gridH1: {
    top: '28%',
    left: 0,
    right: 0,
    height: 1,
  },
  gridH2: {
    top: '62%',
    left: 0,
    right: 0,
    height: 1,
  },
  gridV1: {
    top: 0,
    bottom: 0,
    left: '72%',
    width: 1,
  },
});
