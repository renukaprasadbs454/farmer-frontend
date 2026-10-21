import { MOCK_PRODUCTS } from './mockProductData';
import { ProductFilters, Product } from '../types';
import { fetchLiveProductsApi } from './api';

class ProductService {
  private mockProducts: Product[] = [...MOCK_PRODUCTS];

  async getProducts(filters?: Partial<ProductFilters>): Promise<Product[]> {
    let result: Product[] = [];
    try {
      const categorySlug =
        filters?.categories && filters.categories.length > 0
          ? filters.categories.join(',')
          : filters?.category && filters.category !== 'all'
            ? filters.category
            : undefined;

      const liveRes = await fetchLiveProductsApi({
        categorySlug,
        search: filters?.search,
        sortBy: filters?.sortBy,
      });

      if (liveRes.success && Array.isArray(liveRes.data) && liveRes.data.length > 0) {
        const liveMapped: Product[] = liveRes.data.map((p: any) => {
          const discountPercent = Number(p.discountPercent || 0);
          const mrp = p.mrp || (discountPercent > 0 ? Math.round(p.price / (1 - discountPercent / 100)) : Math.round(p.price * 1.15));
          const packSize = p.packageSize || `${p.quantityValue || 1} ${p.quantityUnit || p.unit || 'unit'}`;

          return {
            id: p.id,
            name: p.title,
            brand: p.sellerProfile?.shopName || 'Farmer Mate Certified',
            category: (p.category?.slug as any) || 'seeds',
            subcategory: 'general',
            description: p.description,
            suitableCrops: ['All Crops'],
            images: [p.imageUrl || '🌾'],
            variants: [
              {
                id: `${p.id}-var`,
                packSize,
                price: p.price,
                mrp,
                stockStatus: p.stock > 0 ? 'in_stock' : 'out_of_stock',
                stockCount: p.stock,
              },
            ],
            rating: 4.8,
            reviewCount: 18,
            reviews: [],
            seller: {
              id: p.sellerProfileId,
              name: p.sellerProfile?.shopName || 'Agri Shop',
              rating: 4.8,
              location: p.sellerProfile?.shopAddress || p.region?.name || 'Regional Hub',
              verified: true,
            },
            deliveryDays: p.sellerProfile?.deliveryRadiusKm ? `Within ${p.sellerProfile.deliveryRadiusKm} km` : '2-3 days',
            isOrganic: false,
            benefits: [
              p.qualityGrade ? `Quality: ${p.qualityGrade}` : '',
              discountPercent > 0 ? `${discountPercent}% seller discount` : '',
              p.storageInstructions ? `Storage: ${p.storageInstructions}` : '',
            ].filter(Boolean),
            featured: true,
            bestSeller: true,
          };
        });
        result = liveMapped;
      } else {
        result = [...this.mockProducts];
      }
    } catch {
      result = [...this.mockProducts];
    }

    if (filters?.categories && filters.categories.length > 0) {
      result = result.filter((p) => filters.categories!.includes(p.category));
    } else if (filters?.category && filters.category !== 'all') {
      result = result.filter((p) => p.category === filters.category);
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter((p) => {
        const inName = p.name.toLowerCase().includes(q);
        const inBrand = p.brand.toLowerCase().includes(q);
        const inDesc = p.description.toLowerCase().includes(q);
        const inCategory = p.category.toLowerCase().includes(q);
        const inSubcategory = p.subcategory.toLowerCase().includes(q);
        const inCrops = p.suitableCrops && p.suitableCrops.some((c) => c.toLowerCase().includes(q));
        return inName || inBrand || inDesc || inCategory || inSubcategory || inCrops;
      });
    }

    if (filters?.sortBy) {
      if (filters.sortBy === 'price_low_high') {
        result.sort((a, b) => (a.variants[0]?.price || 0) - (b.variants[0]?.price || 0));
      } else if (filters.sortBy === 'price_high_low') {
        result.sort((a, b) => (b.variants[0]?.price || 0) - (a.variants[0]?.price || 0));
      } else if (filters.sortBy === 'rating') {
        result.sort((a, b) => b.rating - a.rating);
      } else if (filters.sortBy === 'relevance' || filters.sortBy === 'newest') {
        result.sort((a, b) => (b.featured || b.bestSeller ? 1 : 0) - (a.featured || a.bestSeller ? 1 : 0));
      }
    }

    return result;
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const products = await this.getProducts();
    return products.find((p) => p.id === id) || this.mockProducts.find((p) => p.id === id);
  }

  async searchProducts(query: string, categories?: string[]): Promise<Product[]> {
    return this.getProducts({
      search: query,
      categories: categories as any,
    });
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const products = await this.getProducts();
    return products.filter((p) => p.featured || p.bestSeller);
  }

  async getRecommendedProducts(farmerCrops: string[]): Promise<Product[]> {
    const products = await this.getProducts();
    return products.slice(0, 5);
  }
}

export const productService = new ProductService();
