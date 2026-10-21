import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BuyerInfo,
  CropCategory,
  CropFilters,
  CropListing,
  CropPurchaseRequest,
  CropSale,
} from '../types';
import { useFarmerStore } from '../store/farmerStore';

const STORAGE_KEY_LISTINGS = '@crop_listings_v2';
const STORAGE_KEY_REQUESTS = '@crop_requests_v2';
const STORAGE_KEY_SALES = '@crop_sales_v2';

function getActiveFarmerId(farmerId?: string): string {
  if (farmerId) return farmerId;
  const storeId = useFarmerStore.getState().accountId;
  return storeId || 'farmer-me';
}

const INITIAL_SEED_CROPS: CropListing[] = [
  {
    id: 'CROP-2026-001',
    farmerId: 'farmer-ramesh',
    farmerName: 'Ramesh Gowda',
    farmerMobile: '9845123456',
    cropName: 'Sugarcane',
    category: 'other',
    variety: 'CO-86032 High Sugar',
    totalQuantity: 150,
    availableQuantity: 120,
    unit: 'ton',
    pricePerUnit: 3200,
    minimumOrderQuantity: 10,
    allowNegotiation: true,
    quality: 'Grade A',
    farmingMethod: 'Conventional',
    harvestDate: '2026-10-25',
    location: {
      label: 'Pandavapura, Mandya',
      district: 'Mandya',
      state: 'Karnataka',
      latitude: 12.50,
      longitude: 76.67,
    },
    images: ['https://images.unsplash.com/photo-1596700854497-628d052d9a6c?w=600&auto=format&fit=crop&q=80'],
    description: 'Fresh mature sugarcane crop ready for cutting. High brix value sugar content. Factory or direct jaggery mill buyers welcome.',
    preferredBuyer: 'wholesaler',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    requestCount: 3,
  },
  {
    id: 'CROP-2026-002',
    farmerId: 'farmer-shivappa',
    farmerName: 'Shivappa Patil',
    farmerMobile: '9980112233',
    cropName: 'Red Onion',
    category: 'vegetables',
    variety: 'Nashik Red / Bellary',
    totalQuantity: 80,
    availableQuantity: 65,
    unit: 'quintal',
    pricePerUnit: 2450,
    minimumOrderQuantity: 5,
    allowNegotiation: true,
    quality: 'Grade A',
    farmingMethod: 'Conventional',
    harvestDate: '2026-10-18',
    location: {
      label: 'Hubballi Rural, Dharwad',
      district: 'Dharwad',
      state: 'Karnataka',
      latitude: 15.36,
      longitude: 75.12,
    },
    images: ['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80'],
    description: 'Dry, well-cured medium to large red onions. Zero rot, packed in 50kg mesh gunny bags. Suitable for long storage and mandi dispatch.',
    preferredBuyer: 'trader',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    requestCount: 5,
  },
  {
    id: 'CROP-2026-003',
    farmerId: 'farmer-basavaraj',
    farmerName: 'Basavaraj Reddy',
    farmerMobile: '9741556677',
    cropName: 'Tomato',
    category: 'vegetables',
    variety: 'Hybrid Sahu-399',
    totalQuantity: 200,
    availableQuantity: 140,
    unit: 'bag',
    pricePerUnit: 680,
    minimumOrderQuantity: 20,
    allowNegotiation: false,
    quality: 'Grade A',
    farmingMethod: 'Natural',
    harvestDate: '2026-10-15',
    location: {
      label: 'Malur Road, Kolar',
      district: 'Kolar',
      state: 'Karnataka',
      latitude: 13.13,
      longitude: 78.13,
    },
    images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80'],
    description: 'Firm, shiny red salad and curry grade tomatoes. Picked fresh daily in crates. Transport available up to Bengaluru APMC.',
    preferredBuyer: 'retailer',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    requestCount: 2,
  },
  {
    id: 'CROP-2026-004',
    farmerId: 'farmer-chennappa',
    farmerName: 'Chennappa Nayak',
    farmerMobile: '9448332211',
    cropName: 'Paddy / Rice',
    category: 'grains',
    variety: 'Sona Masoori BPT-5204',
    totalQuantity: 120,
    availableQuantity: 95,
    unit: 'quintal',
    pricePerUnit: 2850,
    minimumOrderQuantity: 15,
    allowNegotiation: true,
    quality: 'Grade A',
    farmingMethod: 'Conventional',
    harvestDate: '2026-11-05',
    location: {
      label: 'Sindhanur, Raichur',
      district: 'Raichur',
      state: 'Karnataka',
      latitude: 15.77,
      longitude: 76.76,
    },
    images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80'],
    description: 'TBP canal irrigated fine grain Sona Masoori paddy. Moisture tested under 14%, single harvest lot ready for rice mill delivery.',
    preferredBuyer: 'wholesaler',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    requestCount: 4,
  },
  {
    id: 'CROP-2026-005',
    farmerId: 'farmer-mallikarjun',
    farmerName: 'Mallikarjun Swamy',
    farmerMobile: '9611223344',
    cropName: 'Ragi (Finger Millet)',
    category: 'grains',
    variety: 'GPU-28 High Yield',
    totalQuantity: 60,
    availableQuantity: 50,
    unit: 'quintal',
    pricePerUnit: 3700,
    minimumOrderQuantity: 5,
    allowNegotiation: true,
    quality: 'Premium',
    farmingMethod: 'Organic',
    harvestDate: '2026-10-30',
    location: {
      label: 'Kunigal Taluk, Tumakuru',
      district: 'Tumakuru',
      state: 'Karnataka',
      latitude: 13.02,
      longitude: 77.03,
    },
    images: ['https://images.unsplash.com/photo-1627920769354-94577884ea23?w=600&auto=format&fit=crop&q=80'],
    description: 'Pure rainfed brown Ragi grain. Cleaned and stone-free, certified organic farm. Perfect for retail packing or flour processing.',
    preferredBuyer: 'any',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    requestCount: 1,
  },
];

