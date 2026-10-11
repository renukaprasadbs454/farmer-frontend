import { MOCK_PRODUCTS } from './mockProductData';
import { ProductFilters, Product } from '../types';
import { fetchLiveProductsApi } from './api';

class ProductService {
  private mockProducts: Product[] = [...MOCK_PRODUCTS];

  async getProducts(filters?: Partial<ProductFilters>): Promise<Product[]> {
    try {
      const liveRes = await fetchLiveProductsApi();
      if (liveRes.success && Array.isArray(liveRes.data) && liveRes.data.length > 0) {
        // Map backend products into mobile app format
        const liveMapped: Product[] = liveRes.data.map((p: any) => ({
          id: p.id,
          name: p.title,
          brand: p.sellerProfile?.shopName || 'Farmer Mate Certified',
          category: (p.category?.slug as any) || 'seeds',
          subcategory: 'general',
          description: p.description,
          suitableCrops: ['All Crops'],
          images: [p.imageUrl],
          variants: [
            {
              id: `${p.id}-var`,
              size: `1 ${p.unit}`,
              price: p.price,
              stock: p.stock,
              unit: p.unit,
            },
          ],
          rating: 4.8,
          reviewCount: 12,
          sellerId: p.sellerProfileId,
          sellerName: p.sellerProfile?.shopName || 'Agri Shop',
          isOrganic: false,
          inStock: p.stock > 0,
          bestSeller: true,
          featured: true,
          shippingDays: 1,
        }));
        return liveMapped;
      }
    } catch (e) {
      console.warn('Falling back to local product data:', e);
    }

    // Local fallback
    let result = [...this.mockProducts];
    if (filters && filters.category && filters.category !== 'all') {
      result = result.filter((p) => p.category === filters.category);
    }
    return result;
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const products = await this.getProducts();
    return products.find((p) => p.id === id) || this.mockProducts.find((p) => p.id === id);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const products = await this.getProducts();
    const q = query.toLowerCase().trim();
    if (!q) return products;

    return products.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
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
