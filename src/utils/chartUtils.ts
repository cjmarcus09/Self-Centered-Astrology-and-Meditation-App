export interface ChartPosition {
  x: number;
  y: number;
  angle: number;
}

export class ChartUtils {
  static readonly CHART_RADIUS = 150;
  static readonly INNER_RADIUS = 120;
  static readonly OUTER_RADIUS = 180;
  static readonly HOUSE_RADIUS = 100;
  static readonly PLANET_RADIUS = 135;

  /**
   * Convert astrological longitude to chart angle
   * Astrology starts at 0° Aries, charts start at 9 o'clock
   */
  static longitudeToChartAngle(longitude: number): number {
    // Convert astrological longitude (0° Aries = 0°) to chart angle
    // Chart starts at 9 o'clock (270°) and goes clockwise
    return (270 - longitude) % 360;
  }

  /**
   * Get position on circle for given angle and radius
   */
  static getPositionOnCircle(
    angle: number,
    radius: number,
    centerX: number = 0,
    centerY: number = 0
  ): ChartPosition {
    const radians = (angle * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(radians),
      y: centerY + radius * Math.sin(radians),
      angle,
    };
  }

  /**
   * Generate SVG path for zodiac sign sector
   */
  static generateZodiacSectorPath(
    startAngle: number,
    endAngle: number,
    innerRadius: number,
    outerRadius: number,
    centerX: number = 0,
    centerY: number = 0
  ): string {
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + innerRadius * Math.cos(startAngleRad);
    const y1 = centerY + innerRadius * Math.sin(startAngleRad);
    const x2 = centerX + outerRadius * Math.cos(startAngleRad);
    const y2 = centerY + outerRadius * Math.sin(startAngleRad);
    const x3 = centerX + outerRadius * Math.cos(endAngleRad);
    const y3 = centerY + outerRadius * Math.sin(endAngleRad);
    const x4 = centerX + innerRadius * Math.cos(endAngleRad);
    const y4 = centerY + innerRadius * Math.sin(endAngleRad);

    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      `M ${x1} ${y1}`,
      `L ${x2} ${y2}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3}`,
      `L ${x4} ${y4}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}`,
      'Z'
    ].join(' ');
  }

  /**
   * Generate SVG path for house division lines
   */
  static generateHouseLine(
    angle: number,
    startRadius: number,
    endRadius: number,
    centerX: number = 0,
    centerY: number = 0
  ): string {
    const start = this.getPositionOnCircle(angle, startRadius, centerX, centerY);
    const end = this.getPositionOnCircle(angle, endRadius, centerX, centerY);

    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  }

  /**
   * Calculate aspect angle between two planets
   */
  static calculateAspectAngle(planet1Longitude: number, planet2Longitude: number): number {
    let diff = Math.abs(planet1Longitude - planet2Longitude);
    if (diff > 180) {
      diff = 360 - diff;
    }
    return diff;
  }

  /**
   * Check if angle is within orb of aspect
   */
  static isAspectWithinOrb(
    calculatedAngle: number,
    aspectAngle: number,
    orb: number
  ): boolean {
    return Math.abs(calculatedAngle - aspectAngle) <= orb;
  }

  /**
   * Generate gradient ID for zodiac signs
   */
  static getZodiacGradientId(signName: string): string {
    return `zodiac-gradient-${signName.toLowerCase()}`;
  }

  /**
   * Generate SVG path for aspect line between two planets
   */
  static generateAspectLine(
    planet1Angle: number,
    planet2Angle: number,
    radius: number = ChartUtils.PLANET_RADIUS,
    centerX: number = 0,
    centerY: number = 0
  ): string {
    const pos1 = this.getPositionOnCircle(planet1Angle, radius, centerX, centerY);
    const pos2 = this.getPositionOnCircle(planet2Angle, radius, centerX, centerY);

    return `M ${pos1.x} ${pos1.y} L ${pos2.x} ${pos2.y}`;
  }

  /**
   * Distribute planets around a house to avoid overlapping
   */
  static distributePlanetsInHouse(
    planetsInHouse: Array<{ name: string; longitude: number }>,
    houseStartAngle: number,
    houseEndAngle: number
  ): Array<{ name: string; adjustedAngle: number; originalLongitude: number }> {
    if (planetsInHouse.length === 0) return [];
    if (planetsInHouse.length === 1) {
      return [{
        name: planetsInHouse[0].name,
        adjustedAngle: this.longitudeToChartAngle(planetsInHouse[0].longitude),
        originalLongitude: planetsInHouse[0].longitude,
      }];
    }

    // Sort planets by longitude within the house
    const sortedPlanets = planetsInHouse.sort((a, b) => a.longitude - b.longitude);

    // Calculate house span
    let houseSpan = houseEndAngle - houseStartAngle;
    if (houseSpan < 0) houseSpan += 360;

    // Minimum separation between planets in degrees
    const minSeparation = Math.min(6, houseSpan / (planetsInHouse.length + 1));

    return sortedPlanets.map((planet, index) => {
      // Distribute evenly across house with minimum separation
      const adjustment = (index - (planetsInHouse.length - 1) / 2) * minSeparation;
      const baseAngle = this.longitudeToChartAngle(planet.longitude);

      return {
        name: planet.name,
        adjustedAngle: (baseAngle + adjustment + 360) % 360,
        originalLongitude: planet.longitude,
      };
    });
  }

  /**
   * Format degree for display
   */
  static formatDegree(degree: number, minute: number): string {
    return `${degree}°${minute.toString().padStart(2, '0')}'`;
  }

  /**
   * Get zodiac sign from longitude
   */
  static getZodiacSign(longitude: number): string {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    const signIndex = Math.floor(longitude / 30);
    return signs[signIndex] || 'Aries';
  }
}