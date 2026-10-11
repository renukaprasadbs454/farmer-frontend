import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { CartItem, Product, ProductVariant } from '../types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getDiscount: () => number;
  getDeliveryFee: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, variant, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.product.id === product.id && i.variant.id === variant.id,
          );
          if (existingIndex > -1) {
            const updated = [...state.items];
            updated[existingIndex].quantity += quantity;
            return { items: updated };
          }
          return { items: [...state.items, { product, variant, quantity }] };
        });
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.product.id === productId && i.variant.id === variantId),
          ),
        }));
      },

      updateQuantity: (productId, variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId && i.variant.id === variantId
              ? { ...i, quantity }
              : i,
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + (Number(item.variant?.price) || 0) * (Number(item.quantity) || 1),
          0,
        );
      },

      getDiscount: () => {
        const subtotal = get().getSubtotal();
        return subtotal > 1000 ? 100 : 0;
      },

      getDeliveryFee: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        return subtotal > 1500 ? 0 : 50;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscount();
        const delivery = get().getDeliveryFee();
        const total = subtotal - discount + delivery;
        return isNaN(total) ? 0 : Math.max(0, total);
      },
    }),
    {
      name: 'fm-cart',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ items: s.items }),
    },
  ),
);
