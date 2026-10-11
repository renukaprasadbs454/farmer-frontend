import { ProductCategory, ProductSubcategory } from '../types';

export interface ProductCategoryOption {
  id: ProductCategory;
  labelKey: string;
  defaultLabel: string;
  emoji: string;
  subcategories: { id: ProductSubcategory; labelKey: string; defaultLabel: string }[];
}

export const PRODUCT_CATEGORIES: ProductCategoryOption[] = [
  {
    id: 'seeds',
    labelKey: 'catSeeds',
    defaultLabel: 'Seeds',
    emoji: '🌱',
    subcategories: [
      { id: 'vegetable_seeds', labelKey: 'subVegSeeds', defaultLabel: 'Vegetable Seeds' },
      { id: 'paddy_seeds', labelKey: 'subPaddySeeds', defaultLabel: 'Paddy Seeds' },
      { id: 'maize_seeds', labelKey: 'subMaizeSeeds', defaultLabel: 'Maize Seeds' },
      { id: 'wheat_seeds', labelKey: 'subWheatSeeds', defaultLabel: 'Wheat Seeds' },
      { id: 'onion_seeds', labelKey: 'subOnionSeeds', defaultLabel: 'Onion Seeds' },
      { id: 'tomato_seeds', labelKey: 'subTomatoSeeds', defaultLabel: 'Tomato Seeds' },
      { id: 'chilli_seeds', labelKey: 'subChilliSeeds', defaultLabel: 'Chilli Seeds' },
      { id: 'fruit_plants', labelKey: 'subFruitPlants', defaultLabel: 'Fruit Plants' },
      { id: 'vegetable_plants', labelKey: 'subVegPlants', defaultLabel: 'Vegetable Plants' },
    ],
  },
  {
    id: 'fertilizers',
    labelKey: 'catFertilizers',
    defaultLabel: 'Fertilizers',
    emoji: '🧪',
    subcategories: [
      { id: 'urea', labelKey: 'subUrea', defaultLabel: 'Urea' },
      { id: 'dap', labelKey: 'subDap', defaultLabel: 'DAP' },
      { id: 'npk', labelKey: 'subNpk', defaultLabel: 'NPK' },
      { id: 'potash', labelKey: 'subPotash', defaultLabel: 'Potash' },
      { id: 'organic_fertilizer', labelKey: 'subOrgFert', defaultLabel: 'Organic Fertilizer' },
      { id: 'vermicompost', labelKey: 'subVermi', defaultLabel: 'Vermicompost' },
      { id: 'bio_fertilizer', labelKey: 'subBioFert', defaultLabel: 'Bio Fertilizer' },
      { id: 'micronutrients', labelKey: 'subMicroNut', defaultLabel: 'Micronutrients' },
    ],
  },
  {
    id: 'pesticides',
    labelKey: 'catPesticides',
    defaultLabel: 'Pesticides',
    emoji: '🪲',
    subcategories: [
      { id: 'insecticides', labelKey: 'subInsect', defaultLabel: 'Insecticides' },
      { id: 'fungicides', labelKey: 'subFung', defaultLabel: 'Fungicides' },
      { id: 'herbicides', labelKey: 'subHerb', defaultLabel: 'Herbicides' },
      { id: 'organic_pesticides', labelKey: 'subOrgPest', defaultLabel: 'Organic Pesticides' },
    ],
  },
  {
    id: 'plant_nutrition',
    labelKey: 'catPlantNutrition',
    defaultLabel: 'Plant Nutrition',
    emoji: '🌿',
    subcategories: [
      { id: 'growth_promoters', labelKey: 'subGrowthProm', defaultLabel: 'Growth Promoters' },
      { id: 'plant_tonics', labelKey: 'subTonics', defaultLabel: 'Plant Tonics' },
      { id: 'bio_stimulants', labelKey: 'subBioStim', defaultLabel: 'Bio Stimulants' },
    ],
  },
  {
    id: 'farming_equipment',
    labelKey: 'catFarmingEquipment',
    defaultLabel: 'Farming Equipment',
    emoji: '🚜',
    subcategories: [
      { id: 'sprayers', labelKey: 'subSprayers', defaultLabel: 'Sprayers' },
      { id: 'water_pumps', labelKey: 'subPumps', defaultLabel: 'Water Pumps' },
      { id: 'tools', labelKey: 'subTools', defaultLabel: 'Tools' },
      { id: 'gloves', labelKey: 'subGloves', defaultLabel: 'Gloves' },
      { id: 'harvesting_tools', labelKey: 'subHarvestTools', defaultLabel: 'Harvesting Tools' },
      { id: 'protective_equipment', labelKey: 'subProtEquip', defaultLabel: 'Protective Equipment' },
    ],
  },
  {
    id: 'irrigation',
    labelKey: 'catIrrigation',
    defaultLabel: 'Irrigation',
    emoji: '💧',
    subcategories: [
      { id: 'pipes', labelKey: 'subPipes', defaultLabel: 'Pipes' },
      { id: 'drip_kits', labelKey: 'subDripKits', defaultLabel: 'Drip Kits' },
      { id: 'sprinklers', labelKey: 'subSprinklers', defaultLabel: 'Sprinklers' },
      { id: 'connectors', labelKey: 'subConnectors', defaultLabel: 'Connectors' },
    ],
  },
  {
    id: 'organic',
    labelKey: 'catOrganic',
    defaultLabel: 'Organic Farming',
    emoji: '🌾',
    subcategories: [
      { id: 'organic_fertilizer', labelKey: 'subOrgFert', defaultLabel: 'Organic Fertilizer' },
      { id: 'bio_pesticides', labelKey: 'subBioPest', defaultLabel: 'Bio Pesticides' },
      { id: 'compost', labelKey: 'subCompost', defaultLabel: 'Compost' },
      { id: 'natural_growth_products', labelKey: 'subNatGrowth', defaultLabel: 'Natural Growth Products' },
    ],
  },
];
