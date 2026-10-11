import { create } from 'zustand';
import { labourService } from '../services/labourService';
import { machineryService } from '../services/machineryService';
import {
  Labourer,
  LabourCategory,
  LabourFilters,
  Machinery,
  MachineryCategory,
  MachineryFilters,
  ServiceType,
} from '../types';

interface ServiceState {
  // Active tab
  activeTab: ServiceType;
  setActiveTab: (tab: ServiceType) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Labour
  labourCategory: LabourCategory;
  setLabourCategory: (c: LabourCategory) => void;
  labourFilters: Partial<LabourFilters>;
  setLabourFilters: (f: Partial<LabourFilters>) => void;
  resetLabourFilters: () => void;
  labourers: Labourer[];
  labourLoading: boolean;
  fetchLabourers: () => Promise<void>;

  // Machinery
  machineryCategory: MachineryCategory;
  setMachineryCategory: (c: MachineryCategory) => void;
  machineryFilters: Partial<MachineryFilters>;
  setMachineryFilters: (f: Partial<MachineryFilters>) => void;
  resetMachineryFilters: () => void;
  machinery: Machinery[];
  machineryLoading: boolean;
  fetchMachinery: () => Promise<void>;

  // Saved / favourites
  savedLabourIds: string[];
  savedMachineryIds: string[];
  toggleSaveLabour: (id: string) => void;
  toggleSaveMachinery: (id: string) => void;
}

export const useServiceStore = create<ServiceState>()((set, get) => ({
  activeTab: 'labour',
  setActiveTab: (tab) => set({ activeTab: tab }),

  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),

  // Labour
  labourCategory: 'all',
  setLabourCategory: (c) => {
    set({ labourCategory: c });
    get().fetchLabourers();
  },
  labourFilters: {},
  setLabourFilters: (f) => {
    set({ labourFilters: f });
    get().fetchLabourers();
  },
  resetLabourFilters: () => {
    set({ labourFilters: {}, labourCategory: 'all' });
    get().fetchLabourers();
  },
  labourers: [],
  labourLoading: false,
  fetchLabourers: async () => {
    set({ labourLoading: true });
    const { searchQuery, labourCategory, labourFilters } = get();
    const filters = { ...labourFilters, category: labourCategory };
    const labourers = await labourService.getLabourers(searchQuery, filters);
    set({ labourers, labourLoading: false });
  },

  // Machinery
  machineryCategory: 'all',
  setMachineryCategory: (c) => {
    set({ machineryCategory: c });
    get().fetchMachinery();
  },
  machineryFilters: {},
  setMachineryFilters: (f) => {
    set({ machineryFilters: f });
    get().fetchMachinery();
  },
  resetMachineryFilters: () => {
    set({ machineryFilters: {}, machineryCategory: 'all' });
    get().fetchMachinery();
  },
  machinery: [],
  machineryLoading: false,
  fetchMachinery: async () => {
    set({ machineryLoading: true });
    const { searchQuery, machineryCategory, machineryFilters } = get();
    const filters = { ...machineryFilters, category: machineryCategory };
    const machinery = await machineryService.getMachinery(searchQuery, filters);
    set({ machinery, machineryLoading: false });
  },

  // Saved
  savedLabourIds: [],
  savedMachineryIds: [],
  toggleSaveLabour: (id) =>
    set((s) => ({
      savedLabourIds: s.savedLabourIds.includes(id)
        ? s.savedLabourIds.filter((x) => x !== id)
        : [...s.savedLabourIds, id],
    })),
  toggleSaveMachinery: (id) =>
    set((s) => ({
      savedMachineryIds: s.savedMachineryIds.includes(id)
        ? s.savedMachineryIds.filter((x) => x !== id)
        : [...s.savedMachineryIds, id],
    })),
}));
