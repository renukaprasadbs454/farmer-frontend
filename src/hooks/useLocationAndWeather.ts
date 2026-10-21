import { useCallback, useEffect, useState } from 'react';
import { locationService } from '../services/locationService';
import { WeatherData, weatherService } from '../services/weatherService';
import { useLocationStore } from '../store/locationStore';
import { Location } from '../types';

export function useLocationAndWeather() {
  const { currentLocation, setLocation, permissionGranted, requestPermission } = useLocationStore();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const fetchWeatherForLocation = useCallback(async (loc: Location) => {
    setLoading(true);
    setWeatherError(null);
    try {
      const data = await weatherService.getLiveWeather(
        loc.latitude ?? 12.5218,
        loc.longitude ?? 76.8951,
        loc.label
      );
      setWeather(data);
    } catch (err) {
      console.warn('Weather fetch failed:', err);
      setWeather(null);
      setWeatherError((err as Error)?.message || 'Unable to fetch live weather');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLiveGPS = useCallback(async () => {
    setLoading(true);
    setLocationError(null);
    try {
      const liveLoc = await locationService.getCurrentLocation();
      requestPermission(true);
      setLocation(liveLoc);
      await fetchWeatherForLocation(liveLoc);
    } catch (err: any) {
      console.warn('GPS location request error:', err);
      setLocationError(err?.message || 'Unable to access live GPS location');
      requestPermission(false);
      // Fallback to saved location
      await fetchWeatherForLocation(currentLocation);
    } finally {
      setLoading(false);
    }
  }, [currentLocation, fetchWeatherForLocation, requestPermission, setLocation]);

  useEffect(() => {
    // Initial fetch based on store or attempt live GPS
    if (currentLocation?.latitude && currentLocation?.longitude) {
      fetchWeatherForLocation(currentLocation);
    } else {
      fetchLiveGPS();
    }
  }, []);

  return {
    location: currentLocation,
    weather,
    loading,
    locationError,
    weatherError,
    permissionGranted,
    fetchLiveGPS,
    refreshWeather: () => fetchWeatherForLocation(currentLocation),
  };
}
