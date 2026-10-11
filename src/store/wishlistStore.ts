import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface WishlistState {
  wishlistIds: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlistIds: [],
      toggleWishlist: (productId) => {
        set((state) => {
          const exists = state.wishlistIds.includes(productId);
          const updated = exists
            ? state.wishlistIds.filter((id) => id !== productId)
            : [productId, ...state.wishlistIds];
          return { wishlistIds: updated };
        });
      },
      isWishlisted: (productId) => get().wishlistIds.includes(productId),
    }),
    {
      name: 'fm-wishlist',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ wishlistIds: s.wishlistIds }),
    },
  ),
);
