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
  selectedCategories: string[];
  sortBy: 'relevance' | 'price_low_high' | 'price_high_low' | 'rating' | 'newest';
  filters: ProductFilters;
  loading: boolean;
  error: string | null;

  fetchProducts: () => Promise<void>;
  fetchHomeSections: (farmerCrops: string[]) => Promise<void>;
  setSearchQuery: (q: string) => void;
  setSelectedCategories: (categories: string[]) => void;
  toggleCategory: (category: string) => void;
  setSortBy: (sort: 'relevance' | 'price_low_high' | 'price_high_low' | 'rating' | 'newest') => void;
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
      selectedCategories: [],
      sortBy: 'relevance',
      filters: DEFAULT_FILTERS,
      loading: false,
      error: null,

      fetchProducts: async () => {
        set({ loading: true, error: null });
        try {
          const { searchQuery, selectedCategories, sortBy, filters } = get();
          const mergedFilters: Partial<ProductFilters> = {
            ...filters,
            categories: selectedCategories as any,
            sortBy,
            search: searchQuery,
          };
          const results = await productService.getProducts(mergedFilters);
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

      setSelectedCategories: (categories) => {
        set({ selectedCategories: categories });
        get().fetchProducts();
      },

      toggleCategory: (category) => {
        const { selectedCategories } = get();
        const exists = selectedCategories.includes(category);
        const updated = exists
          ? selectedCategories.filter((c) => c !== category)
          : [...selectedCategories, category];
        set({ selectedCategories: updated });
        get().fetchProducts();
      },

      setSortBy: (sort) => {
        set({ sortBy: sort });
        get().fetchProducts();
      },

      setFilters: (patch) => {
        set((s) => ({ filters: { ...s.filters, ...patch } }));
        get().fetchProducts();
      },

      resetFilters: () => {
        set({
          filters: DEFAULT_FILTERS,
          selectedCategories: [],
          searchQuery: '',
          sortBy: 'relevance',
        });
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
