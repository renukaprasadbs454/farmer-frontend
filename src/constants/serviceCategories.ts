import { LabourCategory, MachineryCategory } from '../types';

export interface CategoryOption {
  id: string;
  label: string;
  emoji: string;
}

export const LABOUR_CATEGORIES: CategoryOption[] = [
  { id: 'all', label: 'All', emoji: '👥' },
  { id: 'harvesting', label: 'Harvesting', emoji: '🌾' },
  { id: 'planting', label: 'Planting', emoji: '🌱' },
  { id: 'irrigation', label: 'Irrigation', emoji: '💧' },
  { id: 'spraying', label: 'Spraying', emoji: '💨' },
  { id: 'weeding', label: 'Weeding', emoji: '🪴' },
  { id: 'loading', label: 'Loading', emoji: '📦' },
  { id: 'general', label: 'General Labour', emoji: '👷' },
  { id: 'other', label: 'Other', emoji: '➕' },
];

export const MACHINERY_CATEGORIES: CategoryOption[] = [
  { id: 'all', label: 'All', emoji: '🔧' },
  { id: 'tractor', label: 'Tractor', emoji: '🚜' },
  { id: 'jcb', label: 'JCB', emoji: '🏗️' },
  { id: 'rotavator', label: 'Rotavator', emoji: '⚙️' },
  { id: 'harvester', label: 'Harvester', emoji: '🌾' },
  { id: 'sprayer', label: 'Sprayer', emoji: '💨' },
  { id: 'cultivator', label: 'Cultivator', emoji: '🔩' },
  { id: 'water_tanker', label: 'Water Tanker', emoji: '🚰' },
  { id: 'transport', label: 'Transport', emoji: '🚛' },
  { id: 'other', label: 'Other', emoji: '➕' },
];

export function labourCategoryLabel(id: LabourCategory): string {
  return LABOUR_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function machineryCategoryLabel(id: MachineryCategory): string {
  return MACHINERY_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
