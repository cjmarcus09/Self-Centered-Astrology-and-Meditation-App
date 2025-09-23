import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, shadows } from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,

  // Animation durations
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 800,
    aura: 2000, // For chakra aura animations
  },

  // Chakra meditation levels
  meditationLevels: {
    beginner: {
      title: 'Beginner',
      hoursRequired: 0,
      auraSize: 1,
      color: colors.chakras.root,
    },
    truthSeeker: {
      title: 'Truth Seeker',
      hoursRequired: 50,
      auraSize: 1.5,
      color: colors.chakras.heart,
    },
    truthFinder: {
      title: 'Truth Finder',
      hoursRequired: 100,
      auraSize: 2,
      color: colors.chakras.thirdEye,
    },
    truthKnower: {
      title: 'Truth Knower',
      hoursRequired: 150,
      auraSize: 2.5,
      color: colors.chakras.crown,
    },
  },

  // Screen dimensions (will be updated with actual device dimensions)
  screen: {
    width: 375, // Default iPhone width
    height: 812, // Default iPhone height
  },
};

export type Theme = typeof theme;
export { colors, typography, spacing, borderRadius, shadows };