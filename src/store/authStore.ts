import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { authService } from '../services/authService';
import { useFarmerStore } from './farmerStore';

interface AuthState {
  token: string | null;
  mobile: string;
  accountId: string | null;
  sessionChecked: boolean;
  loading: boolean;
  error: string | null;
  sendOtp: (mobile: string) => Promise<boolean>;
  verifyOtp: (otp: string) => Promise<boolean>;
  validateSession: () => Promise<boolean>;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      mobile: '',
      accountId: null,
      sessionChecked: false,
      loading: false,
      error: null,

      sendOtp: async (mobile) => {
        set({ loading: true, error: null });
        try {
          await authService.sendOtp(mobile);
          set({ mobile, loading: false });
          return true;
        } catch (e) {
          set({ loading: false, error: (e as Error).message });
          return false;
        }
      },

      verifyOtp: async (otp) => {
        set({ loading: true, error: null });
        try {
          const mobile = get().mobile;
          const { token, account, activeProfile } = await authService.verifyOtp(mobile, otp);

          const accountId = account?.id || null;

          // Find active farmer profile from backend response
          const farmerProfiles = account?.profiles?.filter((p: any) => p.role === 'FARMER') || [];
          const chosenProfile = (activeProfile?.role === 'FARMER' ? activeProfile : farmerProfiles[0]) || null;

          // Sync farmer name, address, crops, and onboarded status from backend DB!
          useFarmerStore.getState().syncWithBackendProfile(chosenProfile, mobile, accountId);

          set({ token, accountId, loading: false, sessionChecked: true });
          return true;
        } catch (e) {
          set({ loading: false, error: (e as Error).message });
          return false;
        }
      },

      validateSession: async () => {
        const token = get().token;
        if (!token) {
          useFarmerStore.getState().resetFarmer();
          set({ mobile: '', accountId: null, sessionChecked: true, loading: false, error: null });
          return false;
        }

        set({ loading: true, error: null });
        try {
          const { account, activeProfile } = await authService.validateSession(token);
          const mobile = activeProfile?.account?.phoneNumber || account?.phoneNumber || get().mobile;
          const accountId = account?.id || activeProfile?.accountId || get().accountId || null;

          useFarmerStore.getState().syncWithBackendProfile(activeProfile, mobile, accountId);
          set({ mobile, accountId, loading: false, sessionChecked: true, error: null });
          return true;
        } catch {
          await AsyncStorage.multiRemove(['fm-auth', 'fm-farmer']);
          useFarmerStore.getState().resetFarmer();
          set({ token: null, mobile: '', accountId: null, loading: false, error: null, sessionChecked: true });
          return false;
        }
      },

      setToken: (token: string) => set({ token, sessionChecked: true }),

      logout: async () => {
        // Clear cached farmer profile & stores on logout
        await AsyncStorage.multiRemove(['fm-auth', 'fm-farmer']);
        useFarmerStore.getState().resetFarmer();
        set({ token: null, mobile: '', accountId: null, error: null, sessionChecked: true });
      },
    }),
    {
      name: 'fm-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ token: s.token, mobile: s.mobile, accountId: s.accountId }),
    },
  ),
);
