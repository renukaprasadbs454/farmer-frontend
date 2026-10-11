export type Lang = 'en' | 'hi' | 'kn';
export type Gender = 'male' | 'female' | 'other';
export type LandUnit = 'acres' | 'guntas' | 'hectares';
export type WaterSource = 'borewell' | 'canal' | 'river' | 'rainfed' | 'tank' | 'drip' | 'sprinkler' | 'well';
export type SoilType = 'red' | 'black' | 'alluvial' | 'laterite' | 'sandy' | 'loamy' | 'clay' | 'mixed';
export type FarmingVehicle = 'tractor' | 'power_tiller' | 'bullock_cart' | 'mini_tractor' | 'harvester' | 'sprayer_vehicle' | 'truck' | 'bike';

export interface AnimalCount {
  type: string;
  count: number;
}

export interface Location {
  label: string;
  district: string;
  state: string;
  latitude?: number;
  longitude?: number;
}
export interface Farmer {
  name: string;
  mobile: string;
  email?: string;
  age?: number;
  gender?: Gender;
  address: string;
  photoUri?: string;
  gpsLat?: number;
  gpsLng?: number;
  gpsLabel?: string;
}
export interface Farm {
  village: string;
  hobli: string;
  taluk: string;
  district: string;
  state: string;
  pincode: string;
  totalLand: number;
  cultivatedLand: number;
  landUnit: LandUnit;
  location?: Location;
  // Water
  waterSources: WaterSource[];
  hasBorewell: boolean;
  borewellDepthFeet?: number;
  // Animals
  animals: AnimalCount[];
  // Vehicles
  vehicles: FarmingVehicle[];
  // Soil
  soilType?: SoilType;
  soilPH?: string;
  hasSoilTest: boolean;
}
export interface FarmerProfile {
  farmer: Farmer;
  farm: Farm;
  crops: string[];
}

// ────────── Phase 2: Services & Bookings ──────────

export type LabourCategory =
  | 'all'
  | 'harvesting'
  | 'planting'
  | 'irrigation'
  | 'spraying'
  | 'weeding'
  | 'loading'
  | 'general'
  | 'other';

export type MachineryCategory =
  | 'all'
  | 'tractor'
  | 'jcb'
  | 'rotavator'
  | 'harvester'
  | 'sprayer'
  | 'cultivator'
  | 'water_tanker'
  | 'transport'
  | 'other';

export type PricingType = 'hourly' | 'daily' | 'per_acre' | 'per_trip';

export type BookingStatus =
  | 'requested'
  | 'accepted'
  | 'rejected'
  | 'cancelled'
  | 'completed';

export type ServiceType = 'labour' | 'machinery';

export type AvailabilityStatus = 'available_today' | 'available_tomorrow' | 'unavailable';

export interface Labourer {
  id: string;
  name: string;
  photoUri?: string;
  primarySkill: LabourCategory;
  secondarySkills: LabourCategory[];
  rating: number;
  completedJobs: number;
  experience: number; // years
  location: Location;
  distance: number; // km from farmer
  hourlyRate: number; // INR
  dailyRate: number; // INR
  availability: AvailabilityStatus;
  about: string;
  reviews: Review[];
  saved?: boolean;
}

export interface Machinery {
  id: string;
  name: string;
  type: MachineryCategory;
  imageUri?: string;
  provider: string;
  rating: number;
  reviewCount: number;
  location: Location;
  distance: number; // km
  hourlyRate: number;
  dailyRate: number;
  perAcreRate?: number;
  operatorIncluded: boolean;
  availability: AvailabilityStatus;
  specifications: string[];
  minimumBookingHours: number;
  description: string;
  reviews: Review[];
  saved?: boolean;
}

export interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string; // ISO date string
}

export interface ServiceBooking {
  id: string;
  type: ServiceType;
  // Labour-specific
  labourerId?: string;
  labourerName?: string;
  workType?: string;
  numberOfWorkers?: number;
  // Machinery-specific
  machineryId?: string;
  machineryName?: string;
  serviceDescription?: string;
  areaOfWork?: number; // acres
  // Common
  date: string; // ISO date
  startTime: string; // HH:mm
  duration: number; // hours
  pricingType: PricingType;
  unitRate: number;
  estimatedTotal: number;
  farmLocation: string;
  additionalInstructions: string;
  status: BookingStatus;
  createdAt: string; // ISO datetime
  providerDistance?: number;
}

