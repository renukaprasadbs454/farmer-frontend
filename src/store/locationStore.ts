import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Location } from '../types';

interface LocationState {
  currentLocation: Location;
  permissionGranted: boolean;
  permissionAsked: boolean;
  manualOverride: boolean;

  setLocation: (loc: Partial<Location>) => void;
  requestPermission: (grant: boolean) => void;
  resetLocationToFarm: (farmLoc: Location) => void;
}

const DEFAULT_LOCATION: Location = {
  label: 'Mandya Farm',
  district: 'Mandya',
  state: 'Karnataka',
  latitude: 12.5218,
  longitude: 76.8951,
};

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      currentLocation: DEFAULT_LOCATION,
      permissionGranted: false,
      permissionAsked: false,
      manualOverride: false,

      setLocation: (patch) => {
        set((s) => ({
          currentLocation: { ...s.currentLocation, ...patch },
          manualOverride: true,
        }));
      },

      requestPermission: (grant) => {
        set({
          permissionGranted: grant,
          permissionAsked: true,
        });
      },

      resetLocationToFarm: (farmLoc) => {
        set({
          currentLocation: farmLoc,
          manualOverride: false,
        });
      },
    }),
    {
      name: 'fm-location',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        currentLocation: s.currentLocation,
        permissionGranted: s.permissionGranted,
        permissionAsked: s.permissionAsked,
      }),
    },
  ),
);
