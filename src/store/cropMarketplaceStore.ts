import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { cropMarketplaceService } from '../services/cropMarketplaceService';
import {
  CropFilters,
  CropListing,
  CropPurchaseRequest,
  CropSale,
} from '../types';

interface CropMarketplaceState {
  listings: CropListing[];
  myListings: CropListing[];
  requests: CropPurchaseRequest[];
  sales: CropSale[];
  savedCropIds: string[];
  recentlyViewedCropIds: string[];
  searchQuery: string;
  filters: CropFilters;
  loading: boolean;
  error: string | null;

  // Actions
  fetchListings: () => Promise<void>;
  fetchMyListings: () => Promise<void>;
  fetchRequests: () => Promise<void>;
  fetchSales: () => Promise<void>;
  setSearchQuery: (q: string) => void;
  setFilters: (filters: Partial<CropFilters>) => void;
  resetFilters: () => void;
  createListing: (data: Omit<CropListing, 'id' | 'createdAt' | 'updatedAt' | 'availableQuantity' | 'requestCount'>) => Promise<CropListing>;
  updateListing: (id: string, patch: Partial<CropListing>) => Promise<CropListing>;
  pauseListing: (id: string) => Promise<void>;
  resumeListing: (id: string) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  sendPurchaseRequest: (data: Omit<CropPurchaseRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<CropPurchaseRequest>;
  acceptRequest: (requestId: string) => Promise<void>;
  rejectRequest: (requestId: string) => Promise<void>;
  toggleSaveCrop: (id: string) => void;
  addRecentlyViewedCrop: (id: string) => void;
}

const DEFAULT_FILTERS: CropFilters = {
  category: 'all',
  minPrice: 0,
  maxPrice: 0,
  minQuantity: 0,
  quality: 'all',
  farmingMethod: 'all',
  allowNegotiationOnly: false,
  sortBy: 'newest',
};

export const useCropMarketplaceStore = create<CropMarketplaceState>()(
  persist(
    (set, get) => ({
      listings: [],
      myListings: [],
      requests: [],
      sales: [],
      savedCropIds: [],
      recentlyViewedCropIds: [],
      searchQuery: '',
      filters: DEFAULT_FILTERS,
      loading: false,
      error: null,

      fetchListings: async () => {
        set({ loading: true, error: null });
        try {
          const { searchQuery, filters } = get();
          let results: CropListing[] = [];
          if (searchQuery.trim()) {
            results = await cropMarketplaceService.searchCropListings(searchQuery);
          } else {
            results = await cropMarketplaceService.getCropListings(filters);
          }
          set({ listings: results, loading: false });
        } catch (e) {
          set({ loading: false, error: (e as Error).message });
        }
      },

      fetchMyListings: async () => {
        set({ loading: true, error: null });
        try {
          const myListings = await cropMarketplaceService.getMyListings();
          set({ myListings, loading: false });
        } catch (e) {
          set({ loading: false, error: (e as Error).message });
        }
      },

      fetchRequests: async () => {
        try {
          const requests = await cropMarketplaceService.getPurchaseRequestsForFarmer();
          set({ requests });
        } catch (e) {
          console.error(e);
        }
      },

      fetchSales: async () => {
        try {
          const sales = await cropMarketplaceService.getCropSales();
          set({ sales });
        } catch (e) {
          console.error(e);
        }
      },

      setSearchQuery: (q) => {
        set({ searchQuery: q });
        get().fetchListings();
      },

      setFilters: (patch) => {
        set((s) => ({ filters: { ...s.filters, ...patch } }));
        get().fetchListings();
      },

      resetFilters: () => {
        set({ filters: DEFAULT_FILTERS });
        get().fetchListings();
      },

      createListing: async (data) => {
        set({ loading: true });
        const listing = await cropMarketplaceService.createCropListing(data);
        set((s) => ({
          myListings: [listing, ...s.myListings],
          listings: [listing, ...s.listings],
          loading: false,
        }));
        return listing;
      },

      updateListing: async (id, patch) => {
        const updated = await cropMarketplaceService.updateCropListing(id, patch);
        set((s) => ({
          myListings: s.myListings.map((l) => (l.id === id ? updated : l)),
          listings: s.listings.map((l) => (l.id === id ? updated : l)),
        }));
        return updated;
      },

      pauseListing: async (id) => {
        await cropMarketplaceService.pauseCropListing(id);
        get().fetchMyListings();
        get().fetchListings();
      },

      resumeListing: async (id) => {
        await cropMarketplaceService.resumeCropListing(id);
        get().fetchMyListings();
        get().fetchListings();
      },

      deleteListing: async (id) => {
        await cropMarketplaceService.deleteCropListing(id);
        get().fetchMyListings();
        get().fetchListings();
      },

      sendPurchaseRequest: async (data) => {
        const req = await cropMarketplaceService.createPurchaseRequest(data);
        get().fetchRequests();
        return req;
      },

      acceptRequest: async (requestId) => {
        await cropMarketplaceService.acceptPurchaseRequest(requestId);
        await get().fetchRequests();
        await get().fetchSales();
        await get().fetchMyListings();
        await get().fetchListings();
      },

      rejectRequest: async (requestId) => {
        await cropMarketplaceService.rejectPurchaseRequest(requestId);
        await get().fetchRequests();
      },

      toggleSaveCrop: (id) => {
        set((s) => {
          const exists = s.savedCropIds.includes(id);
          const updated = exists
            ? s.savedCropIds.filter((x) => x !== id)
            : [id, ...s.savedCropIds];
          return { savedCropIds: updated };
        });
      },

      addRecentlyViewedCrop: (id) => {
        set((s) => {
          const filtered = s.recentlyViewedCropIds.filter((x) => x !== id);
          return { recentlyViewedCropIds: [id, ...filtered].slice(0, 10) };
        });
      },
    }),
    {
      name: 'fm-crop-marketplace',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        savedCropIds: s.savedCropIds,
        recentlyViewedCropIds: s.recentlyViewedCropIds,
      }),
    },
  ),
);
