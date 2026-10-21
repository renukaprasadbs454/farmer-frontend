import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProductCard } from '../../src/components/ProductCard';
import { colors, font, radius, shadow, spacing } from '../../src/constants/theme';
import { productService } from '../../src/services/productService';
import { useCartStore } from '../../src/store/cartStore';
import { useWishlistStore } from '../../src/store/wishlistStore';
import { Product } from '../../src/types';

export default function WishlistScreen() {
  const router = useRouter();
  const { wishlistIds, toggleWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService.getProducts().then((data) => {
      setAllProducts(data);
      setLoading(false);
    });
  }, []);

  const wishlistedProducts = allProducts.filter((p) => wishlistIds.includes(p.id));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top Navigation Bar */}
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => (router.canGoBack() ? router.back() : router.push('/(tabs)/market'))}
        >
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Saved Wishlist</Text>
          <Text style={styles.headerSub}>
            {wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'item' : 'items'} saved
          </Text>
        </View>
        <Pressable
          style={styles.cartIconBtn}
          onPress={() => router.push('/market/cart' as any)}
        >
          <Text style={{ fontSize: 18 }}>🛒</Text>
        </Pressable>
      </View>

      {/* Main Content */}
      {wishlistedProducts.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIconCircle}>
            <Text style={{ fontSize: 42 }}>❤️</Text>
          </View>
          <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
          <Text style={styles.emptyText}>
            Save seeds, fertilizers, and tools you want to buy later by tapping the heart icon.
          </Text>
          <Pressable
            style={styles.exploreBtn}
            onPress={() => router.push('/(tabs)/market')}
          >
            <Text style={styles.exploreBtnText}>Browse Agricultural Market →</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={wishlistedProducts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={({ item }) => (
            <View style={styles.cardWrap}>
              <ProductCard
                product={item}
                onPress={() => router.push({ pathname: '/market/product/[id]', params: { id: item.id } } as any)}
                onWishlistToggle={() => toggleWishlist(item.id)}
                isWishlisted={true}
              />
              <Pressable
                style={styles.moveToCartBtn}
                onPress={() => {
                  const variant = item.variants[0];
                  if (variant) {
                    addItem(item, variant, 1);
                  }
                }}
              >
                <Text style={styles.moveToCartText}>+ Add to Cart</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
  backText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111E15',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111E15',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12,
    color: '#66776C',
    fontWeight: '600',
  },
  cartIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F6F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  cardWrap: {
    flex: 1,
    maxWidth: '48.5%',
  },
  moveToCartBtn: {
    backgroundColor: '#0F613B',
    borderRadius: radius.md,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...shadow.card,
  },
  moveToCartText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FBEBEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111E15',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#66776C',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  exploreBtn: {
    backgroundColor: '#0F613B',
    borderRadius: radius.full,
    paddingHorizontal: 24,
    paddingVertical: 14,
    ...shadow.card,
  },
  exploreBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
