import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, radius, shadow, spacing } from '../../../src/constants/theme';
import { productService } from '../../../src/services/productService';
import { useCartStore } from '../../../src/store/cartStore';
import { useWishlistStore } from '../../../src/store/wishlistStore';
import { Product, ProductVariant } from '../../../src/types';

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [addedNotice, setAddedNotice] = useState(false);

  const { wishlistIds, toggleWishlist } = useWishlistStore();
  const { addItem, getItemCount } = useCartStore();

  useEffect(() => {
    if (id) {
      productService.getProductById(id).then((p) => {
        if (p) {
          setProduct(p);
          setSelectedVariant(p.variants[0] || null);
        }
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0F613B" />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={{ fontSize: 44, marginBottom: 12 }}>🔍</Text>
        <Text style={{ fontSize: 18, fontWeight: '800', color: '#111E15' }}>
          Product Not Found
        </Text>
        <Pressable
          style={styles.backHomeBtn}
          onPress={() => router.push('/(tabs)/market')}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>← Return to Market</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const isWishlisted = wishlistIds.includes(product.id);
  const cartCount = getItemCount();

  const handleAddToCart = () => {
    if (selectedVariant) {
      addItem(product, selectedVariant, 1);
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 2500);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.iconCircle}
          onPress={() => (router.canGoBack() ? router.back() : router.push('/(tabs)/market'))}
        >
          <Text style={styles.backArrow}>←</Text>
        </Pressable>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.name}
        </Text>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            style={styles.iconCircle}
            onPress={() => toggleWishlist(product.id)}
          >
            <Text style={{ fontSize: 18 }}>{isWishlisted ? '❤️' : '🤍'}</Text>
          </Pressable>
          <Pressable
            style={styles.iconCircle}
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
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Product Hero Image / Banner */}
        <View style={styles.imageBox}>
          <Text style={{ fontSize: 88 }}>{product.images[0] || '🌾'}</Text>
          <View style={styles.brandChip}>
            <Text style={styles.brandChipText}>{product.brand}</Text>
          </View>
        </View>

        {/* Product Meta */}
        <View style={styles.metaSection}>
          <View style={styles.ratingBadge}>
            <Text style={styles.starText}>★ {product.rating}</Text>
            <Text style={styles.reviewCount}>({product.reviewCount} farmer reviews)</Text>
          </View>

          <Text style={styles.productTitle}>{product.name}</Text>

          {/* Pricing */}
          <View style={styles.priceRow}>
            <Text style={styles.priceCurrent}>
              ₹{(selectedVariant?.price || 0).toLocaleString('en-IN')}
            </Text>
            {selectedVariant?.mrp && selectedVariant.mrp > selectedVariant.price && (
              <>
                <Text style={styles.priceMrp}>
                  ₹{selectedVariant.mrp.toLocaleString('en-IN')}
                </Text>
                <View style={styles.discountTag}>
                  <Text style={styles.discountText}>
                    {Math.round(((selectedVariant.mrp - selectedVariant.price) / selectedVariant.mrp) * 100)}% OFF
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Pack Size Variants */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Select Pack Size:</Text>
          <View style={styles.variantsRow}>
            {product.variants.map((v) => {
              const active = selectedVariant?.id === v.id;
              return (
                <Pressable
                  key={v.id}
                  style={[styles.variantChip, active && styles.variantChipActive]}
                  onPress={() => setSelectedVariant(v)}
                >
                  <Text style={[styles.variantChipText, active && styles.variantChipTextActive]}>
                    {v.packSize}
                  </Text>
                  <Text style={[styles.variantPrice, active && styles.variantPriceActive]}>
                    ₹{v.price}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Description */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Product Overview</Text>
          <Text style={styles.descText}>{product.description}</Text>
        </View>

        {/* Suitable Crops */}
        {product.suitableCrops && product.suitableCrops.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>Suitable for Crops</Text>
            <View style={styles.chipsRow}>
              {product.suitableCrops.map((c, i) => (
                <View key={i} style={styles.cropTag}>
                  <Text style={styles.cropTagText}>🌱 {c}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Benefits */}
        {product.benefits && product.benefits.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>Key Farming Benefits</Text>
            {product.benefits.map((b, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bulletIcon}>✓</Text>
                <Text style={styles.bulletText}>{b}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Seller Info */}
        {product.seller && (
          <View style={styles.sellerCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sellerLabel}>Certified Supplier</Text>
              <Text style={styles.sellerName}>{product.seller.name}</Text>
              <Text style={styles.sellerLoc}>📍 {product.seller.location}</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>Verified ✓</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomPriceLabel}>Selected Pack Price:</Text>
          <Text style={styles.bottomPriceVal}>₹{selectedVariant?.price.toLocaleString('en-IN')}</Text>
        </View>
        <Pressable style={styles.addCartBtn} onPress={handleAddToCart}>
          <Text style={styles.addCartBtnText}>
            {addedNotice ? '✓ Added to Cart!' : '+ Add to Cart'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9F6',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F5F9F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2EBE5',
    gap: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#111E15',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F6F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111E15',
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
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  imageBox: {
    height: 220,
    backgroundColor: '#EAF3ED',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D4E8DC',
    position: 'relative',
    marginBottom: 16,
  },
  brandChip: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#D4E8DC',
  },
  brandChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F613B',
    textTransform: 'uppercase',
  },
  metaSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2EBE5',
    marginBottom: 14,
    ...shadow.card,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  starText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F9A826',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  reviewCount: {
    fontSize: 12,
    color: '#66776C',
    fontWeight: '600',
  },
  productTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111E15',
    lineHeight: 26,
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  priceCurrent: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F613B',
  },
  priceMrp: {
    fontSize: 15,
    color: '#94A399',
    textDecorationLine: 'line-through',
  },
  discountTag: {
    backgroundColor: '#EAF5EC',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F613B',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2EBE5',
    marginBottom: 12,
    ...shadow.card,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111E15',
    marginBottom: 10,
  },
  variantsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  variantChip: {
    backgroundColor: '#F5F9F6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#D4E2D8',
    minWidth: 110,
  },
  variantChipActive: {
    backgroundColor: '#0F613B',
    borderColor: '#0F613B',
  },
  variantChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111E15',
  },
  variantChipTextActive: {
    color: '#FFFFFF',
  },
  variantPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F613B',
    marginTop: 2,
  },
  variantPriceActive: {
    color: '#E8F5E9',
  },
  descText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cropTag: {
    backgroundColor: '#F0F7F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D5E6DC',
  },
  cropTagText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F613B',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  bulletIcon: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F613B',
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2EBE5',
    ...shadow.card,
  },
  sellerLabel: {
    fontSize: 11,
    color: '#66776C',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sellerName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111E15',
    marginTop: 2,
  },
  sellerLoc: {
    fontSize: 12,
    color: '#66776C',
    marginTop: 2,
  },
  verifiedBadge: {
    backgroundColor: '#E7F5EC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F613B',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2EBE5',
    ...shadow.card,
  },
  bottomPriceLabel: {
    fontSize: 11,
    color: '#66776C',
    fontWeight: '600',
  },
  bottomPriceVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F613B',
  },
  addCartBtn: {
    backgroundColor: '#0F613B',
    borderRadius: radius.full,
    paddingHorizontal: 28,
    paddingVertical: 14,
    ...shadow.card,
  },
  addCartBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  backHomeBtn: {
    marginTop: 16,
    backgroundColor: '#0F613B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
});
