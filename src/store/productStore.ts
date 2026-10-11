import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { productService } from '../services/productService';
import { Product, ProductCategory, ProductFilters } from '../types';

interface ProductState {
  products: Product[];
  featuredProducts: Product[];
  recommendedProducts: Product[];
  recentlyViewedIds: string[];
  searchQuery: string;
  filters: ProductFilters;
  loading: boolean;
  error: string | null;

  fetchProducts: () => Promise<void>;
  fetchHomeSections: (farmerCrops: string[]) => Promise<void>;
  setSearchQuery: (q: string) => void;
  setFilters: (filters: Partial<ProductFilters>) => void;
  resetFilters: () => void;
  addRecentlyViewed: (productId: string) => void;
}

const DEFAULT_FILTERS: ProductFilters = {
  category: 'all',
  subcategory: 'all',
  brand: 'all',
  minPrice: 0,
  maxPrice: 0,
  minRating: 0,
  organicOnly: false,
  inStockOnly: false,
  sortBy: 'relevance',
};

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: [],
      featuredProducts: [],
      recommendedProducts: [],
      recentlyViewedIds: [],
      searchQuery: '',
      filters: DEFAULT_FILTERS,
      loading: false,
      error: null,

      fetchProducts: async () => {
        set({ loading: true, error: null });
        try {
          const { searchQuery, filters } = get();
          let results: Product[] = [];
          if (searchQuery.trim()) {
            results = await productService.searchProducts(searchQuery);
          } else {
            results = await productService.getProducts(filters);
          }
          set({ products: results, loading: false });
        } catch (e) {
          set({ loading: false, error: (e as Error).message });
        }
      },

      fetchHomeSections: async (farmerCrops) => {
        try {
          const featured = await productService.getFeaturedProducts();
          const recommended = await productService.getRecommendedProducts(farmerCrops);
          set({ featuredProducts: featured, recommendedProducts: recommended });
        } catch (e) {
          console.error(e);
        }
      },

      setSearchQuery: (q) => {
        set({ searchQuery: q });
        get().fetchProducts();
      },

      setFilters: (patch) => {
        set((s) => ({ filters: { ...s.filters, ...patch } }));
        get().fetchProducts();
      },

      resetFilters: () => {
        set({ filters: DEFAULT_FILTERS });
        get().fetchProducts();
      },

      addRecentlyViewed: (id) => {
        set((s) => {
          const filtered = s.recentlyViewedIds.filter((x) => x !== id);
          return { recentlyViewedIds: [id, ...filtered].slice(0, 10) };
        });
      },
    }),
    {
      name: 'fm-products',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ recentlyViewedIds: s.recentlyViewedIds }),
    },
  ),
);
