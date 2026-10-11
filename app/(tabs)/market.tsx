import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CropListingCard } from '../../src/components/CropListingCard';
import { EmptyState } from '../../src/components/EmptyState';
import { ProductCard } from '../../src/components/ProductCard';
import { CROP_CATEGORIES, MOCK_MARKET_DEMAND } from '../../src/constants/cropCategories';
import { PRODUCT_CATEGORIES } from '../../src/constants/productCategories';
import { colors, font, radius, shadow, spacing, TOUCH } from '../../src/constants/theme';
import { useT } from '../../src/i18n';
import { useCartStore } from '../../src/store/cartStore';
import { useCropMarketplaceStore } from '../../src/store/cropMarketplaceStore';
import { useFarmerStore } from '../../src/store/farmerStore';
import { useProductStore } from '../../src/store/productStore';
import { useWishlistStore } from '../../src/store/wishlistStore';
import { ProductCategory } from '../../src/types';

export default function MarketScreen() {
  const t = useT();
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();

  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>(
    params.mode === 'sell' ? 'sell' : 'buy',
  );

  useEffect(() => {
    if (params.mode === 'sell' || params.mode === 'buy') {
      setActiveTab(params.mode as 'buy' | 'sell');
    }
  }, [params.mode]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>{t('tabMarket')}</Text>

          {/* Cart Icon & Wishlist Icon */}
          <View style={styles.headerIcons}>
            <Pressable
              style={styles.iconBtn}
              onPress={() => router.push('/market/wishlist' as any)}
            >
              <Text style={styles.iconEmoji}>❤️</Text>
            </Pressable>
            <CartBadgePressable />
          </View>
        </View>

        {/* Tab Toggle: BUY PRODUCTS | SELL CROPS */}
        <View style={styles.tabToggleContainer}>
          <Pressable
            style={[styles.tabBtn, activeTab === 'buy' && styles.tabBtnActive]}
            onPress={() => setActiveTab('buy')}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'buy' && styles.tabBtnTextActive,
              ]}
            >
              🛒 {t('buyProducts')}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabBtn, activeTab === 'sell' && styles.tabBtnActive]}
            onPress={() => setActiveTab('sell')}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'sell' && styles.tabBtnTextActive,
              ]}
            >
              🌾 {t('sellCropsTitle')}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Main Tab Content */}
      {activeTab === 'buy' ? <BuyProductsMarket /> : <SellCropsMarket />}
    </SafeAreaView>
  );
}

