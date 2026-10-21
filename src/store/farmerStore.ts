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
  borewellWaterAvailability: undefined,
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
              gpsLat: activeProfile.latitude || undefined,
              gpsLng: activeProfile.longitude || undefined,
              gpsLabel: activeProfile.address || (region.name ? `${region.name}, ${region.district || ''}` : ''),
            },
            farm: {
              village: fProfile.village || activeProfile.village || region.name || '',
              hobli: fProfile.hobli || activeProfile.hobli || '',
              taluk: fProfile.taluk || activeProfile.taluk || region.district || '',
              district: fProfile.district || activeProfile.district || region.district || '',
              state: fProfile.state || activeProfile.state || region.state || '',
              pincode: fProfile.pincode || activeProfile.pincode || region.pincodes?.[0] || '',
              totalLand: fProfile.totalLandArea || fProfile.landAreaAcres || 0,
              cultivatedLand: fProfile.cultivatedLandArea || (fProfile.landAreaAcres ? Math.max(0, fProfile.landAreaAcres - 1) : 0),
              landUnit: fProfile.landUnit || 'acres',
              waterSources: fProfile.waterSources || [],
              hasBorewell: Boolean(fProfile.hasBorewell),
              borewellDepthFeet: fProfile.borewellDepth || undefined,
              animals: fProfile.animals || [],
              vehicles: fProfile.vehicles || [],
              soilType: fProfile.soilType || undefined,
              soilPH: fProfile.soilPh || '',
              hasSoilTest: Boolean(fProfile.soilTested),
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
          const formattedAddress =
            farmer.gpsLabel ||
            [farm.village, farm.hobli, farm.taluk, farm.district, farm.state].filter(Boolean).join(', ') ||
            farmer.address;

          const subProfileData = {
            totalLandArea: farm.totalLand || 0,
            cultivatedLandArea: farm.cultivatedLand || 0,
            landUnit: farm.landUnit || 'acres',
            landAreaAcres: farm.totalLand || 2,
            state: farm.state,
            district: farm.district,
            taluk: farm.taluk,
            hobli: farm.hobli,
            village: farm.village,
            pincode: farm.pincode,
            waterSources: farm.waterSources || [],
            hasBorewell: farm.hasBorewell || false,
            borewellDepth: farm.borewellDepthFeet,
            animals: farm.animals || [],
            vehicles: farm.vehicles || [],
            soilType: farm.soilType || 'Normal Soil',
            soilPh: farm.soilPH,
            soilTested: farm.hasSoilTest || false,
            primaryCrops: crops,
          };

          const res = await createFarmerProfileApi({
            accountId,
            fullName: farmer.name,
            address: formattedAddress,
            latitude: farmer.gpsLat,
            longitude: farmer.gpsLng,
            state: farm.state,
            district: farm.district,
            taluk: farm.taluk,
            hobli: farm.hobli,
            village: farm.village,
            pincode: farm.pincode,
            subProfileData,
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
