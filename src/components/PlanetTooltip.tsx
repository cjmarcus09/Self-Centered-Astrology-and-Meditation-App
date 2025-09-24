import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { Planet } from '../services/simpleAstrologyService';
import { PLANET_SYMBOLS, ZODIAC_SYMBOLS } from '../constants/astrologicalSymbols';
import { ChartUtils } from '../utils/chartUtils';

interface Props {
  planet: Planet;
  visible: boolean;
  position: { x: number; y: number };
}

export default function PlanetTooltip({ planet, visible, position }: Props) {
  if (!visible) return null;

  const planetSymbol = PLANET_SYMBOLS[planet.name as keyof typeof PLANET_SYMBOLS];
  const signSymbol = ZODIAC_SYMBOLS[planet.sign as keyof typeof ZODIAC_SYMBOLS];
  const formattedDegree = ChartUtils.formatDegree(planet.degree, planet.minute);

  const getPlanetDescription = (planetName: string): string => {
    const descriptions: { [key: string]: string } = {
      Sun: 'Core self, identity, vitality',
      Moon: 'Emotions, instincts, subconscious',
      Mercury: 'Communication, mind, learning',
      Venus: 'Love, beauty, values, relationships',
      Mars: 'Action, energy, passion, drive',
      Jupiter: 'Growth, wisdom, expansion, luck',
      Saturn: 'Discipline, structure, lessons',
      Uranus: 'Innovation, rebellion, sudden change',
      Neptune: 'Dreams, intuition, spirituality',
      Pluto: 'Transformation, power, regeneration',
      'North Node': 'Life purpose, karmic path',
      Chiron: 'Healing, wisdom through wounds',
    };
    return descriptions[planetName] || 'Celestial influence';
  };

  const getSignDescription = (signName: string): string => {
    const descriptions: { [key: string]: string } = {
      Aries: 'Initiative, courage, leadership',
      Taurus: 'Stability, sensuality, persistence',
      Gemini: 'Curiosity, adaptability, communication',
      Cancer: 'Nurturing, emotional, protective',
      Leo: 'Creative, confident, dramatic',
      Virgo: 'Analytical, helpful, perfectionist',
      Libra: 'Harmonious, diplomatic, artistic',
      Scorpio: 'Intense, transformative, mysterious',
      Sagittarius: 'Adventurous, philosophical, optimistic',
      Capricorn: 'Ambitious, practical, disciplined',
      Aquarius: 'Innovative, humanitarian, independent',
      Pisces: 'Intuitive, compassionate, dreamy',
    };
    return descriptions[signName] || 'Zodiacal influence';
  };

  return (
    <View style={[styles.container, { left: position.x - 100, top: position.y - 120 }]}>
      <View style={styles.tooltip}>
        <View style={styles.header}>
          <Text style={styles.planetSymbol}>{planetSymbol}</Text>
          <Text style={styles.planetName}>{planet.name}</Text>
        </View>

        <View style={styles.position}>
          <Text style={styles.signSymbol}>{signSymbol}</Text>
          <Text style={styles.positionText}>{formattedDegree} {planet.sign}</Text>
        </View>

        {planet.house && (
          <Text style={styles.houseText}>House {planet.house}</Text>
        )}

        <Text style={styles.description}>
          {getPlanetDescription(planet.name)}
        </Text>

        <Text style={styles.signDescription}>
          In {planet.sign}: {getSignDescription(planet.sign)}
        </Text>

        {planet.longitudeSpeed !== 0 && (
          <Text style={styles.motion}>
            {planet.longitudeSpeed > 0 ? 'Direct motion' : 'Retrograde'}
          </Text>
        )}
      </View>
      <View style={styles.arrow} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
    minWidth: 200,
    maxWidth: 250,
  },
  tooltip: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.primary[400],
    ...theme.shadows.lg,
  },
  arrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 0,
    borderLeftWidth: 10,
    borderTopColor: theme.colors.background.secondary,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    alignSelf: 'center',
    marginTop: -1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  planetSymbol: {
    fontSize: 24,
    color: theme.colors.primary[400],
    marginRight: theme.spacing[2],
    fontWeight: 'bold',
  },
  planetName: {
    ...theme.typography.styles.h5,
    color: theme.colors.text.primary,
    flex: 1,
  },
  position: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  signSymbol: {
    fontSize: 20,
    color: theme.colors.primary[300],
    marginRight: theme.spacing[2],
  },
  positionText: {
    ...theme.typography.styles.body,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  houseText: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.primary[300],
    marginBottom: theme.spacing[2],
  },
  description: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[2],
    fontStyle: 'italic',
  },
  signDescription: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing[1],
  },
  motion: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});