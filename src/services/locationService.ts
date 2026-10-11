import * as ExpoLocation from 'expo-location';
import { Platform } from 'react-native';
import { Location } from '../types';

export const KNOWN_PLACES: Location[] = [
  { label: 'Mandya, Karnataka', district: 'Mandya', state: 'Karnataka', latitude: 12.5218, longitude: 76.8951 },
  { label: 'Mysuru, Karnataka', district: 'Mysuru', state: 'Karnataka', latitude: 12.2958, longitude: 76.6394 },
  { label: 'Bengaluru, Karnataka', district: 'Bengaluru', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946 },
  { label: 'Hassan, Karnataka', district: 'Hassan', state: 'Karnataka', latitude: 13.0068, longitude: 76.1004 },
  { label: 'Tumakuru, Karnataka', district: 'Tumakuru', state: 'Karnataka', latitude: 13.3379, longitude: 77.1173 },
  { label: 'Chikkaballapur, Karnataka', district: 'Chikkaballapur', state: 'Karnataka', latitude: 13.4355, longitude: 77.7315 },
  { label: 'Kolar, Karnataka', district: 'Kolar', state: 'Karnataka', latitude: 13.1357, longitude: 78.1294 },
  { label: 'Dharwad, Karnataka', district: 'Dharwad', state: 'Karnataka', latitude: 15.4589, longitude: 75.0078 },
];

export interface ReverseGeocodeResult {
  village: string;
  taluk: string;
  district: string;
  state: string;
  pincode: string;
  label: string;
  latitude: number;
  longitude: number;
}

const dist = (a: Location, lat: number, lng: number) =>
  Math.hypot((a.latitude ?? 0) - lat, (a.longitude ?? 0) - lng);

export const locationService = {
  async searchPlaces(query: string): Promise<Location[]> {
    const q = query.trim().toLowerCase();
    return q ? KNOWN_PLACES.filter((p) => p.label.toLowerCase().includes(q)) : KNOWN_PLACES;
  },

  /**
   * Request live location permission & get exact current GPS position
   */
  async getCurrentLocation(): Promise<Location> {
    try {
      let latitude: number | null = null;
      let longitude: number | null = null;

      if (Platform.OS === 'web') {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported on this browser'));
          } else {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 10000,
              enableHighAccuracy: true,
            });
          }
        });
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      } else {
        const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          throw new Error('Location permission denied');
        }
        const pos = await ExpoLocation.getCurrentPositionAsync({
          accuracy: ExpoLocation.Accuracy.Balanced,
        });
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      }

      if (latitude !== null && longitude !== null) {
        // Try live reverse geocode via Nominatim API or Expo
        const liveGeo = await this.reverseGeocode({ latitude, longitude });
        return {
          label: liveGeo.label,
          district: liveGeo.district,
          state: liveGeo.state,
          latitude,
          longitude,
        };
      }
    } catch (err) {
      console.warn('Location fetching fallback:', err);
    }

    // Default fallback if denied or error
    return KNOWN_PLACES[0];
  },

  /**
   * Reverse geocode coordinates to get detailed place label, district, state
   */
  async reverseGeocode(loc: { latitude: number; longitude: number }): Promise<ReverseGeocodeResult> {
    try {
      // Try OpenStreetMap Nominatim reverse geocoding API
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${loc.latitude}&lon=${loc.longitude}&format=json&addressdetails=1`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'FarmerMateApp/1.0',
        },
      });

      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const village = addr.village || addr.suburb || addr.town || addr.city_district || addr.county || 'Farm Region';
        const district = addr.state_district || addr.district || addr.county || addr.city || 'Karnataka';
        const state = addr.state || 'Karnataka';
        const pincode = addr.postcode || '571401';
        const label = `${village}, ${district}`;

        return {
          village,
          taluk: addr.suburb || addr.county || district,
          district,
          state,
          pincode,
          label,
          latitude: loc.latitude,
          longitude: loc.longitude,
        };
      }
    } catch {
      // Ignore network errors and fallback
    }

    // Nearest known place fallback
    const nearest = [...KNOWN_PLACES].sort(
      (a, b) => dist(a, loc.latitude, loc.longitude) - dist(b, loc.latitude, loc.longitude)
    )[0];

    return {
      village: nearest.district,
      taluk: nearest.district,
      district: nearest.district,
      state: nearest.state,
      pincode: '571401',
      label: nearest.label,
      latitude: loc.latitude,
      longitude: loc.longitude,
    };
  },
};