export interface LabourFilters {
  category: LabourCategory;
  maxDistance: number;
  pricingType: PricingType | 'any';
  minPrice: number;
  maxPrice: number;
  minRating: number;
  availability: AvailabilityStatus | 'any';
}

export interface MachineryFilters {
  category: MachineryCategory;
  maxDistance: number;
  pricingType: PricingType | 'any';
  minPrice: number;
  maxPrice: number;
  minRating: number;
  operatorIncluded: boolean | null; // null = any
  availability: AvailabilityStatus | 'any';
}

// ────────── Phase 3: Agricultural Products Marketplace ──────────

export type ProductCategory =
  | 'all'
  | 'seeds'
  | 'fertilizers'
  | 'pesticides'
  | 'plant_nutrition'
  | 'farming_equipment'
  | 'irrigation'
  | 'organic';

export type ProductSubcategory =
  // Seeds
  | 'vegetable_seeds'
  | 'paddy_seeds'
  | 'maize_seeds'
  | 'wheat_seeds'
  | 'onion_seeds'
  | 'tomato_seeds'
  | 'chilli_seeds'
  | 'fruit_plants'
  | 'vegetable_plants'
  // Fertilizers
  | 'urea'
  | 'dap'
  | 'npk'
  | 'potash'
  | 'organic_fertilizer'
  | 'vermicompost'
  | 'bio_fertilizer'
  | 'micronutrients'
  // Pesticides
  | 'insecticides'
  | 'fungicides'
  | 'herbicides'
  | 'organic_pesticides'
  // Plant Nutrition
  | 'growth_promoters'
  | 'plant_tonics'
  | 'bio_stimulants'
  // Farming Equipment
  | 'sprayers'
  | 'water_pumps'
  | 'tools'
  | 'gloves'
  | 'harvesting_tools'
  | 'protective_equipment'
  // Irrigation
  | 'pipes'
  | 'drip_kits'
  | 'sprinklers'
  | 'connectors'
  // Organic
  | 'bio_pesticides'
  | 'compost'
  | 'natural_growth_products'
  | 'other';

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface ProductVariant {
  id: string;
  packSize: string; // e.g. "500 g", "5 kg", "50 kg"
  price: number; // INR
  mrp: number; // INR
  stockStatus: StockStatus;
  stockCount: number;
}

export interface ProductSeller {
  id: string;
  name: string;
  rating: number;
  location: string;
  verified: boolean;
}

export interface ProductReview {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  subcategory: ProductSubcategory;
  images: string[];
  description: string;
  benefits: string[];
  howToUse: string[];
  suitableCrops: string[];
  specifications: Record<string, string>;
  variants: ProductVariant[];
  selectedVariantId?: string;
  rating: number;
  reviewCount: number;
  reviews: ProductReview[];
  seller: ProductSeller;
  deliveryDays: string; // e.g. "3–5 days"
  isOrganic?: boolean;
  featured?: boolean;
  bestSeller?: boolean;
}

