import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import AstrologyChart from './AstrologyChart';
import PlanetTooltip from './PlanetTooltip';
import { NatalChart, Planet } from '../services/simpleAstrologyService';
import { ChartUtils } from '../utils/chartUtils';

interface Props {
  natalChart: NatalChart;
  size?: number;
}

export default function SimpleAstrologyChart({ natalChart, size = 320 }: Props) {
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Handle planet tap
  const handlePlanetPress = (planet: Planet, event: any) => {
    const { locationX, locationY } = event.nativeEvent;

    setSelectedPlanet(planet);
    setTooltipPosition({
      x: locationX,
      y: locationY - 100 // Offset tooltip above the touch point
    });
    setTooltipVisible(true);
  };

  // Hide tooltip
  const hideTooltip = () => {
    setTooltipVisible(false);
    setSelectedPlanet(null);
  };

  // Calculate planet touch areas
  const renderPlanetTouchAreas = () => {
    const center = size / 2;
    const planetRadius = size * 0.40;

    return natalChart.planets.map((planet, index) => {
      const angle = ChartUtils.longitudeToChartAngle(planet.longitude);
      const position = ChartUtils.getPositionOnCircle(
        angle,
        planetRadius,
        center,
        center
      );

      return (
        <TouchableOpacity
          key={`touch-${planet.name}`}
          style={[
            styles.planetTouchArea,
            {
              left: position.x - 20,
              top: position.y - 20,
            }
          ]}
          onPress={(event) => handlePlanetPress(planet, event)}
          activeOpacity={0.7}
        />
      );
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <AstrologyChart
          natalChart={natalChart}
          size={size}
          showAspects={true}
          showHouses={true}
        />

        {/* Invisible touch areas for planets */}
        <View style={[StyleSheet.absoluteFill, { width: size, height: size }]}>
          {renderPlanetTouchAreas()}
        </View>
      </View>

      {/* Planet tooltip */}
      {selectedPlanet && (
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={hideTooltip}
        >
          <PlanetTooltip
            planet={selectedPlanet}
            visible={tooltipVisible}
            position={tooltipPosition}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  planetTouchArea: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
});