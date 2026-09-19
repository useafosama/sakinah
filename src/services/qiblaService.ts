import { TheShiaQiblaResponse, QiblaDirectionInfo } from '../types/prayer';

const BASE_URL = 'https://theshia.org/api/v1';
const MAKKAH_LAT = 21.422487;
const MAKKAH_LNG = 39.826206;
const CACHE_PREFIX = 'sakinah_qibla_cache_v1_';

/**
 * Calculates mathematical Qibla bearing from True North in degrees (0 - 360)
 * Great circle formula (forward azimuth)
 */
export function calculateFallbackQibla(lat: number, lng: number): number {
  const phi1 = (lat * Math.PI) / 180;
  const lambda1 = (lng * Math.PI) / 180;
  const phi2 = (MAKKAH_LAT * Math.PI) / 180;
  const lambda2 = (MAKKAH_LNG * Math.PI) / 180;

  const deltaLambda = lambda2 - lambda1;

  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltaLambda);

  let qiblaRad = Math.atan2(y, x);
  let qiblaDeg = (qiblaRad * 180) / Math.PI;

  return (qiblaDeg + 360) % 360;
}

/**
 * Calculates Haversine distance in kilometers from given coords to the Kaaba in Makkah
 */
export function calculateDistanceToMakkah(lat: number, lng: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((MAKKAH_LAT - lat) * Math.PI) / 180;
  const dLng = ((MAKKAH_LNG - lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat * Math.PI) / 180) *
      Math.cos((MAKKAH_LAT * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Returns Arabic & English cardinal direction for an angle (0-360)
 */
export function getCardinalDirection(deg: number): { ar: string; en: string } {
  const normalized = (deg % 360 + 360) % 360;
  const directions = [
    { ar: 'الشمال', en: 'N' },
    { ar: 'الشمال الشرقي', en: 'NE' },
    { ar: 'الشرق', en: 'E' },
    { ar: 'الجنوب الشرقي', en: 'SE' },
    { ar: 'الجنوب', en: 'S' },
    { ar: 'الجنوب الغربي', en: 'SW' },
    { ar: 'الغرب', en: 'W' },
    { ar: 'الشمال الغربي', en: 'NW' },
  ];

  const index = Math.round(normalized / 45) % 8;
  return directions[index];
}

/**
 * Fetches Qibla direction from TheShia API with local caching and mathematical fallback
 */
export async function fetchQiblaDirection(lat: number, lng: number): Promise<QiblaDirectionInfo> {
  const cacheKey = `${CACHE_PREFIX}${lat.toFixed(4)}_${lng.toFixed(4)}`;

  // Check localStorage cache
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as { qibla: number; cachedAt: number };
      // Cache valid for 30 days
      if (Date.now() - parsed.cachedAt < 30 * 24 * 60 * 60 * 1000) {
        const cardinal = getCardinalDirection(parsed.qibla);
        const distanceKm = calculateDistanceToMakkah(lat, lng);
        return {
          qiblaAngle: parsed.qibla,
          cardinalAr: cardinal.ar,
          cardinalEn: cardinal.en,
          distanceKm,
        };
      }
    }
  } catch (e) {
    console.warn('Failed reading Qibla cache:', e);
  }

  // Fetch from TheShia Qibla API
  let qiblaAngle: number;
  try {
    const response = await fetch(`${BASE_URL}/qibla?lat=${lat}&lng=${lng}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`TheShia Qibla API error: HTTP ${response.status}`);
    }

    const data: TheShiaQiblaResponse = await response.json();
    if (typeof data.qibla !== 'number') {
      throw new Error('Invalid Qibla API response format');
    }

    qiblaAngle = data.qibla;

    // Cache successful response
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ qibla: qiblaAngle, cachedAt: Date.now() }));
    } catch {
      // Ignore quota errors
    }
  } catch (err) {
    console.warn('Using mathematical fallback for Qibla direction:', err);
    qiblaAngle = calculateFallbackQibla(lat, lng);
  }

  const cardinal = getCardinalDirection(qiblaAngle);
  const distanceKm = calculateDistanceToMakkah(lat, lng);

  return {
    qiblaAngle,
    cardinalAr: cardinal.ar,
    cardinalEn: cardinal.en,
    distanceKm,
  };
}

/**
 * Calculates shortest signed angular difference between angle A and B (-180 to +180)
 */
export function getShortestAngleDelta(fromAngle: number, toAngle: number): number {
  return ((((toAngle - fromAngle) % 360) + 540) % 360) - 180;
}