export interface ProductFilters {
  category: ProductCategory;
  subcategory: ProductSubcategory | 'all';
  brand: string | 'all';
  minPrice: number;
  maxPrice: number;
  minRating: number;
  organicOnly: boolean;
  inStockOnly: boolean;
  sortBy: 'relevance' | 'price_low_high' | 'price_high_low' | 'rating' | 'newest';
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export type PaymentMethod = 'cod' | 'online' | 'upi';

export type ProductOrderStatus =
  | 'placed'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface ProductOrderItem {
  productId: string;
  productName: string;
  brand: string;
  image: string;
  packSize: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface ProductOrder {
  id: string; // e.g. FM-20260928-001
  orderDate: string; // ISO string
  items: ProductOrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: {
    name: string;
    mobile: string;
    village: string;
    taluk: string;
    district: string;
    state: string;
    pincode: string;
  };
  paymentMethod: PaymentMethod;
  status: ProductOrderStatus;
  estimatedDelivery: string;
  statusTimeline: {
    status: ProductOrderStatus;
    label: string;
    date?: string;
    completed: boolean;
    current?: boolean;
  }[];
}

// ────────── Phase 4: Farmer Crop Selling Marketplace ──────────

export type CropCategory =
  | 'all'
  | 'vegetables'
  | 'fruits'
  | 'grains'
  | 'pulses'
  | 'spices'
  | 'oilseeds'
  | 'other';

export type CropUnit = 'kg' | 'quintal' | 'ton' | 'bag' | 'litre' | 'piece';

export type CropQuality = 'Grade A' | 'Grade B' | 'Premium' | 'Standard';

export type CropFarmingMethod = 'Conventional' | 'Organic' | 'Natural';

export type CropListingStatus = 'draft' | 'active' | 'paused' | 'sold' | 'deleted';

export type CropRequestStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'cancelled'
  | 'completed';

export type PreferredBuyerType = 'trader' | 'retailer' | 'wholesaler' | 'exporter' | 'any';

export interface CropListing {
  id: string; // e.g. CROP-20260928-001
  farmerId: string;
  farmerName: string;
  farmerMobile?: string;
  cropName: string;
  category: CropCategory;
  variety: string;
  totalQuantity: number;
  availableQuantity: number;
  unit: CropUnit;
  pricePerUnit: number; // INR
  minimumOrderQuantity: number;
  allowNegotiation: boolean;
  quality: CropQuality;
  farmingMethod: CropFarmingMethod;
  harvestDate: string; // YYYY-MM-DD
  location: Location;
  images: string[];
  description: string;
  preferredBuyer: PreferredBuyerType;
  status: CropListingStatus;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
  requestCount?: number;
}

export interface BuyerInfo {
  id: string;
  name: string;
  type: string; // e.g. "Wholesaler", "Trader"
  location: string;
  rating: number;
  verified: boolean;
}

export interface CropPurchaseRequest {
  id: string;
  cropListingId: string;
  cropName: string;
  buyer: BuyerInfo;
  requestedQuantity: number;
  unit: CropUnit;
  offerPrice: number; // INR per unit
  totalEstimatedAmount: number;
  message: string;
  pickupDate: string;
  deliveryRequired: boolean;
  status: CropRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CropSale {
  id: string;
  requestId: string;
  cropListingId: string;
  cropName: string;
  buyer: BuyerInfo;
  quantity: number;
  unit: CropUnit;
  agreedPrice: number;
  totalAmount: number;
  pickupDate: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface CropFilters {
  category: CropCategory;
  minPrice: number;
  maxPrice: number;
  minQuantity: number;
  quality: CropQuality | 'all';
  farmingMethod: CropFarmingMethod | 'all';
  allowNegotiationOnly: boolean;
  sortBy: 'newest' | 'price_low_high' | 'price_high_low' | 'quantity';
}

// ────────── Phase 5: Notifications, Trust, Location & Polish ──────────

export type NotificationType =
  | 'labour_booking_accepted'
  | 'labour_booking_rejected'
  | 'machinery_booking_accepted'
  | 'machinery_booking_rejected'
  | 'product_order_confirmed'
  | 'product_order_shipped'
  | 'product_order_delivered'
  | 'crop_request_received'
  | 'crop_request_accepted'
  | 'crop_request_rejected'
  | 'crop_sale_completed'
  | 'listing_paused'
  | 'listing_sold'
  | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string; // ISO datetime
  read: boolean;
  relatedEntityId?: string;
  targetRoute?: string;
}

export type EntityType = 'labour' | 'machinery' | 'product' | 'crop_seller';

export interface EntityReview {
  id: string;
  entityType: EntityType;
  entityId: string;
  reviewerId: string;
  reviewerName: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string; // YYYY-MM-DD
  verified: boolean;
}

export interface SupportTicket {
  id: string;
  category: 'Order' | 'Labour' | 'Machinery' | 'Product' | 'Crop Sale' | 'Account' | 'Other';
  description: string;
  createdAt: string;
  status: 'open' | 'resolved';
}

export interface NotificationSettings {
  bookingUpdates: boolean;
  orderUpdates: boolean;
  buyerRequests: boolean;
  cropSales: boolean;
  marketplaceUpdates: boolean;
  promotional: boolean;
}



