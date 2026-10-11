import { useEffect, useState } from 'react';
import { useLangStore } from '../i18n';
import { useAuthStore } from '../store/authStore';
import { useBookingStore } from '../store/bookingStore';
import { useFarmerStore } from '../store/farmerStore';

const stores = [useAuthStore, useFarmerStore, useLangStore, useBookingStore];
const allHydrated = () => stores.every((s) => s.persist.hasHydrated());

// True once every persisted store has loaded from device storage.
export function useHydrated() {
  const [ready, setReady] = useState(allHydrated);
  useEffect(() => {
    const check = () => setReady(allHydrated());
    const unsubs = stores.map((s) => s.persist.onFinishHydration(check));
    check();
    return () => unsubs.forEach((u) => u());
  }, []);
  return ready;
}
