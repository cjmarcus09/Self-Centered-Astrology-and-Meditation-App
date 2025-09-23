import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../theme';
import { BirthData } from '../services/simpleAstrologyService';

interface Props {
  onSubmit: (birthData: BirthData) => void;
  initialData?: Partial<BirthData>;
}

export default function BirthDataForm({ onSubmit, initialData }: Props) {
  const [date, setDate] = useState(initialData?.date || new Date());
  const [time, setTime] = useState(initialData?.time || '12:00');
  const [latitude, setLatitude] = useState(initialData?.latitude?.toString() || '');
  const [longitude, setLongitude] = useState(initialData?.longitude?.toString() || '');
  const [timezone, setTimezone] = useState(initialData?.timezone || 'UTC');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSubmit = () => {
    if (!latitude || !longitude) {
      Alert.alert('Error', 'Please enter your birth location coordinates');
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert('Error', 'Please enter valid coordinates');
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      Alert.alert('Error', 'Please enter valid coordinates (latitude: -90 to 90, longitude: -180 to 180)');
      return;
    }

    const birthData: BirthData = {
      date,
      time,
      latitude: lat,
      longitude: lng,
      timezone,
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Birth Information</Text>
      <Text style={styles.subtitle}>Enter your birth details for accurate astrology calculations</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Birth Date</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateText}>{date.toDateString()}</Text>
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
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowTimePicker(true)}>
          <Text style={styles.dateText}>{time}</Text>
        </TouchableOpacity>
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
        <Text style={styles.label}>Birth Latitude</Text>
        <TextInput
          style={styles.input}
          value={latitude}
          onChangeText={setLatitude}
          placeholder="e.g. 40.7128 (New York)"
          placeholderTextColor={theme.colors.text.tertiary}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Birth Longitude</Text>
        <TextInput
          style={styles.input}
          value={longitude}
          onChangeText={setLongitude}
          placeholder="e.g. -74.0060 (New York)"
          placeholderTextColor={theme.colors.text.tertiary}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Timezone</Text>
        <TextInput
          style={styles.input}
          value={timezone}
          onChangeText={setTimezone}
          placeholder="e.g. America/New_York"
          placeholderTextColor={theme.colors.text.tertiary}
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Calculate My Chart</Text>
      </TouchableOpacity>

      <Text style={styles.helpText}>
        Need help finding your coordinates? You can use Google Maps to find your birth location and get the exact coordinates.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing[6],
  },
  title: {
    ...theme.typography.styles.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.styles.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing[8],
  },
  formGroup: {
    marginBottom: theme.spacing[6],
  },
  label: {
    ...theme.typography.styles.label,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  input: {
    ...theme.typography.styles.body,
    backgroundColor: theme.colors.background.surface,
    borderColor: theme.colors.background.tertiary,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
    color: theme.colors.text.primary,
  },
  dateButton: {
    backgroundColor: theme.colors.background.surface,
    borderColor: theme.colors.background.tertiary,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
  },
  dateText: {
    ...theme.typography.styles.body,
    color: theme.colors.text.primary,
  },
  submitButton: {
    backgroundColor: theme.colors.primary[500],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[6],
    ...theme.shadows.md,
  },
  submitButtonText: {
    ...theme.typography.styles.button,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  helpText: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});