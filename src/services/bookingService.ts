import { MOCK_BOOKINGS } from '../constants/mockServices';
import { BookingStatus, ServiceBooking } from '../types';
import { wait } from '../utils/delay';

// In-memory bookings list that persists during the session.
// The Zustand store is the real source of truth; this is just the service layer stub.
let _bookings = [...MOCK_BOOKINGS];

export const bookingService = {
  async getBookings(): Promise<ServiceBooking[]> {
    await wait(150);
    return [..._bookings].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  async getBookingById(id: string): Promise<ServiceBooking | null> {
    await wait(100);
    return _bookings.find((b) => b.id === id) ?? null;
  },

  async createBooking(
    booking: Omit<ServiceBooking, 'id' | 'createdAt' | 'status'>,
  ): Promise<ServiceBooking> {
    await wait(400);
    const newBooking: ServiceBooking = {
      ...booking,
      id: `bk-${Date.now()}`,
      status: 'requested',
      createdAt: new Date().toISOString(),
    };
    _bookings = [newBooking, ..._bookings];
    return newBooking;
  },

  async updateBookingStatus(
    id: string,
    status: BookingStatus,
  ): Promise<ServiceBooking | null> {
    await wait(200);
    const idx = _bookings.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    _bookings[idx] = { ..._bookings[idx], status };
    return _bookings[idx];
  },

  /** Reset to seed data — useful for testing. */
  _reset() {
    _bookings = [...MOCK_BOOKINGS];
  },
};
