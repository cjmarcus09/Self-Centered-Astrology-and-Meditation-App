import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import { theme } from '../theme';
import ImprovedBirthDataForm from '../components/ImprovedBirthDataForm';
import SimpleAstrologyChart from '../components/SimpleAstrologyChart';
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
      <ImprovedBirthDataForm onSubmit={handleBirthDataSubmit} />
    );
  }

  const { width: screenWidth } = Dimensions.get('window');
  const chartSize = Math.min(screenWidth * 0.9, 350);

  return (
    <View style={styles.mainContainer}>
      {natalChart ? (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>Your Natal Chart</Text>
            <Text style={styles.subtitle}>Tap planets for details and interpretations</Text>
          </View>

          <View style={styles.chartWrapper}>
            <SimpleAstrologyChart
              natalChart={natalChart}
              size={chartSize}
            />
          </View>

          <ScrollView style={styles.detailsContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.detailsContent}>
              <Text style={styles.sectionTitle}>Chart Summary</Text>

              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Ascendant</Text>
                  <Text style={styles.summaryValue}>
                    {Math.floor(natalChart.ascendant)}° {natalChart.houses[0]?.sign}
                  </Text>
                </View>

                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Midheaven</Text>
                  <Text style={styles.summaryValue}>
                    {Math.floor(natalChart.midheaven)}° {natalChart.houses[9]?.sign}
                  </Text>
                </View>

                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Planets</Text>
                  <Text style={styles.summaryValue}>{natalChart.planets.length}</Text>
                </View>

                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Aspects</Text>
                  <Text style={styles.summaryValue}>{natalChart.aspects.length}</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Quick Planetary Overview</Text>
              {natalChart.planets.slice(0, 6).map((planet, index) => (
                <View key={index} style={styles.planetRow}>
                  <Text style={styles.planetName}>{planet.name}</Text>
                  <Text style={styles.planetPosition}>
                    {planet.degree}° {planet.sign}
                    {planet.house && ` • House ${planet.house}`}
                  </Text>
                </View>
              ))}

              <Text style={styles.sectionTitle}>Major Aspects</Text>
              {natalChart.aspects.slice(0, 8).map((aspect, index) => (
                <View key={index} style={styles.aspectRow}>
                  <Text style={styles.aspectText}>
                    {aspect.planet1} {aspect.type} {aspect.planet2}
                  </Text>
                  <Text style={styles.aspectOrb}>
                    {aspect.orb.toFixed(1)}°
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.subtitle}>Chart calculation in progress...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[2],
    alignItems: 'center',
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing[4],
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
    borderTopLeftRadius: theme.borderRadius['2xl'],
    borderTopRightRadius: theme.borderRadius['2xl'],
    marginTop: theme.spacing[4],
  },
  detailsContent: {
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
    ...theme.typography.styles.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing[4],
  },
  sectionTitle: {
    ...theme.typography.styles.h4,
    color: theme.colors.primary[400],
    marginTop: theme.spacing[6],
    marginBottom: theme.spacing[4],
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[6],
  },
  summaryItem: {
    width: '48%',
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
    marginBottom: theme.spacing[3],
    alignItems: 'center',
  },
  summaryLabel: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing[1],
  },
  summaryValue: {
    ...theme.typography.styles.body,
    color: theme.colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  planetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing[2],
  },
  planetName: {
    ...theme.typography.styles.body,
    color: theme.colors.text.primary,
    fontWeight: '600',
    flex: 1,
  },
  planetPosition: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.secondary,
    textAlign: 'right',
    flex: 1,
  },
  aspectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing[2],
  },
  aspectText: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.primary,
    flex: 1,
  },
  aspectOrb: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.tertiary,
    fontWeight: '500',
  },
});