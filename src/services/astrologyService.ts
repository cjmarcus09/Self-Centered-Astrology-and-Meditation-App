import swisseph from 'swisseph';
import { format } from 'date-fns';

export interface BirthData {
  date: Date;
  time: string; // HH:MM format
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface Planet {
  name: string;
  longitude: number;
  latitude: number;
  distance: number;
  longitudeSpeed: number;
  latitudeSpeed: number;
  distanceSpeed: number;
  sign: string;
  degree: number;
  minute: number;
  house?: number;
}

export interface House {
  number: number;
  cusp: number;
  sign: string;
}

export interface NatalChart {
  planets: Planet[];
  houses: House[];
  ascendant: number;
  midheaven: number;
  aspects: Aspect[];
}

export interface Aspect {
  planet1: string;
  planet2: string;
  angle: number;
  type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile' | 'quincunx';
  orb: number;
  isApplying: boolean;
}

const PLANETS = [
  { id: swisseph.SE_SUN, name: 'Sun' },
  { id: swisseph.SE_MOON, name: 'Moon' },
  { id: swisseph.SE_MERCURY, name: 'Mercury' },
  { id: swisseph.SE_VENUS, name: 'Venus' },
  { id: swisseph.SE_MARS, name: 'Mars' },
  { id: swisseph.SE_JUPITER, name: 'Jupiter' },
  { id: swisseph.SE_SATURN, name: 'Saturn' },
  { id: swisseph.SE_URANUS, name: 'Uranus' },
  { id: swisseph.SE_NEPTUNE, name: 'Neptune' },
  { id: swisseph.SE_PLUTO, name: 'Pluto' },
  { id: swisseph.SE_MEAN_NODE, name: 'North Node' },
  { id: swisseph.SE_CHIRON, name: 'Chiron' },
];

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const ASPECT_TYPES = [
  { name: 'conjunction', angle: 0, orb: 8 },
  { name: 'opposition', angle: 180, orb: 8 },
  { name: 'trine', angle: 120, orb: 6 },
  { name: 'square', angle: 90, orb: 6 },
  { name: 'sextile', angle: 60, orb: 4 },
  { name: 'quincunx', angle: 150, orb: 3 },
];

export class AstrologyService {
  private static instance: AstrologyService;

  private constructor() {
    // Initialize Swiss Ephemeris
    swisseph.swe_set_ephe_path('');
  }

  public static getInstance(): AstrologyService {
    if (!AstrologyService.instance) {
      AstrologyService.instance = new AstrologyService();
    }
    return AstrologyService.instance;
  }

  private getJulianDay(birthData: BirthData): number {
    const date = birthData.date;
    const [hour, minute] = birthData.time.split(':').map(Number);

    const julianDay = swisseph.swe_julday(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
      hour + minute / 60,
      swisseph.SE_GREG_CAL
    );

    return julianDay;
  }

  private getSign(longitude: number): string {
    const signIndex = Math.floor(longitude / 30);
    return SIGNS[signIndex];
  }

  private getDegreeInSign(longitude: number): { degree: number; minute: number } {
    const degreeInSign = longitude % 30;
    const degree = Math.floor(degreeInSign);
    const minute = Math.floor((degreeInSign - degree) * 60);
    return { degree, minute };
  }

  public calculateNatalChart(birthData: BirthData): NatalChart {
    const julianDay = this.getJulianDay(birthData);
    const planets: Planet[] = [];

    // Calculate planetary positions
    for (const planet of PLANETS) {
      const result = swisseph.swe_calc_ut(julianDay, planet.id, swisseph.SEFLG_SPEED);

      if (result.flag !== swisseph.ERR) {
        const { degree, minute } = this.getDegreeInSign(result.longitude);

        planets.push({
          name: planet.name,
          longitude: result.longitude,
          latitude: result.latitude,
          distance: result.distance,
          longitudeSpeed: result.longitudeSpeed,
          latitudeSpeed: result.latitudeSpeed,
          distanceSpeed: result.distanceSpeed,
          sign: this.getSign(result.longitude),
          degree,
          minute,
        });
      }
    }

    // Calculate houses
    const houses = this.calculateHouses(julianDay, birthData.latitude, birthData.longitude);

    // Calculate ascendant and midheaven
    const ascendant = houses[0]?.cusp || 0;
    const midheaven = houses[9]?.cusp || 0;

    // Calculate aspects
    const aspects = this.calculateAspects(planets);

    return {
      planets,
      houses,
      ascendant,
      midheaven,
      aspects,
    };
  }

  private calculateHouses(julianDay: number, latitude: number, longitude: number): House[] {
    const houses: House[] = [];

    // Using Placidus house system
    const result = swisseph.swe_houses(julianDay, latitude, longitude, 'P');

    if (result.flag !== swisseph.ERR) {
      for (let i = 0; i < 12; i++) {
        houses.push({
          number: i + 1,
          cusp: result.house[i],
          sign: this.getSign(result.house[i]),
        });
      }
    }

    return houses;
  }

  private calculateAspects(planets: Planet[]): Aspect[] {
    const aspects: Aspect[] = [];

    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const planet1 = planets[i];
        const planet2 = planets[j];

        let angleDiff = Math.abs(planet1.longitude - planet2.longitude);
        if (angleDiff > 180) {
          angleDiff = 360 - angleDiff;
        }

        for (const aspectType of ASPECT_TYPES) {
          const orb = Math.abs(angleDiff - aspectType.angle);

          if (orb <= aspectType.orb) {
            // Determine if aspect is applying or separating
            const isApplying = this.isAspectApplying(planet1, planet2, aspectType.angle);

            aspects.push({
              planet1: planet1.name,
              planet2: planet2.name,
              angle: aspectType.angle,
              type: aspectType.name as any,
              orb,
              isApplying,
            });
            break; // Only add the first matching aspect
          }
        }
      }
    }

    return aspects;
  }

  private isAspectApplying(planet1: Planet, planet2: Planet, aspectAngle: number): boolean {
    // Simplified calculation - in reality this would be more complex
    const speedDiff = planet1.longitudeSpeed - planet2.longitudeSpeed;
    return speedDiff > 0;
  }

  public getCurrentTransits(): Planet[] {
    const now = new Date();
    const julianDay = swisseph.swe_julday(
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate(),
      now.getHours() + now.getMinutes() / 60,
      swisseph.SE_GREG_CAL
    );

    const transits: Planet[] = [];

    for (const planet of PLANETS) {
      const result = swisseph.swe_calc_ut(julianDay, planet.id, swisseph.SEFLG_SPEED);

      if (result.flag !== swisseph.ERR) {
        const { degree, minute } = this.getDegreeInSign(result.longitude);

        transits.push({
          name: planet.name,
          longitude: result.longitude,
          latitude: result.latitude,
          distance: result.distance,
          longitudeSpeed: result.longitudeSpeed,
          latitudeSpeed: result.latitudeSpeed,
          distanceSpeed: result.distanceSpeed,
          sign: this.getSign(result.longitude),
          degree,
          minute,
        });
      }
    }

    return transits;
  }

  public findTransitAspects(natalChart: NatalChart, days: number = 30): Array<{
    date: Date;
    transitPlanet: string;
    natalPlanet: string;
    aspect: string;
    orb: number;
  }> {
    // This would calculate upcoming transits over the next specified days
    // Implementation would involve checking planetary positions for each day
    // and finding when transiting planets make aspects to natal positions

    return []; // Placeholder for now
  }
}