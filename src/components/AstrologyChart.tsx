import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, {
  Circle,
  Path,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
  G,
  Line,
} from 'react-native-svg';
import { theme } from '../theme';
import { ChartUtils } from '../utils/chartUtils';
import {
  ZODIAC_SYMBOLS,
  PLANET_SYMBOLS,
  ZODIAC_COLORS,
  PLANET_COLORS,
  ASPECT_COLORS
} from '../constants/astrologicalSymbols';
import { NatalChart } from '../services/simpleAstrologyService';

interface Props {
  natalChart: NatalChart;
  size?: number;
  showAspects?: boolean;
  showHouses?: boolean;
}

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export default function AstrologyChart({
  natalChart,
  size = 320,
  showAspects = true,
  showHouses = true
}: Props) {
  const center = size / 2;
  const outerRadius = size * 0.45;
  const innerRadius = size * 0.35;
  const houseRadius = size * 0.25;
  const planetRadius = size * 0.40;

  // Create zodiac wheel sectors
  const renderZodiacWheel = () => {
    return ZODIAC_SIGNS.map((sign, index) => {
      const startAngle = index * 30;
      const endAngle = (index + 1) * 30;
      const midAngle = startAngle + 15;

      // Convert to chart coordinates (start from 9 o'clock, go clockwise)
      const chartStartAngle = ChartUtils.longitudeToChartAngle(startAngle);
      const chartEndAngle = ChartUtils.longitudeToChartAngle(endAngle);
      const chartMidAngle = ChartUtils.longitudeToChartAngle(midAngle);

      const sectorPath = ChartUtils.generateZodiacSectorPath(
        chartStartAngle,
        chartEndAngle,
        innerRadius,
        outerRadius,
        center,
        center
      );

      const symbolPosition = ChartUtils.getPositionOnCircle(
        chartMidAngle,
        (innerRadius + outerRadius) / 2,
        center,
        center
      );

      return (
        <G key={sign}>
          <Path
            d={sectorPath}
            fill={`url(#gradient-${sign.toLowerCase()})`}
            stroke={theme.colors.background.tertiary}
            strokeWidth="1"
            opacity="0.8"
          />
          <SvgText
            x={symbolPosition.x}
            y={symbolPosition.y}
            fontSize="18"
            fontWeight="bold"
            textAnchor="middle"
            alignmentBaseline="central"
            fill={theme.colors.text.primary}
          >
            {ZODIAC_SYMBOLS[sign as keyof typeof ZODIAC_SYMBOLS]}
          </SvgText>
        </G>
      );
    });
  };

  // Create house divisions
  const renderHouses = () => {
    if (!showHouses || !natalChart.houses.length) return null;

    return natalChart.houses.map((house, index) => {
      const angle = ChartUtils.longitudeToChartAngle(house.cusp);

      const linePath = ChartUtils.generateHouseLine(
        angle,
        houseRadius,
        innerRadius,
        center,
        center
      );

      // House number position
      const houseNumberAngle = index < 11 ?
        ChartUtils.longitudeToChartAngle((house.cusp + natalChart.houses[(index + 1) % 12].cusp) / 2) :
        ChartUtils.longitudeToChartAngle((house.cusp + (natalChart.houses[0].cusp + 360)) / 2);

      const numberPosition = ChartUtils.getPositionOnCircle(
        houseNumberAngle,
        (houseRadius + innerRadius) / 2,
        center,
        center
      );

      return (
        <G key={`house-${house.number}`}>
          <Path
            d={linePath}
            stroke={theme.colors.primary[300]}
            strokeWidth="1"
            opacity="0.6"
          />
          <SvgText
            x={numberPosition.x}
            y={numberPosition.y}
            fontSize="14"
            fontWeight="500"
            textAnchor="middle"
            alignmentBaseline="central"
            fill={theme.colors.primary[300]}
          >
            {house.number}
          </SvgText>
        </G>
      );
    });
  };

  // Render planets
  const renderPlanets = () => {
    // Group planets by house to handle overlapping
    const planetsByHouse: { [key: number]: Array<{ name: string; longitude: number; house?: number }> } = {};

    natalChart.planets.forEach(planet => {
      const house = planet.house || 1;
      if (!planetsByHouse[house]) {
        planetsByHouse[house] = [];
      }
      planetsByHouse[house].push({
        name: planet.name,
        longitude: planet.longitude,
        house: planet.house,
      });
    });

    const allPlanetElements: React.JSX.Element[] = [];

    // Render planets with overlap handling
    Object.entries(planetsByHouse).forEach(([houseNum, planetsInHouse]) => {
      planetsInHouse.forEach((planet, index) => {
        // Simple offset for overlapping planets in same house
        const offsetAngle = index * 8; // 8 degree offset per planet
        const baseAngle = ChartUtils.longitudeToChartAngle(planet.longitude);
        const adjustedAngle = (baseAngle + offsetAngle) % 360;

        const position = ChartUtils.getPositionOnCircle(
          adjustedAngle,
          planetRadius,
          center,
          center
        );

        const planetColor = PLANET_COLORS[planet.name as keyof typeof PLANET_COLORS] || theme.colors.text.primary;
        const planetSymbol = PLANET_SYMBOLS[planet.name as keyof typeof PLANET_SYMBOLS] || '?';

        allPlanetElements.push(
          <G key={`planet-${planet.name}`}>
            <Circle
              cx={position.x}
              cy={position.y}
              r="12"
              fill={theme.colors.background.primary}
              stroke={planetColor}
              strokeWidth="2"
            />
            <SvgText
              x={position.x}
              y={position.y}
              fontSize="14"
              fontWeight="bold"
              textAnchor="middle"
              alignmentBaseline="central"
              fill={planetColor}
            >
              {planetSymbol}
            </SvgText>
          </G>
        );
      });
    });

    return allPlanetElements;
  };

  // Render aspect lines
  const renderAspects = () => {
    if (!showAspects || !natalChart.aspects.length) return null;

    return natalChart.aspects.map((aspect, index) => {
      const planet1 = natalChart.planets.find(p => p.name === aspect.planet1);
      const planet2 = natalChart.planets.find(p => p.name === aspect.planet2);

      if (!planet1 || !planet2) return null;

      const angle1 = ChartUtils.longitudeToChartAngle(planet1.longitude);
      const angle2 = ChartUtils.longitudeToChartAngle(planet2.longitude);

      const aspectPath = ChartUtils.generateAspectLine(
        angle1,
        angle2,
        planetRadius - 15,
        center,
        center
      );

      const aspectColor = ASPECT_COLORS[aspect.type as keyof typeof ASPECT_COLORS] || theme.colors.text.tertiary;

      return (
        <Path
          key={`aspect-${index}`}
          d={aspectPath}
          stroke={aspectColor}
          strokeWidth={aspect.orb < 3 ? "2" : "1"}
          opacity={aspect.orb < 3 ? 0.8 : 0.4}
          strokeDasharray={aspect.type === 'sextile' ? '5,5' : undefined}
        />
      );
    });
  };

  // Create gradients for zodiac signs
  const renderGradients = () => {
    return ZODIAC_SIGNS.map(sign => {
      const color = ZODIAC_COLORS[sign as keyof typeof ZODIAC_COLORS];
      return (
        <LinearGradient
          key={`gradient-${sign.toLowerCase()}`}
          id={`gradient-${sign.toLowerCase()}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <Stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <Stop offset="100%" stopColor={color} stopOpacity="0.1" />
        </LinearGradient>
      );
    });
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          {renderGradients()}
        </Defs>

        {/* Outer circle */}
        <Circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="none"
          stroke={theme.colors.primary[400]}
          strokeWidth="2"
        />

        {/* Inner circle */}
        <Circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          stroke={theme.colors.primary[400]}
          strokeWidth="2"
        />

        {/* House circle */}
        {showHouses && (
          <Circle
            cx={center}
            cy={center}
            r={houseRadius}
            fill="none"
            stroke={theme.colors.primary[300]}
            strokeWidth="1"
            opacity="0.6"
          />
        )}

        {/* Zodiac wheel */}
        {renderZodiacWheel()}

        {/* House divisions */}
        {renderHouses()}

        {/* Aspect lines (render behind planets) */}
        {renderAspects()}

        {/* Planets */}
        {renderPlanets()}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});