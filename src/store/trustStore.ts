import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MOCK_REVIEWS, MOCK_SUPPORT_TICKETS } from '../services/mockTrustData';
import { EntityReview, EntityType, SupportTicket } from '../types';
import { useFarmerStore } from './farmerStore';

interface TrustState {
  reviews: EntityReview[];
  tickets: SupportTicket[];

  addReview: (
    entityType: EntityType,
    entityId: string,
    rating: number,
    comment: string,
  ) => void;
  getReviewsForEntity: (entityType: EntityType, entityId: string) => EntityReview[];
  createSupportTicket: (
    category: SupportTicket['category'],
    description: string,
  ) => void;
}

export const useTrustStore = create<TrustState>()(
  persist(
    (set, get) => ({
      reviews: MOCK_REVIEWS,
      tickets: MOCK_SUPPORT_TICKETS,

      addReview: (entityType, entityId, rating, comment) => {
        const farmerState = useFarmerStore.getState();
        const reviewerId = farmerState.accountId || 'farmer-me';
        const reviewerName = farmerState.farmer.name || 'Farmer';

        const newRev: EntityReview = {
          id: `REV-${Date.now()}`,
          entityType,
          entityId,
          reviewerId,
          reviewerName,
          rating,
          comment,
          createdAt: new Date().toISOString().split('T')[0],
          verified: true,
        };
        set((s) => ({ reviews: [newRev, ...s.reviews] }));
      },

      getReviewsForEntity: (entityType, entityId) => {
        return get().reviews.filter(
          (r) => r.entityType === entityType && r.entityId === entityId,
        );
      },

      createSupportTicket: (category, description) => {
        const newTicket: SupportTicket = {
          id: `TICK-${Date.now()}`,
          category,
          description,
          createdAt: new Date().toISOString().split('T')[0],
          status: 'open',
        };
        set((s) => ({ tickets: [newTicket, ...s.tickets] }));
      },
    }),
    {
      name: 'fm-trust',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ reviews: s.reviews, tickets: s.tickets }),
    },
  ),
);
