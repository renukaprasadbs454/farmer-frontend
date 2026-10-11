import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ProductOrder } from '../types';

interface ProductOrderState {
  orders: ProductOrder[];
  addOrder: (order: ProductOrder) => void;
  fetchOrders: () => void;
  getOrderById: (id: string) => ProductOrder | undefined;
}

export const useProductOrderStore = create<ProductOrderState>()(
  persist(
    (set, get) => ({
      orders: [],

      addOrder: (order) => {
        set((state) => ({ orders: [order, ...state.orders] }));
      },

      fetchOrders: () => {
        // Local persist automatically maintains state
      },

      getOrderById: (id) => {
        return get().orders.find((o) => o.id === id);
      },
    }),
    {
      name: 'fm-product-orders',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ orders: s.orders }),
    },
  ),
);
