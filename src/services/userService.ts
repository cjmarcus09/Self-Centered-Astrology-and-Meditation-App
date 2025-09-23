import AsyncStorage from '@react-native-async-storage/async-storage';
import { BirthData, NatalChart } from './simpleAstrologyService';

export interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  birthData?: BirthData;
  natalChart?: NatalChart;
  meditationHours: Record<string, number>; // chakra -> hours
  createdAt: Date;
  updatedAt: Date;
}

export interface MeditationSession {
  id: string;
  chakra: string;
  duration: number; // in minutes
  date: Date;
  type: 'individual' | 'group';
  roomId?: string;
}

const STORAGE_KEYS = {
  USER_PROFILE: '@user_profile',
  MEDITATION_SESSIONS: '@meditation_sessions',
  NATAL_CHART: '@natal_chart',
};

export class UserService {
  private static instance: UserService;

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async createUserProfile(birthData: BirthData): Promise<UserProfile> {
    const userId = this.generateUserId();
    const now = new Date();

    const profile: UserProfile = {
      id: userId,
      birthData,
      meditationHours: {
        root: 0,
        sacral: 0,
        solarPlexus: 0,
        heart: 0,
        throat: 0,
        thirdEye: 0,
        crown: 0,
      },
      createdAt: now,
      updatedAt: now,
    };

    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    return profile;
  }

  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const profileJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (!profileJson) return null;

      const profile = JSON.parse(profileJson);

      // Convert date strings back to Date objects
      profile.createdAt = new Date(profile.createdAt);
      profile.updatedAt = new Date(profile.updatedAt);
      if (profile.birthData?.date) {
        profile.birthData.date = new Date(profile.birthData.date);
      }

      return profile;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const profile = await this.getUserProfile();
    if (!profile) return null;

    const updatedProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date(),
    };

    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedProfile));
    return updatedProfile;
  }

  async saveNatalChart(chart: NatalChart): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.NATAL_CHART, JSON.stringify(chart));

    // Also update the user profile with the chart
    await this.updateUserProfile({ natalChart: chart });
  }

  async getNatalChart(): Promise<NatalChart | null> {
    try {
      const chartJson = await AsyncStorage.getItem(STORAGE_KEYS.NATAL_CHART);
      return chartJson ? JSON.parse(chartJson) : null;
    } catch (error) {
      console.error('Error loading natal chart:', error);
      return null;
    }
  }

  async logMeditationSession(session: Omit<MeditationSession, 'id'>): Promise<MeditationSession> {
    const sessionWithId: MeditationSession = {
      ...session,
      id: this.generateSessionId(),
    };

    // Save the session
    const sessions = await this.getMeditationSessions();
    sessions.push(sessionWithId);
    await AsyncStorage.setItem(STORAGE_KEYS.MEDITATION_SESSIONS, JSON.stringify(sessions));

    // Update meditation hours
    const profile = await this.getUserProfile();
    if (profile) {
      const hoursToAdd = session.duration / 60; // convert minutes to hours
      const updatedHours = {
        ...profile.meditationHours,
        [session.chakra]: (profile.meditationHours[session.chakra] || 0) + hoursToAdd,
      };

      await this.updateUserProfile({ meditationHours: updatedHours });
    }

    return sessionWithId;
  }

  async getMeditationSessions(): Promise<MeditationSession[]> {
    try {
      const sessionsJson = await AsyncStorage.getItem(STORAGE_KEYS.MEDITATION_SESSIONS);
      if (!sessionsJson) return [];

      const sessions = JSON.parse(sessionsJson);
      return sessions.map((session: any) => ({
        ...session,
        date: new Date(session.date),
      }));
    } catch (error) {
      console.error('Error loading meditation sessions:', error);
      return [];
    }
  }

  async getTotalMeditationHours(): Promise<number> {
    const profile = await this.getUserProfile();
    if (!profile) return 0;

    return Object.values(profile.meditationHours).reduce((total, hours) => total + hours, 0);
  }

  async getChakraMeditationHours(chakra: string): Promise<number> {
    const profile = await this.getUserProfile();
    return profile?.meditationHours[chakra] || 0;
  }

  getMeditationLevel(hours: number): {
    level: string;
    title: string;
    progress: number;
    nextLevelHours: number;
  } {
    if (hours < 50) {
      return {
        level: 'beginner',
        title: 'Beginner',
        progress: hours / 50,
        nextLevelHours: 50,
      };
    } else if (hours < 100) {
      return {
        level: 'truthSeeker',
        title: 'Truth Seeker',
        progress: (hours - 50) / 50,
        nextLevelHours: 100,
      };
    } else if (hours < 150) {
      return {
        level: 'truthFinder',
        title: 'Truth Finder',
        progress: (hours - 100) / 50,
        nextLevelHours: 150,
      };
    } else {
      return {
        level: 'truthKnower',
        title: 'Truth Knower',
        progress: 1,
        nextLevelHours: 150,
      };
    }
  }

  private generateUserId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async clearAllData(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_PROFILE,
      STORAGE_KEYS.MEDITATION_SESSIONS,
      STORAGE_KEYS.NATAL_CHART,
    ]);
  }
}