import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createFarmerProfileApi } from '../services/api';
import { Farm, Farmer } from '../types';
import { useAuthStore } from './authStore';

interface FarmerState {
  accountId: string | null;
  farmer: Farmer;
  farm: Farm;
  crops: string[];
  onboarded: boolean;
  saving: boolean;
  setFarmer: (patch: Partial<Farmer>) => void;
  setFarm: (patch: Partial<Farm>) => void;
  setCrops: (crops: string[]) => void;
  syncWithBackendProfile: (activeProfile: any, mobile: string, accountId?: string | null) => void;
  resetFarmer: () => void;
  complete: () => Promise<void>;
}

const DEFAULT_FARMER: Farmer = { name: '', mobile: '', address: '', gpsLat: undefined, gpsLng: undefined, gpsLabel: '' };
const DEFAULT_FARM: Farm = {
  village: '',
  hobli: '',
  taluk: '',
  district: '',
  state: '',
  pincode: '',
  totalLand: 0,
  cultivatedLand: 0,
  landUnit: 'acres',
  waterSources: [],
  hasBorewell: false,
  borewellDepthFeet: undefined,
  animals: [],
  vehicles: [],
  soilType: undefined,
  soilPH: '',
  hasSoilTest: false,
};

export const useFarmerStore = create<FarmerState>()(
  persist(
    (set, get) => ({
      accountId: null,
      farmer: DEFAULT_FARMER,
      farm: DEFAULT_FARM,
      crops: [],
      onboarded: false,
      saving: false,
      setFarmer: (patch) => set((s) => ({ farmer: { ...s.farmer, ...patch } })),
      setFarm: (patch) => set((s) => ({ farm: { ...s.farm, ...patch } })),
      setCrops: (crops) => set({ crops }),

      syncWithBackendProfile: (activeProfile: any, mobile: string, accountId?: string | null) => {
        if (activeProfile) {
          const fProfile = activeProfile.farmerProfile || {};
          const region = activeProfile.region || {};
          set({
            accountId: accountId || activeProfile.accountId || null,
            farmer: {
              name: activeProfile.fullName || '',
              mobile: mobile || activeProfile.account?.phoneNumber || '',
              address: activeProfile.address || '',
              gpsLabel: activeProfile.address || (region.name ? `${region.name}, ${region.district || ''}` : ''),
            },
            farm: {
              village: region.name || '',
              hobli: '',
              taluk: region.district || '',
              district: region.district || '',
              state: region.state || '',
              pincode: region.pincodes?.[0] || '',
              totalLand: fProfile.landAreaAcres || 0,
              cultivatedLand: fProfile.landAreaAcres ? Math.max(0, fProfile.landAreaAcres - 1) : 0,
              landUnit: 'acres',
              waterSources: [],
              hasBorewell: false,
              animals: [],
              vehicles: [],
              hasSoilTest: false,
            },
            crops: fProfile.primaryCrops || [],
            onboarded: true,
          });
        } else {
          set({
            accountId: accountId || null,
            farmer: { name: '', mobile, address: '' },
            farm: DEFAULT_FARM,
            crops: [],
            onboarded: false,
          });
        }
      },

      resetFarmer: () =>
        set({
          accountId: null,
          farmer: DEFAULT_FARMER,
          farm: DEFAULT_FARM,
          crops: [],
          onboarded: false,
          saving: false,
        }),

      complete: async () => {
        set({ saving: true });
        const { farmer, farm, crops, accountId } = get();

        if (!accountId) {
          set({ saving: false });
          throw new Error('Account session missing. Please sign in again.');
        }

        try {
          const res = await createFarmerProfileApi({
            accountId,
            fullName: farmer.name,
            address: farmer.address,
            subProfileData: {
              landAreaAcres: farm.totalLand || 2,
              primaryCrops: crops,
            },
          });

          if (!res.success) {
            set({ saving: false });
            throw new Error(res.message || 'Failed to save farmer profile to backend database.');
          }

          if (res.data?.token) {
            useAuthStore.getState().setToken(res.data.token);
          }
          if (res.data?.activeProfile) {
            get().syncWithBackendProfile(res.data.activeProfile, farmer.mobile, accountId);
          }

          set({ saving: false, onboarded: true });
        } catch (err: any) {
          set({ saving: false });
          throw new Error(err.message || 'Network error saving profile to backend database.');
        }
      },
    }),
    {
      name: 'fm-farmer',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ accountId: s.accountId, farmer: s.farmer, farm: s.farm, crops: s.crops, onboarded: s.onboarded }),
    },
  ),
);
