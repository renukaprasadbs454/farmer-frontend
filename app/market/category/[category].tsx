import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProductCard } from '../../../src/components/ProductCard';
import { colors, radius, shadow, spacing } from '../../../src/constants/theme';
import { productService } from '../../../src/services/productService';
import { useCartStore } from '../../../src/store/cartStore';
import { useWishlistStore } from '../../../src/store/wishlistStore';
import { Product, ProductCategory } from '../../../src/types';

export default function CategoryScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { wishlistIds, toggleWishlist } = useWishlistStore();
  const { addItem, getItemCount } = useCartStore();

  useEffect(() => {
    productService.getProducts().then((all) => {
      if (category && category !== 'all') {
        setProducts(all.filter((p) => p.category === category));
      } else {
        setProducts(all);
      }
      setLoading(false);
    });
  }, [category]);

  const categoryTitle =
    category === 'seeds'
      ? '🌱 Certified Seeds'
      : category === 'fertilizers'
      ? '🧪 Fertilizers & Nutrients'
      : category === 'pesticides'
      ? '🛡️ Crop Protection & Pesticides'
      : category === 'equipment' || category === 'farming_equipment'
      ? '⚙️ Farming Equipment & Tools'
      : category === 'irrigation'
      ? '💧 Irrigation & Pipes'
      : '🌾 Agricultural Products';

  const cartCount = getItemCount();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => (router.canGoBack() ? router.back() : router.push('/(tabs)/market'))}
        >
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{categoryTitle}</Text>
          <Text style={styles.headerSub}>{products.length} certified products available</Text>
        </View>
        <Pressable
          style={styles.cartIconBtn}
          onPress={() => router.push('/market/cart' as any)}
        >
          <Text style={{ fontSize: 18 }}>🛒</Text>
          {cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <ProductCard
              product={item}
              onPress={() => router.push({ pathname: '/market/product/[id]', params: { id: item.id } } as any)}
              onWishlistToggle={() => toggleWishlist(item.id)}
              isWishlisted={wishlistIds.includes(item.id)}
            />
            <Pressable
              style={styles.addToCartBtn}
              onPress={() => {
                const variant = item.variants[0];
                if (variant) addItem(item, variant, 1);
              }}
            >
              <Text style={styles.addToCartText}>+ Add to Cart</Text>
            </Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F9F6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2EBE5',
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F6F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { fontSize: 22, fontWeight: '700', color: '#111E15' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#111E15' },
  headerSub: { fontSize: 11, color: '#66776C', fontWeight: '500' },
  cartIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F6F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#0F613B',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF' },
  listContent: { padding: 16, paddingBottom: 40 },
  columnWrapper: { justifyContent: 'space-between', marginBottom: 16, gap: 12 },
  cardWrap: { flex: 1, maxWidth: '48.5%' },
  addToCartBtn: {
    backgroundColor: '#0F613B',
    borderRadius: radius.md,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...shadow.card,
  },
  addToCartText: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
});
