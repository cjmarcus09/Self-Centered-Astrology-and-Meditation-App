import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

import ChartScreen from '../screens/ChartScreen';
import ChakraScreen from '../screens/ChakraScreen';
import MindMoviesScreen from '../screens/MindMoviesScreen';
import GroupMeditationScreen from '../screens/GroupMeditationScreen';
import JournalScreen from '../screens/JournalScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap;

          switch (route.name) {
            case 'Chart':
              iconName = 'stars';
              break;
            case 'Chakra':
              iconName = 'self-improvement';
              break;
            case 'MindMovies':
              iconName = 'movie-creation';
              break;
            case 'GroupMeditation':
              iconName = 'group';
              break;
            case 'Journal':
              iconName = 'book';
              break;
            default:
              iconName = 'help';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary[400],
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.background.secondary,
          borderTopColor: theme.colors.background.tertiary,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 90,
        },
        tabBarLabelStyle: {
          ...theme.typography.styles.caption,
          fontSize: 10,
        },
        headerStyle: {
          backgroundColor: theme.colors.background.secondary,
          borderBottomColor: theme.colors.background.tertiary,
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          ...theme.typography.styles.h4,
          color: theme.colors.text.primary,
        },
        headerTintColor: theme.colors.text.primary,
      })}
    >
      <Tab.Screen
        name="Chart"
        component={ChartScreen}
        options={{ title: 'Astrology Chart' }}
      />
      <Tab.Screen
        name="Chakra"
        component={ChakraScreen}
        options={{ title: 'Chakra Meditation' }}
      />
      <Tab.Screen
        name="MindMovies"
        component={MindMoviesScreen}
        options={{ title: 'Mind Movies' }}
      />
      <Tab.Screen
        name="GroupMeditation"
        component={GroupMeditationScreen}
        options={{ title: 'Group Meditation' }}
      />
      <Tab.Screen
        name="Journal"
        component={JournalScreen}
        options={{ title: 'Journal' }}
      />
    </Tab.Navigator>
  );
}