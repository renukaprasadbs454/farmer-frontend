import { CropCategory, CropQuality, CropUnit } from '../types';

export interface CropCategoryOption {
  id: CropCategory;
  labelKey: string;
  defaultLabel: string;
  emoji: string;
}

export const CROP_CATEGORIES: CropCategoryOption[] = [
  { id: 'all', labelKey: 'catAll', defaultLabel: 'All', emoji: '🌾' },
  { id: 'vegetables', labelKey: 'catVegetables', defaultLabel: 'Vegetables', emoji: '🥦' },
  { id: 'fruits', labelKey: 'catFruits', defaultLabel: 'Fruits', emoji: '🍎' },
  { id: 'grains', labelKey: 'catGrains', defaultLabel: 'Grains & Cereals', emoji: '🌾' },
  { id: 'pulses', labelKey: 'catPulses', defaultLabel: 'Pulses', emoji: '🫘' },
  { id: 'spices', labelKey: 'catSpices', defaultLabel: 'Spices', emoji: '🌶️' },
  { id: 'oilseeds', labelKey: 'catOilseeds', defaultLabel: 'Oil Seeds', emoji: '🌻' },
  { id: 'other', labelKey: 'catOther', defaultLabel: 'Other', emoji: '➕' },
];

export const CROP_UNITS: { id: CropUnit; label: string }[] = [
  { id: 'kg', label: 'kg' },
  { id: 'quintal', label: 'quintal (100 kg)' },
  { id: 'ton', label: 'ton (1000 kg)' },
  { id: 'bag', label: 'bag' },
  { id: 'litre', label: 'litre' },
  { id: 'piece', label: 'piece' },
];

export const CROP_QUALITIES: CropQuality[] = ['Grade A', 'Grade B', 'Premium', 'Standard'];

export interface MarketDemandItem {
  id: string;
  cropName: string;
  emoji: string;
  demandLevel: 'High' | 'Medium' | 'Moderate';
  priceTrend: 'up' | 'stable' | 'down';
  avgPrice: string;
}

export const MOCK_MARKET_DEMAND: MarketDemandItem[] = [];