class CropMarketplaceService {
  private listings: CropListing[] = [];
  private requests: CropPurchaseRequest[] = [];
  private sales: CropSale[] = [];
  private loaded = false;

  private async ensureLoaded() {
    if (this.loaded) return;
    try {
      const [storedListings, storedRequests, storedSales] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_LISTINGS),
        AsyncStorage.getItem(STORAGE_KEY_REQUESTS),
        AsyncStorage.getItem(STORAGE_KEY_SALES),
      ]);

      this.listings = storedListings ? JSON.parse(storedListings) : [];
      this.requests = storedRequests ? JSON.parse(storedRequests) : [];
      this.sales = storedSales ? JSON.parse(storedSales) : [];

      if (this.listings.length === 0) {
        this.listings = INITIAL_SEED_CROPS;
        await AsyncStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(this.listings));
      }
    } catch (e) {
      console.warn('Failed to load crop marketplace data from storage:', e);
      this.listings = INITIAL_SEED_CROPS;
      this.requests = [];
      this.sales = [];
    }
    this.loaded = true;
  }

  private async persistListings() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(this.listings));
    } catch (e) {
      console.warn('Failed to save crop listings:', e);
    }
  }

  private async persistRequests() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(this.requests));
    } catch (e) {
      console.warn('Failed to save crop requests:', e);
    }
  }

  private async persistSales() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_SALES, JSON.stringify(this.sales));
    } catch (e) {
      console.warn('Failed to save crop sales:', e);
    }
  }

  // ── Listings ──
  async getCropListings(filters?: Partial<CropFilters>): Promise<CropListing[]> {
    await this.ensureLoaded();
    let result = this.listings.filter((l) => l.status === 'active');

    if (filters) {
      if (filters.category && filters.category !== 'all') {
        result = result.filter((l) => l.category === filters.category);
      }
      if (filters.quality && filters.quality !== 'all') {
        result = result.filter((l) => l.quality === filters.quality);
      }
      if (filters.farmingMethod && filters.farmingMethod !== 'all') {
        result = result.filter((l) => l.farmingMethod === filters.farmingMethod);
      }
      if (filters.allowNegotiationOnly) {
        result = result.filter((l) => l.allowNegotiation);
      }
      if (filters.minPrice !== undefined) {
        result = result.filter((l) => l.pricePerUnit >= filters.minPrice!);
      }
      if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
        result = result.filter((l) => l.pricePerUnit <= filters.maxPrice!);
      }
      if (filters.minQuantity !== undefined) {
        result = result.filter((l) => l.availableQuantity >= filters.minQuantity!);
      }

      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'price_low_high':
            result.sort((a, b) => a.pricePerUnit - b.pricePerUnit);
            break;
          case 'price_high_low':
            result.sort((a, b) => b.pricePerUnit - a.pricePerUnit);
            break;
          case 'quantity':
            result.sort((a, b) => b.availableQuantity - a.availableQuantity);
            break;
          case 'newest':
          default:
            result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
        }
      }
    }

    return result;
  }

  async getCropListingById(id: string): Promise<CropListing | undefined> {
    await this.ensureLoaded();
    return this.listings.find((l) => l.id === id);
  }

  async searchCropListings(query: string): Promise<CropListing[]> {
    await this.ensureLoaded();
    const q = query.toLowerCase().trim();
    if (!q) return this.getCropListings();

    return this.listings.filter(
      (l) =>
        l.status === 'active' &&
        (l.cropName.toLowerCase().includes(q) ||
          l.variety.toLowerCase().includes(q) ||
          l.location.district.toLowerCase().includes(q) ||
          l.location.label.toLowerCase().includes(q) ||
          l.farmerName.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q)),
    );
  }

  async getMyListings(farmerId?: string): Promise<CropListing[]> {
    await this.ensureLoaded();
    const targetId = getActiveFarmerId(farmerId);
    return this.listings.filter((l) => (l.farmerId === targetId || l.farmerId === 'farmer-me') && l.status !== 'deleted');
  }

  async createCropListing(
    data: Omit<CropListing, 'id' | 'createdAt' | 'updatedAt' | 'availableQuantity' | 'requestCount'>,
  ): Promise<CropListing> {
    await this.ensureLoaded();
    const newListing: CropListing = {
      ...data,
      id: `CROP-${Date.now()}`,
      availableQuantity: data.totalQuantity,
      requestCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.listings.unshift(newListing);
    await this.persistListings();
    return newListing;
  }

  async updateCropListing(id: string, patch: Partial<CropListing>): Promise<CropListing> {
    await this.ensureLoaded();
    const idx = this.listings.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error('Listing not found');

    const updated = {
      ...this.listings[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    this.listings[idx] = updated;
    await this.persistListings();
    return updated;
  }

  async pauseCropListing(id: string): Promise<CropListing> {
    return this.updateCropListing(id, { status: 'paused' });
  }

  async resumeCropListing(id: string): Promise<CropListing> {
    return this.updateCropListing(id, { status: 'active' });
  }

  async deleteCropListing(id: string): Promise<void> {
    await this.ensureLoaded();
    const idx = this.listings.findIndex((l) => l.id === id);
    if (idx !== -1) {
      this.listings[idx].status = 'deleted';
      await this.persistListings();
    }
  }

  // ── Purchase Requests ──
  async getPurchaseRequestsForFarmer(farmerId?: string): Promise<CropPurchaseRequest[]> {
    await this.ensureLoaded();
    const targetId = getActiveFarmerId(farmerId);
    const myListingIds = new Set(
      this.listings.filter((l) => (l.farmerId === targetId || l.farmerId === 'farmer-me')).map((l) => l.id),
    );
    return this.requests.filter((r) => myListingIds.has(r.cropListingId));
  }

  async createPurchaseRequest(
    data: Omit<CropPurchaseRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>,
  ): Promise<CropPurchaseRequest> {
    await this.ensureLoaded();
    const newReq: CropPurchaseRequest = {
      ...data,
      id: `REQ-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.requests.unshift(newReq);

    // Update request count on listing
    const listing = this.listings.find((l) => l.id === data.cropListingId);
    if (listing) {
      listing.requestCount = (listing.requestCount || 0) + 1;
      await this.persistListings();
    }

    await this.persistRequests();
    return newReq;
  }

  async acceptPurchaseRequest(requestId: string): Promise<{ request: CropPurchaseRequest; sale: CropSale }> {
    await this.ensureLoaded();
    const req = this.requests.find((r) => r.id === requestId);
    if (!req) throw new Error('Request not found');

    const listing = this.listings.find((l) => l.id === req.cropListingId);
    if (!listing) throw new Error('Associated crop listing not found');

    if (req.requestedQuantity > listing.availableQuantity) {
      throw new Error(`Only ${listing.availableQuantity} ${listing.unit} is available.`);
    }

    // Update Request status
    req.status = 'accepted';
    req.updatedAt = new Date().toISOString();

    // Deduct available quantity
    listing.availableQuantity -= req.requestedQuantity;
    if (listing.availableQuantity <= 0) {
      listing.availableQuantity = 0;
      listing.status = 'sold';
    }
    listing.updatedAt = new Date().toISOString();

    // Create Sale record
    const sale: CropSale = {
      id: `SALE-${Date.now()}`,
      requestId: req.id,
      cropListingId: listing.id,
      cropName: listing.cropName,
      buyer: req.buyer,
      quantity: req.requestedQuantity,
      unit: req.unit,
      agreedPrice: req.offerPrice,
      totalAmount: req.requestedQuantity * req.offerPrice,
      pickupDate: req.pickupDate,
      status: 'accepted',
      createdAt: new Date().toISOString(),
    };
    this.sales.unshift(sale);

    await Promise.all([
      this.persistListings(),
      this.persistRequests(),
      this.persistSales(),
    ]);

    return { request: req, sale };
  }

  async rejectPurchaseRequest(requestId: string): Promise<CropPurchaseRequest> {
    await this.ensureLoaded();
    const req = this.requests.find((r) => r.id === requestId);
    if (!req) throw new Error('Request not found');

    req.status = 'rejected';
    req.updatedAt = new Date().toISOString();
    await this.persistRequests();
    return req;
  }

  // ── Sales ──
  async getCropSales(): Promise<CropSale[]> {
    await this.ensureLoaded();
    return this.sales;
  }
}

export const cropMarketplaceService = new CropMarketplaceService();