function CartBadgePressable() {
  const router = useRouter();
  const itemCount = useCartStore((s: any) => s.getItemCount());

  return (
    <Pressable
      style={styles.iconBtn}
      onPress={() => router.push('/market/cart' as any)}
    >
      <Text style={styles.iconEmoji}>🛒</Text>
      {itemCount > 0 && (
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>{itemCount}</Text>
        </View>
      )}
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────────────
// BUY PRODUCTS MARKETPLACE (Phase 3)
// ─────────────────────────────────────────────────────────────
function BuyProductsMarket() {
  const t = useT();
  const router = useRouter();
  const farmerCrops = useFarmerStore((s) => s.crops);

  const {
    products,
    featuredProducts,
    recommendedProducts,
    searchQuery,
    setSearchQuery,
    fetchProducts,
    fetchHomeSections,
    recentlyViewedIds,
  } = useProductStore();

  const { wishlistIds, toggleWishlist } = useWishlistStore();

  useEffect(() => {
    fetchProducts();
    fetchHomeSections(farmerCrops);
  }, [farmerCrops]);

  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('searchPlaceholder')}
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={(q) => {
            setSearchQuery(q);
            if (q.trim().length > 0) {
              router.push({
                pathname: '/market/category/[category]',
                params: { category: 'all', search: q },
              } as any);
            }
          }}
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      {/* Categories Horizontal Scroll */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('category')}</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {PRODUCT_CATEGORIES.map((cat) => (
          <Pressable
            key={cat.id}
            style={styles.categoryChip}
            onPress={() =>
              router.push({
                pathname: '/market/category/[category]',
                params: { category: cat.id },
              } as any)
            }
          >
            <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
            <Text style={styles.categoryLabel}>{cat.defaultLabel}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Recommended for Your Crops */}
      {recommendedProducts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              🌟 Recommended for Your Crops ({farmerCrops.join(', ') || 'Farm'})
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recommendedProducts.map((prod: any) => (
              <View key={prod.id} style={styles.horizontalCardWrapper}>
                <ProductCard
                  product={prod}
                  onPress={() =>
                    router.push({
                      pathname: '/market/product/[id]',
                      params: { id: prod.id },
                    } as any)
                  }
                  onWishlistToggle={() => toggleWishlist(prod.id)}
                  isWishlisted={wishlistIds.includes(prod.id)}
                  compact
                />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Popular / Featured Products */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔥 Best Sellers & Featured</Text>
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/market/category/[category]',
                params: { category: 'all' },
              } as any)
            }
          >
            <Text style={styles.seeAllText}>{t('seeAll')}</Text>
          </Pressable>
        </View>

        <View style={styles.productGrid}>
          {featuredProducts.slice(0, 6).map((prod: any) => (
            <View key={prod.id} style={styles.gridCardWrapper}>
              <ProductCard
                product={prod}
                onPress={() =>
                  router.push({
                    pathname: '/market/product/[id]',
                    params: { id: prod.id },
                  } as any)
                }
                onWishlistToggle={() => toggleWishlist(prod.id)}
                isWishlisted={wishlistIds.includes(prod.id)}
              />
            </View>
          ))}
        </View>
      </View>

      {/* All Products Quick Browse */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🌾 All Farm Supplies</Text>
        </View>

        <View style={styles.productGrid}>
          {products.slice(0, 8).map((prod: any) => (
            <View key={prod.id} style={styles.gridCardWrapper}>
              <ProductCard
                product={prod}
                onPress={() =>
                  router.push({
                    pathname: '/market/product/[id]',
                    params: { id: prod.id },
                  } as any)
                }
                onWishlistToggle={() => toggleWishlist(prod.id)}
                isWishlisted={wishlistIds.includes(prod.id)}
              />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────
// SELL CROPS MARKETPLACE (Phase 4)
// ─────────────────────────────────────────────────────────────
function SellCropsMarket() {
  const t = useT();
  const router = useRouter();

  const {
    myListings,
    requests,
    sales,
    listings,
    fetchMyListings,
    fetchRequests,
    fetchSales,
    fetchListings,
    toggleSaveCrop,
    savedCropIds,
  } = useCropMarketplaceStore();

  const [activeSubTab, setActiveSubTab] = useState<'my' | 'market'>('my');

  useEffect(() => {
    fetchMyListings();
    fetchRequests();
    fetchSales();
    fetchListings();
  }, []);

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const activeMyListings = myListings.filter((l) => l.status === 'active');

  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Subtab Toggle: MY LISTINGS & SALES | BROWSE CROP MARKET */}
      <View style={styles.subTabRow}>
        <Pressable
          style={[styles.subTabBtn, activeSubTab === 'my' && styles.subTabBtnActive]}
          onPress={() => setActiveSubTab('my')}
        >
          <Text style={[styles.subTabText, activeSubTab === 'my' && styles.subTabTextActive]}>
            👨‍🌾 {t('myListings')} ({activeMyListings.length})
          </Text>
        </Pressable>

        <Pressable
          style={[styles.subTabBtn, activeSubTab === 'market' && styles.subTabBtnActive]}
          onPress={() => setActiveSubTab('market')}
        >
          <Text style={[styles.subTabText, activeSubTab === 'market' && styles.subTabTextActive]}>
            🌐 {t('cropMarket')}
          </Text>
        </Pressable>
      </View>

      {activeSubTab === 'my' ? (
        <>
          {/* Action CTAs */}
          <View style={styles.actionBanner}>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>{t('sellCropsTitle')}</Text>
              <Text style={styles.actionSub}>{t('sellCropsSub')}</Text>
            </View>

            <Pressable
              style={styles.createListingBtn}
              onPress={() => router.push('/market/sell/create' as any)}
            >
              <Text style={styles.createListingBtnText}>+ {t('listYourCrop')}</Text>
            </Pressable>
          </View>

          {/* Pending Buyer Requests Banner if any */}
          {pendingRequests.length > 0 && (
            <View style={styles.pendingRequestsBanner}>
              <View style={styles.pendingHeaderRow}>
                <Text style={styles.pendingTitle}>
                  🔔 {pendingRequests.length} Pending Broker Request(s)
                </Text>
                <Pressable onPress={() => router.push('/market/sell/requests' as any)}>
                  <Text style={styles.viewReqText}>{t('seeAll')}</Text>
                </Pressable>
              </View>
              <Text style={styles.pendingSub}>
                The Admin Broker has matched buyers for your harvest!
              </Text>
            </View>
          )}

          {/* Market Demand Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📈 {t('marketDemand')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.s }}>
              {MOCK_MARKET_DEMAND.map((item) => (
                <View key={item.id} style={styles.demandChip}>
                  <Text style={styles.demandEmoji}>{item.emoji}</Text>
                  <View>
                    <Text style={styles.demandName}>{item.cropName}</Text>
                    <Text style={styles.demandPrice}>{item.avgPrice}</Text>
                  </View>
                  <View style={styles.demandBadge}>
                    <Text style={styles.demandLevelText}>{item.demandLevel}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* My Active Listings Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('myListings')}</Text>
              <Pressable onPress={() => router.push('/market/sell' as any)}>
                <Text style={styles.seeAllText}>{t('seeAll')}</Text>
              </Pressable>
            </View>

            {myListings.length === 0 ? (
              <EmptyState
                emoji="🌾"
                title={t('noCropListings')}
                message={t('noCropListingsMsg')}
                actionLabel={`+ ${t('listYourCrop')}`}
                onAction={() => router.push('/market/sell/create' as any)}
              />
            ) : (
              myListings.slice(0, 4).map((listing) => (
                <CropListingCard
                  key={listing.id}
                  listing={listing}
                  onPress={() =>
                    router.push({
                      pathname: '/market/crops/[id]',
                      params: { id: listing.id },
                    } as any)
                  }
                />
              ))
            )}
          </View>

          {/* My Sales Quick Link */}
          <Pressable
            style={styles.salesNavCard}
            onPress={() => router.push('/market/sell' as any)}
          >
            <View style={styles.salesNavLeft}>
              <Text style={styles.salesIcon}>💰</Text>
              <View>
                <Text style={styles.salesNavTitle}>{t('mySales')} ({sales.length})</Text>
                <Text style={styles.salesNavSub}>Track completed harvest sale orders</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </>
      ) : (
        <>
          {/* Crop Marketplace Search */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder={t('searchCrops')}
              placeholderTextColor={colors.textMuted}
              onSubmitEditing={(e) =>
                useCropMarketplaceStore.getState().setSearchQuery(e.nativeEvent.text)
              }
            />
            <Text style={styles.searchIcon}>🔍</Text>
          </View>

          {/* Categories Horizontal */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {CROP_CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                style={styles.categoryChip}
                onPress={() =>
                  useCropMarketplaceStore.getState().setFilters({ category: cat.id })
                }
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text style={styles.categoryLabel}>{cat.defaultLabel}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* All Public Crop Listings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌾 Available Crop Harvests</Text>
            {listings.length === 0 ? (
              <EmptyState
                emoji="🌾"
                title="No crops listed"
                message="Check back soon for new crop listings."
              />
            ) : (
              listings.map((listing) => (
                <CropListingCard
                  key={listing.id}
                  listing={listing}
                  onPress={() =>
                    router.push({
                      pathname: '/market/crops/[id]',
                      params: { id: listing.id },
                    } as any)
                  }
                  onSaveToggle={() => toggleSaveCrop(listing.id)}
                  isSaved={savedCropIds.includes(listing.id)}
                />
              ))
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.m,
    paddingTop: spacing.s,
    paddingBottom: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  headerTitle: {
    fontFamily: font.bold,
    fontSize: 22,
    color: colors.textPrimary,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.s,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  iconEmoji: {
    fontSize: 20,
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    fontFamily: font.bold,
    fontSize: 10,
    color: colors.surface,
  },
  tabToggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.m,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing.s,
    alignItems: 'center',
    borderRadius: radius.s,
  },
  tabBtnActive: {
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  tabBtnText: {
    fontFamily: font.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  tabBtnTextActive: {
    fontFamily: font.bold,
    color: colors.primary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.m,
    paddingBottom: spacing.xxl,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: spacing.m,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    paddingHorizontal: spacing.m,
    paddingRight: 40,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    fontFamily: font.regular,
    fontSize: 14,
    color: colors.textPrimary,
  },
  searchIcon: {
    position: 'absolute',
    right: 14,
    top: 14,
    fontSize: 16,
  },
  section: {
    marginBottom: spacing.l,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  sectionTitle: {
    fontFamily: font.bold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  seeAllText: {
    fontFamily: font.medium,
    fontSize: 14,
    color: colors.primary,
  },
  categoriesScroll: {
    gap: spacing.s,
    paddingBottom: spacing.s,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryLabel: {
    fontFamily: font.medium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  horizontalCardWrapper: {
    width: 200,
    marginRight: spacing.m,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.m,
  },
  gridCardWrapper: {
    width: '47%',
  },
  subTabRow: {
    flexDirection: 'row',
    gap: spacing.s,
    marginBottom: spacing.m,
  },
  subTabBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: spacing.s,
    borderRadius: radius.m,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  subTabBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  subTabText: {
    fontFamily: font.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  subTabTextActive: {
    fontFamily: font.bold,
    color: colors.primary,
  },
  actionBanner: {
    backgroundColor: colors.primary,
    borderRadius: radius.m,
    padding: spacing.m,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  actionTextCol: {
    flex: 1,
    marginRight: spacing.s,
  },
  actionTitle: {
    fontFamily: font.bold,
    fontSize: 16,
    color: colors.surface,
  },
  actionSub: {
    fontFamily: font.regular,
    fontSize: 12,
    color: '#E8F5E9',
    marginTop: 2,
  },
  createListingBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: radius.s,
  },
  createListingBtnText: {
    fontFamily: font.bold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  pendingRequestsBanner: {
    backgroundColor: '#FFF3E0',
    borderRadius: radius.m,
    padding: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  pendingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pendingTitle: {
    fontFamily: font.bold,
    fontSize: 14,
    color: '#E65100',
  },
  viewReqText: {
    fontFamily: font.bold,
    fontSize: 13,
    color: colors.primary,
  },
  pendingSub: {
    fontFamily: font.regular,
    fontSize: 12,
    color: '#F57C00',
    marginTop: 2,
  },
  demandChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    padding: spacing.s,
    paddingRight: spacing.m,
    marginRight: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.s,
  },
  demandEmoji: {
    fontSize: 24,
  },
  demandName: {
    fontFamily: font.bold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  demandPrice: {
    fontFamily: font.regular,
    fontSize: 11,
    color: colors.textSecondary,
  },
  demandBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  demandLevelText: {
    fontFamily: font.bold,
    fontSize: 10,
    color: '#2E7D32',
  },
  salesNavCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    padding: spacing.m,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  salesNavLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  salesIcon: {
    fontSize: 28,
  },
  salesNavTitle: {
    fontFamily: font.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  salesNavSub: {
    fontFamily: font.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  chevron: {
    fontSize: 24,
    color: colors.textMuted,
  },
});
