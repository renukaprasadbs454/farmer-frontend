import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { bookingService } from '../services/bookingService';
import { BookingStatus, ServiceBooking, ServiceType } from '../types';

interface BookingState {
  bookings: ServiceBooking[];
  loading: boolean;
  error: string | null;
  fetchBookings: () => Promise<void>;
  createBooking: (
    booking: Omit<ServiceBooking, 'id' | 'createdAt' | 'status'>,
  ) => Promise<ServiceBooking>;
  cancelBooking: (id: string) => Promise<void>;
  getBookingsByType: (type: ServiceType | 'all') => ServiceBooking[];
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      bookings: [],
      loading: false,
      error: null,

      fetchBookings: async () => {
        set({ loading: true, error: null });
        try {
          const bookings = await bookingService.getBookings();
          set({ bookings, loading: false });
        } catch (e) {
          set({ loading: false, error: (e as Error).message });
        }
      },

      createBooking: async (data) => {
        set({ loading: true, error: null });
        try {
          const booking = await bookingService.createBooking(data);
          set((s) => ({
            bookings: [booking, ...s.bookings],
            loading: false,
          }));
          return booking;
        } catch (e) {
          set({ loading: false, error: (e as Error).message });
          throw e;
        }
      },

      cancelBooking: async (id) => {
        set({ loading: true, error: null });
        try {
          await bookingService.updateBookingStatus(id, 'cancelled');
          set((s) => ({
            bookings: s.bookings.map((b) =>
              b.id === id ? { ...b, status: 'cancelled' as BookingStatus } : b,
            ),
            loading: false,
          }));
        } catch (e) {
          set({ loading: false, error: (e as Error).message });
        }
      },

      getBookingsByType: (type) => {
        const { bookings } = get();
        if (type === 'all') return bookings;
        return bookings.filter((b) => b.type === type);
      },
    }),
    {
      name: 'fm-bookings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ bookings: s.bookings }),
    },
  ),
);
