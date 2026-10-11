import { MOCK_BUYERS, MOCK_CROP_LISTINGS, MOCK_CROP_REQUESTS, MOCK_CROP_SALES } from './mockCropData';
import {
  BuyerInfo,
  CropCategory,
  CropFilters,
  CropListing,
  CropPurchaseRequest,
  CropSale,
} from '../types';

import { useFarmerStore } from '../store/farmerStore';

function getActiveFarmerId(farmerId?: string): string {
  if (farmerId && farmerId !== 'farmer-current') return farmerId;
  const storeId = useFarmerStore.getState().accountId;
  return storeId || 'farmer-me';
}

class CropMarketplaceService {
  private listings: CropListing[] = [...MOCK_CROP_LISTINGS];
  private requests: CropPurchaseRequest[] = [...MOCK_CROP_REQUESTS];
  private sales: CropSale[] = [...MOCK_CROP_SALES];

  // ── Listings ──
  async getCropListings(filters?: Partial<CropFilters>): Promise<CropListing[]> {
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
    return this.listings.find((l) => l.id === id);
  }

  async searchCropListings(query: string): Promise<CropListing[]> {
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
    const targetId = getActiveFarmerId(farmerId);
    return this.listings.filter((l) => (l.farmerId === targetId || l.farmerId === 'farmer-current' || l.farmerId === 'farmer-me') && l.status !== 'deleted');
  }

  async createCropListing(
    data: Omit<CropListing, 'id' | 'createdAt' | 'updatedAt' | 'availableQuantity' | 'requestCount'>,
  ): Promise<CropListing> {
    const newListing: CropListing = {
      ...data,
      id: `CROP-${Date.now()}`,
      availableQuantity: data.totalQuantity,
      requestCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.listings.unshift(newListing);
    return newListing;
  }

  async updateCropListing(id: string, patch: Partial<CropListing>): Promise<CropListing> {
    const idx = this.listings.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error('Listing not found');

    const updated = {
      ...this.listings[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    this.listings[idx] = updated;
    return updated;
  }

  async pauseCropListing(id: string): Promise<CropListing> {
    return this.updateCropListing(id, { status: 'paused' });
  }

  async resumeCropListing(id: string): Promise<CropListing> {
    return this.updateCropListing(id, { status: 'active' });
  }

  async deleteCropListing(id: string): Promise<void> {
    const idx = this.listings.findIndex((l) => l.id === id);
    if (idx !== -1) {
      this.listings[idx].status = 'deleted';
    }
  }

  // ── Purchase Requests ──
  async getPurchaseRequestsForFarmer(farmerId?: string): Promise<CropPurchaseRequest[]> {
    const targetId = getActiveFarmerId(farmerId);
    const myListingIds = new Set(
      this.listings.filter((l) => l.farmerId === targetId || l.farmerId === 'farmer-current' || l.farmerId === 'farmer-me').map((l) => l.id),
    );
    return this.requests.filter((r) => myListingIds.has(r.cropListingId));
  }

  async createPurchaseRequest(
    data: Omit<CropPurchaseRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>,
  ): Promise<CropPurchaseRequest> {
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
    }

    return newReq;
  }

  async acceptPurchaseRequest(requestId: string): Promise<{ request: CropPurchaseRequest; sale: CropSale }> {
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

    return { request: req, sale };
  }

  async rejectPurchaseRequest(requestId: string): Promise<CropPurchaseRequest> {
    const req = this.requests.find((r) => r.id === requestId);
    if (!req) throw new Error('Request not found');

    req.status = 'rejected';
    req.updatedAt = new Date().toISOString();
    return req;
  }

  // ── Sales ──
  async getCropSales(): Promise<CropSale[]> {
    return this.sales;
  }
}

export const cropMarketplaceService = new CropMarketplaceService();
