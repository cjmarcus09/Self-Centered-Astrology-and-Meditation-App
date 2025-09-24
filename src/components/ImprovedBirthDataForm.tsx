import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../theme';
import { BirthData } from '../services/simpleAstrologyService';

interface Props {
  onSubmit: (birthData: BirthData) => void;
  initialData?: Partial<BirthData>;
}

// Popular cities with coordinates
const POPULAR_CITIES = [
  { name: 'New York, NY, USA', lat: 40.7128, lng: -74.0060, timezone: 'America/New_York' },
  { name: 'Los Angeles, CA, USA', lat: 34.0522, lng: -118.2437, timezone: 'America/Los_Angeles' },
  { name: 'Chicago, IL, USA', lat: 41.8781, lng: -87.6298, timezone: 'America/Chicago' },
  { name: 'London, UK', lat: 51.5074, lng: -0.1278, timezone: 'Europe/London' },
  { name: 'Paris, France', lat: 48.8566, lng: 2.3522, timezone: 'Europe/Paris' },
  { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503, timezone: 'Asia/Tokyo' },
  { name: 'Sydney, Australia', lat: -33.8688, lng: 151.2093, timezone: 'Australia/Sydney' },
  { name: 'Toronto, Canada', lat: 43.6532, lng: -79.3832, timezone: 'America/Toronto' },
  { name: 'Berlin, Germany', lat: 52.5200, lng: 13.4050, timezone: 'Europe/Berlin' },
  { name: 'Mumbai, India', lat: 19.0760, lng: 72.8777, timezone: 'Asia/Kolkata' },
];

export default function ImprovedBirthDataForm({ onSubmit, initialData }: Props) {
  const [date, setDate] = useState(initialData?.date || new Date());
  const [time, setTime] = useState(initialData?.time || '12:00');
  const [locationSearch, setLocationSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    lat: number;
    lng: number;
    timezone: string;
  } | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const filteredCities = POPULAR_CITIES.filter(city =>
    city.name.toLowerCase().includes(locationSearch.toLowerCase())
  );

  const handleSubmit = () => {
    if (!selectedLocation) {
      Alert.alert('Birth Location Required', 'Please select your birth location from the list or search for your city.');
      return;
    }

    const birthData: BirthData = {
      date,
      time,
      latitude: selectedLocation.lat,
      longitude: selectedLocation.lng,
      timezone: selectedLocation.timezone,
    };

    onSubmit(birthData);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    }
  };

  const selectLocation = (location: typeof POPULAR_CITIES[0]) => {
    setSelectedLocation(location);
    setLocationSearch(location.name);
    setShowLocationPicker(false);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Your Natal Chart</Text>
          <Text style={styles.subtitle}>
            Enter your birth details to generate your personalized astrology chart
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Birth Date</Text>
          <TouchableOpacity style={styles.inputButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.inputButtonText}>{date.toDateString()}</Text>
            <Text style={styles.inputIcon}>📅</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Birth Time</Text>
          <TouchableOpacity style={styles.inputButton} onPress={() => setShowTimePicker(true)}>
            <Text style={styles.inputButtonText}>{time}</Text>
            <Text style={styles.inputIcon}>🕐</Text>
          </TouchableOpacity>
          <Text style={styles.helpText}>
            If you don't know your exact birth time, 12:00 PM is used as default
          </Text>
          {showTimePicker && (
            <DateTimePicker
              value={new Date(`2000-01-01T${time}:00`)}
              mode="time"
              display="default"
              onChange={onTimeChange}
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Birth Location</Text>
          <TouchableOpacity
            style={styles.inputButton}
            onPress={() => setShowLocationPicker(!showLocationPicker)}
          >
            <Text style={[styles.inputButtonText, !selectedLocation && styles.placeholder]}>
              {selectedLocation ? selectedLocation.name : 'Search for your birth city...'}
            </Text>
            <Text style={styles.inputIcon}>🌍</Text>
          </TouchableOpacity>

          {showLocationPicker && (
            <View style={styles.locationPicker}>
              <TextInput
                style={styles.searchInput}
                value={locationSearch}
                onChangeText={setLocationSearch}
                placeholder="Type city name..."
                placeholderTextColor={theme.colors.text.tertiary}
              />

              <ScrollView style={styles.cityList} nestedScrollEnabled>
                {filteredCities.map((city, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.cityItem}
                    onPress={() => selectLocation(city)}
                  >
                    <Text style={styles.cityName}>{city.name}</Text>
                  </TouchableOpacity>
                ))}

                {filteredCities.length === 0 && locationSearch.length > 0 && (
                  <View style={styles.noCitiesFound}>
                    <Text style={styles.noCitiesText}>
                      City not found. Try searching for a major city near your birth location.
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>✨ Generate My Chart</Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Why We Need This Information:</Text>
          <Text style={styles.infoText}>
            • <Text style={styles.infoBold}>Birth Date & Time:</Text> Determines planetary positions{'\n'}
            • <Text style={styles.infoBold}>Birth Location:</Text> Calculates your ascendant and houses{'\n'}
            • Your data is stored securely on your device only
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    padding: theme.spacing[6],
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing[8],
  },
  title: {
    ...theme.typography.styles.h1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.styles.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  formGroup: {
    marginBottom: theme.spacing[6],
  },
  label: {
    ...theme.typography.styles.h5,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
    fontWeight: '600',
  },
  inputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background.surface,
    borderColor: theme.colors.primary[400],
    borderWidth: 2,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[4],
    minHeight: 56,
  },
  inputButtonText: {
    ...theme.typography.styles.body,
    color: theme.colors.text.primary,
    flex: 1,
    fontWeight: '500',
  },
  placeholder: {
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
  },
  inputIcon: {
    fontSize: 20,
    marginLeft: theme.spacing[2],
  },
  helpText: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing[2],
    fontStyle: 'italic',
  },
  locationPicker: {
    marginTop: theme.spacing[3],
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
    maxHeight: 300,
  },
  searchInput: {
    ...theme.typography.styles.body,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[3],
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
  },
  cityList: {
    maxHeight: 200,
  },
  cityItem: {
    padding: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background.tertiary,
  },
  cityName: {
    ...theme.typography.styles.body,
    color: theme.colors.text.primary,
  },
  noCitiesFound: {
    padding: theme.spacing[4],
    alignItems: 'center',
  },
  noCitiesText: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: theme.colors.primary[500],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[5],
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[6],
    ...theme.shadows.lg,
  },
  submitButtonText: {
    ...theme.typography.styles.h5,
    color: theme.colors.text.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary[400],
  },
  infoTitle: {
    ...theme.typography.styles.label,
    color: theme.colors.primary[400],
    marginBottom: theme.spacing[2],
    fontWeight: '600',
  },
  infoText: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  infoBold: {
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
});