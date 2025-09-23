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
  { name: 'Sun' },
  { name: 'Moon' },
  { name: 'Mercury' },
  { name: 'Venus' },
  { name: 'Mars' },
  { name: 'Jupiter' },
  { name: 'Saturn' },
  { name: 'Uranus' },
  { name: 'Neptune' },
  { name: 'Pluto' },
  { name: 'North Node' },
  { name: 'Chiron' },
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

  private constructor() {}

  public static getInstance(): AstrologyService {
    if (!AstrologyService.instance) {
      AstrologyService.instance = new AstrologyService();
    }
    return AstrologyService.instance;
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

  // Simplified calculation using basic astronomical formulas
  // In a real app, you'd use Swiss Ephemeris or similar library
  private calculatePlanetPosition(planetName: string, julianDay: number): Omit<Planet, 'house'> {
    // This is a simplified mock calculation
    // Real implementation would use proper astronomical calculations

    const basePosition = this.getBasePlanetPosition(planetName);
    const daysSinceEpoch = julianDay - 2451545.0; // J2000 epoch

    // Simple linear progression for demo purposes
    let longitude = (basePosition + daysSinceEpoch * this.getPlanetSpeed(planetName)) % 360;
    if (longitude < 0) longitude += 360;

    const { degree, minute } = this.getDegreeInSign(longitude);

    return {
      name: planetName,
      longitude,
      latitude: 0, // Simplified
      distance: 1, // Simplified
      longitudeSpeed: this.getPlanetSpeed(planetName),
      latitudeSpeed: 0,
      distanceSpeed: 0,
      sign: this.getSign(longitude),
      degree,
      minute,
    };
  }

  private getBasePlanetPosition(planetName: string): number {
    // Base positions at J2000 epoch (simplified)
    const positions: { [key: string]: number } = {
      'Sun': 280,
      'Moon': 45,
      'Mercury': 160,
      'Venus': 96,
      'Mars': 355,
      'Jupiter': 34,
      'Saturn': 46,
      'Uranus': 316,
      'Neptune': 302,
      'Pluto': 252,
      'North Node': 125,
      'Chiron': 106,
    };
    return positions[planetName] || 0;
  }

  private getPlanetSpeed(planetName: string): number {
    // Average daily motion in degrees (simplified)
    const speeds: { [key: string]: number } = {
      'Sun': 0.985647,
      'Moon': 13.176358,
      'Mercury': 1.383,
      'Venus': 1.602,
      'Mars': 0.524,
      'Jupiter': 0.083,
      'Saturn': 0.033,
      'Uranus': 0.012,
      'Neptune': 0.006,
      'Pluto': 0.004,
      'North Node': -0.053,
      'Chiron': 0.039,
    };
    return speeds[planetName] || 0;
  }

  private getJulianDay(birthData: BirthData): number {
    const date = birthData.date;
    const [hour, minute] = birthData.time.split(':').map(Number);

    const a = Math.floor((14 - (date.getMonth() + 1)) / 12);
    const y = date.getFullYear() - a;
    const m = (date.getMonth() + 1) + 12 * a - 3;

    const julianDay = date.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y +
                     Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

    return julianDay + (hour + minute / 60) / 24;
  }

  public calculateNatalChart(birthData: BirthData): NatalChart {
    const julianDay = this.getJulianDay(birthData);
    const planets: Planet[] = [];

    // Calculate planetary positions
    for (const planet of PLANETS) {
      const planetData = this.calculatePlanetPosition(planet.name, julianDay);
      planets.push(planetData);
    }

    // Calculate houses (simplified Placidus system)
    const houses = this.calculateHouses(julianDay, birthData.latitude, birthData.longitude);

    // Calculate ascendant and midheaven
    const ascendant = houses[0]?.cusp || 0;
    const midheaven = houses[9]?.cusp || 0;

    // Assign houses to planets
    planets.forEach(planet => {
      planet.house = this.findHouseForPlanet(planet.longitude, houses);
    });

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

    // Simplified house calculation
    // Real implementation would use complex spherical trigonometry
    const localSiderealTime = this.calculateLocalSiderealTime(julianDay, longitude);

    for (let i = 0; i < 12; i++) {
      const houseAngle = (localSiderealTime + i * 30) % 360;
      houses.push({
        number: i + 1,
        cusp: houseAngle,
        sign: this.getSign(houseAngle),
      });
    }

    return houses;
  }

  private calculateLocalSiderealTime(julianDay: number, longitude: number): number {
    // Simplified calculation
    const daysSinceJ2000 = julianDay - 2451545.0;
    const gmst = (280.46061837 + 360.98564736629 * daysSinceJ2000) % 360;
    return (gmst + longitude) % 360;
  }

  private findHouseForPlanet(planetLongitude: number, houses: House[]): number {
    for (let i = 0; i < houses.length; i++) {
      const currentHouse = houses[i];
      const nextHouse = houses[(i + 1) % houses.length];

      if (this.isAngleBetween(planetLongitude, currentHouse.cusp, nextHouse.cusp)) {
        return currentHouse.number;
      }
    }
    return 1; // Default to first house
  }

  private isAngleBetween(angle: number, start: number, end: number): boolean {
    if (start <= end) {
      return angle >= start && angle < end;
    } else {
      return angle >= start || angle < end;
    }
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
            const isApplying = this.isAspectApplying(planet1, planet2);

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

  private isAspectApplying(planet1: Planet, planet2: Planet): boolean {
    // Simplified calculation
    const speedDiff = planet1.longitudeSpeed - planet2.longitudeSpeed;
    return speedDiff > 0;
  }

  public getCurrentTransits(): Planet[] {
    const now = new Date();
    const birthData: BirthData = {
      date: now,
      time: `${now.getHours()}:${now.getMinutes()}`,
      latitude: 0,
      longitude: 0,
      timezone: 'UTC',
    };

    const julianDay = this.getJulianDay(birthData);
    const transits: Planet[] = [];

    for (const planet of PLANETS) {
      const planetData = this.calculatePlanetPosition(planet.name, julianDay);
      transits.push(planetData);
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