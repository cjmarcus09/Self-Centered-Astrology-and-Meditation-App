import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { PanGestureHandler, PinchGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import AstrologyChart from './AstrologyChart';
import PlanetTooltip from './PlanetTooltip';
import { NatalChart, Planet } from '../services/simpleAstrologyService';
import { ChartUtils } from '../utils/chartUtils';

interface Props {
  natalChart: NatalChart;
  size?: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function InteractiveAstrologyChart({ natalChart, size = 320 }: Props) {
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Animation values
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Simplified gesture handling
  const handlePinch = (event: any) => {
    const newScale = Math.max(0.8, Math.min(3, event.nativeEvent.scale));
    scale.value = withSpring(newScale);
  };

  const handlePan = (event: any) => {
    const maxTranslate = size * 0.5 * (scale.value - 1);
    const newX = Math.max(-maxTranslate, Math.min(maxTranslate, event.nativeEvent.translationX));
    const newY = Math.max(-maxTranslate, Math.min(maxTranslate, event.nativeEvent.translationY));

    translateX.value = withSpring(newX);
    translateY.value = withSpring(newY);
  };

  // Animated style for the chart
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

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

  // Reset chart position and scale
  const resetChart = () => {
    scale.value = withSpring(1);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
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
  gestureContainer: {
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
    // For debugging: uncomment to see touch areas
    // backgroundColor: 'rgba(255, 0, 0, 0.2)',
    // borderWidth: 1,
    // borderColor: 'red',
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});