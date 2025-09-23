import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { theme } from '../theme';
import BirthDataForm from '../components/BirthDataForm';
import { AstrologyService, BirthData, NatalChart } from '../services/simpleAstrologyService';
import { UserService } from '../services/userService';

export default function ChartScreen() {
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [natalChart, setNatalChart] = useState<NatalChart | null>(null);
  const [loading, setLoading] = useState(true);

  const astrologyService = AstrologyService.getInstance();
  const userService = UserService.getInstance();

  useEffect(() => {
    checkUserProfile();
  }, []);

  const checkUserProfile = async () => {
    try {
      const profile = await userService.getUserProfile();
      const chart = await userService.getNatalChart();

      setHasProfile(!!profile);
      setNatalChart(chart);
    } catch (error) {
      console.error('Error checking user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBirthDataSubmit = async (birthData: BirthData) => {
    try {
      setLoading(true);

      // Create user profile
      await userService.createUserProfile(birthData);

      // Calculate natal chart
      const chart = astrologyService.calculateNatalChart(birthData);

      // Save the chart
      await userService.saveNatalChart(chart);

      setNatalChart(chart);
      setHasProfile(true);

      Alert.alert('Success', 'Your natal chart has been calculated!');
    } catch (error) {
      console.error('Error calculating chart:', error);
      Alert.alert('Error', 'Failed to calculate your natal chart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!hasProfile) {
    return (
      <ScrollView style={styles.scrollContainer}>
        <BirthDataForm onSubmit={handleBirthDataSubmit} />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Your Natal Chart</Text>

        {natalChart ? (
          <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>Planetary Positions</Text>
            {natalChart.planets.map((planet, index) => (
              <View key={index} style={styles.planetRow}>
                <Text style={styles.planetName}>{planet.name}</Text>
                <Text style={styles.planetPosition}>
                  {planet.degree}° {planet.sign} {planet.minute}'
                </Text>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Houses</Text>
            {natalChart.houses.slice(0, 4).map((house, index) => (
              <View key={index} style={styles.houseRow}>
                <Text style={styles.houseName}>House {house.number}</Text>
                <Text style={styles.housePosition}>
                  {Math.floor(house.cusp)}° {house.sign}
                </Text>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Major Aspects</Text>
            {natalChart.aspects.slice(0, 6).map((aspect, index) => (
              <View key={index} style={styles.aspectRow}>
                <Text style={styles.aspectText}>
                  {aspect.planet1} {aspect.type} {aspect.planet2}
                </Text>
                <Text style={styles.aspectOrb}>
                  {aspect.orb.toFixed(1)}° orb
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.subtitle}>Chart calculation in progress...</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  container: {
    padding: theme.spacing[6],
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...theme.typography.styles.body,
    color: theme.colors.text.secondary,
  },
  title: {
    ...theme.typography.styles.h1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[6],
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.styles.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  chartContainer: {
    marginTop: theme.spacing[4],
  },
  sectionTitle: {
    ...theme.typography.styles.h3,
    color: theme.colors.primary[400],
    marginTop: theme.spacing[6],
    marginBottom: theme.spacing[4],
  },
  planetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background.tertiary,
  },
  planetName: {
    ...theme.typography.styles.body,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  planetPosition: {
    ...theme.typography.styles.body,
    color: theme.colors.text.secondary,
  },
  houseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background.tertiary,
  },
  houseName: {
    ...theme.typography.styles.body,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  housePosition: {
    ...theme.typography.styles.body,
    color: theme.colors.text.secondary,
  },
  aspectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background.tertiary,
  },
  aspectText: {
    ...theme.typography.styles.body,
    color: theme.colors.text.primary,
    flex: 1,
  },
  aspectOrb: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.tertiary,
  },
});