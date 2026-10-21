import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CropListingCard } from '../../src/components/CropListingCard';
import { EmptyState } from '../../src/components/EmptyState';
import { ProductCard } from '../../src/components/ProductCard';
import { CROP_CATEGORIES } from '../../src/constants/cropCategories';
import { PRODUCT_CATEGORIES } from '../../src/constants/productCategories';
import { colors, font, MAX_WIDTH, radius, shadow, spacing, TOUCH } from '../../src/constants/theme';
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
  const { width } = useWindowDimensions();
  const isWide = width > MAX_WIDTH + spacing.lg * 2;

  const parseMode = (mode?: string): 'products' | 'buy-crops' | 'sell-crops' => {
    if (mode === 'buy-crops' || mode === 'crops') return 'buy-crops';
    if (mode === 'sell' || mode === 'sell-crops') return 'sell-crops';
    return 'products';
  };

  const [activeTab, setActiveTab] = useState<'products' | 'buy-crops' | 'sell-crops'>(
    parseMode(params.mode)
  );

  useEffect(() => {
    if (params.mode) {
      const target = parseMode(params.mode);
      setActiveTab((prev) => (prev !== target ? target : prev));
    }
  }, [params.mode]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.shell, isWide && styles.shellWide]}>
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

        {/* Tab Toggle: BUY PRODUCTS | BUY CROPS DIRECT | SELL CROPS */}
        <View style={styles.tabToggleContainer}>
          <Pressable
            style={[styles.tabBtn, activeTab === 'products' && styles.tabBtnActive]}
            onPress={() => setActiveTab('products')}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'products' && styles.tabBtnTextActive,
              ]}
              numberOfLines={1}
            >
              🛒 Buy Products
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabBtn, activeTab === 'buy-crops' && styles.tabBtnActive]}
            onPress={() => setActiveTab('buy-crops')}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'buy-crops' && styles.tabBtnTextActive,
              ]}
              numberOfLines={1}
            >
              🌾 Buy Crops
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabBtn, activeTab === 'sell-crops' && styles.tabBtnActive]}
            onPress={() => setActiveTab('sell-crops')}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'sell-crops' && styles.tabBtnTextActive,
              ]}
              numberOfLines={1}
            >
              🚜 Sell Crops
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Main Tab Content */}
      {activeTab === 'products' && <BuyProductsMarket />}
      {activeTab === 'buy-crops' && <BuyCropsFromFarmersMarket />}
      {activeTab === 'sell-crops' && <SellCropsListingMarket />}
      </View>
    </SafeAreaView>
  );
}

function CartBadgePressable() {
  const router = useRouter();
  const itemCount = useCartStore((s) => s.items.reduce((sum, item) => sum + item.quantity, 0));

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
const SORT_OPTIONS = [
  { id: 'relevance', label: 'Popular & Featured', icon: '🔥' },
  { id: 'price_low_high', label: 'Price: Low to High', icon: '💰' },
  { id: 'price_high_low', label: 'Price: High to Low', icon: '💎' },
  { id: 'rating', label: 'Highest Rated', icon: '⭐' },
  { id: 'newest', label: 'Fastest Delivery', icon: '🚀' },
] as const;

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
    selectedCategories,
    setSelectedCategories,
    toggleCategory,
    sortBy,
    setSortBy,
    fetchProducts,
    fetchHomeSections,
  } = useProductStore();

  const { wishlistIds, toggleWishlist } = useWishlistStore();
  const [isSortModalVisible, setSortModalVisible] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchHomeSections(farmerCrops);
  }, [farmerCrops]);

  // Compute live open search & filtered & sorted products with 0ms UI latency
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Multi-category filter: allow selecting multiple categories
    if (selectedCategories && selectedCategories.length > 0) {
      list = list.filter((p) => selectedCategories.includes(p.category));
    }

    // Open text search: match title, brand, description, category, subcategory, crops
    const q = (searchQuery || '').toLowerCase().trim();
    if (q) {
      list = list.filter((p) => {
        const inName = p.name?.toLowerCase().includes(q);
        const inBrand = p.brand?.toLowerCase().includes(q);
        const inDesc = p.description?.toLowerCase().includes(q);
        const inCategory = p.category?.toLowerCase().includes(q);
        const inSubcategory = p.subcategory?.toLowerCase().includes(q);
        const inCrops = p.suitableCrops && p.suitableCrops.some((c) => c.toLowerCase().includes(q));
        return inName || inBrand || inDesc || inCategory || inSubcategory || inCrops;
      });
    }

    // Sorting
    if (sortBy === 'price_low_high') {
      list.sort((a, b) => (a.variants[0]?.price || 0) - (b.variants[0]?.price || 0));
    } else if (sortBy === 'price_high_low') {
      list.sort((a, b) => (b.variants[0]?.price || 0) - (a.variants[0]?.price || 0));
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'newest') {
      list.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    } else {
      list.sort((a, b) => (b.featured || b.bestSeller ? 1 : 0) - (a.featured || a.bestSeller ? 1 : 0));
    }

    return list;
  }, [products, selectedCategories, searchQuery, sortBy]);

  const isFilteringOrSearching =
    (selectedCategories && selectedCategories.length > 0) ||
    searchQuery.trim().length > 0 ||
    sortBy !== 'relevance';

  const activeSortLabel = SORT_OPTIONS.find((s) => s.id === sortBy)?.label || 'Sort';

  return (
    <>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Open Search Bar & Sort Button Row */}
        <View style={styles.searchSortRow}>
          <View style={styles.searchBarWrapper}>
            <Text style={styles.openSearchIcon}>🔍</Text>
            <TextInput
              style={styles.openSearchInput}
              placeholder="Search labour, tractor, seeds, fertilizer..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={(text) => setSearchQuery(text)}
              autoCorrect={false}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <Pressable
                style={styles.clearSearchBtn}
                onPress={() => setSearchQuery('')}
                hitSlop={8}
              >
                <Text style={styles.clearSearchIcon}>✕</Text>
              </Pressable>
            )}
          </View>

          <Pressable
            style={[
              styles.sortBtn,
              sortBy !== 'relevance' && styles.sortBtnActive,
            ]}
            onPress={() => setSortModalVisible(true)}
          >
            <Text style={[styles.sortBtnText, sortBy !== 'relevance' && styles.sortBtnTextActive]}>
              ⇅ Sort
            </Text>
            {sortBy !== 'relevance' && <View style={styles.sortActiveDot} />}
          </Pressable>
        </View>

        {/* Multi-Select Category Filters */}
        <View style={styles.categorySection}>
          <View style={styles.sectionHeader}>
            <View style={styles.categoryHeaderLeft}>
              <Text style={styles.sectionTitle}>{t('category')}</Text>
              {selectedCategories.length > 0 && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {selectedCategories.length} selected
                  </Text>
                </View>
              )}
            </View>

            {selectedCategories.length > 0 && (
              <Pressable onPress={() => setSelectedCategories([])}>
                <Text style={styles.clearAllText}>Clear all</Text>
              </Pressable>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {/* "All" Option */}
            <Pressable
              style={[
                styles.categoryChip,
                selectedCategories.length === 0 && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategories([])}
            >
              <Text style={[styles.categoryLabel, selectedCategories.length === 0 && styles.categoryLabelActive]}>
                🌾 All
              </Text>
            </Pressable>

            {PRODUCT_CATEGORIES.map((cat) => {
              const isSelected = selectedCategories.includes(cat.id);
              return (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    isSelected && styles.categoryChipActive,
                  ]}
                  onPress={() => toggleCategory(cat.id)}
                >
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelActive]}>
                    {cat.defaultLabel}
                  </Text>
                  {isSelected && (
                    <View style={styles.selectedCheckMark}>
                      <Text style={styles.selectedCheckText}>✓</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Active Filter Tags & Live Results Header */}
        {isFilteringOrSearching && (
          <View style={styles.filterSummaryBanner}>
            <View style={styles.filterSummaryLeft}>
              <Text style={styles.filterSummaryCount}>
                Showing <Text style={{ fontWeight: '800' }}>{filteredProducts.length}</Text> product
                {filteredProducts.length === 1 ? '' : 's'}
              </Text>
              {sortBy !== 'relevance' && (
                <Text style={styles.filterSummarySort}>• {activeSortLabel}</Text>
              )}
            </View>

            <Pressable
              onPress={() => {
                setSelectedCategories([]);
                setSearchQuery('');
                setSortBy('relevance');
              }}
              style={styles.resetAllBtn}
            >
              <Text style={styles.resetAllText}>Reset All ✕</Text>
            </Pressable>
          </View>
        )}

        {/* When Filter / Search / Sort is ACTIVE: Show Live Results Grid */}
        {isFilteringOrSearching ? (
          <View style={styles.section}>
            {filteredProducts.length === 0 ? (
              <EmptyState
                emoji="🔍"
                title="No Products Match"
                message={
                  searchQuery
                    ? `No products match "${searchQuery}" in selected categories.`
                    : 'No products found for the selected category filters.'
                }
                actionLabel="Clear Filters"
                onAction={() => {
                  setSelectedCategories([]);
                  setSearchQuery('');
                  setSortBy('relevance');
                }}
              />
            ) : (
              <View style={styles.productGrid}>
                {filteredProducts.map((prod: any) => (
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
            )}
          </View>
        ) : (
          /* DEFAULT STATE: Curated Sections */
          <>
            {/* Recommended for Your Crops */}
            {recommendedProducts.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    🌟 Recommended for Your Crops ({farmerCrops.join(', ') || 'vegetables, fruits, potato, cotton, maize, sugarcane'})
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
                  onPress={() => {
                    setSortBy('relevance');
                  }}
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
                {products.map((prod: any) => (
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
          </>
        )}
      </ScrollView>

      {/* Sort Bottom Sheet Modal */}
      <Modal
        visible={isSortModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <Pressable
          style={styles.sortModalBackdrop}
          onPress={() => setSortModalVisible(false)}
        >
          <Pressable
            style={styles.sortModalSheet}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalDragBar} />
            <View style={styles.sortModalHeader}>
              <Text style={styles.sortModalTitle}>Sort Products By</Text>
              <Pressable
                style={styles.modalCloseCircle}
                onPress={() => setSortModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.sortOptionsList}>
              {SORT_OPTIONS.map((opt) => {
                const isSelected = sortBy === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    style={[
                      styles.sortOptionRow,
                      isSelected && styles.sortOptionRowActive,
                    ]}
                    onPress={() => {
                      setSortBy(opt.id);
                      setSortModalVisible(false);
                    }}
                  >
                    <View style={styles.sortOptionLeft}>
                      <Text style={styles.sortOptionIcon}>{opt.icon}</Text>
                      <Text
                        style={[
                          styles.sortOptionText,
                          isSelected && styles.sortOptionTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.radioRing,
                        isSelected && styles.radioRingActive,
                      ]}
                    >
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// BUY CROPS DIRECTLY FROM FARMERS MARKETPLACE
// ─────────────────────────────────────────────────────────────
function BuyCropsFromFarmersMarket() {
  const router = useRouter();

  const listings = useCropMarketplaceStore((s) => s.listings);
  const savedCropIds = useCropMarketplaceStore((s) => s.savedCropIds);
  const fetchListings = useCropMarketplaceStore((s) => s.fetchListings);
  const toggleSaveCrop = useCropMarketplaceStore((s) => s.toggleSaveCrop);

  const [localSearch, setLocalSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  useEffect(() => {
    fetchListings();
  }, []);

  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      const matchCat = selectedCat === 'all' || l.category === selectedCat;
      const matchSearch =
        !localSearch.trim() ||
        l.cropName.toLowerCase().includes(localSearch.toLowerCase()) ||
        l.variety.toLowerCase().includes(localSearch.toLowerCase()) ||
        l.location?.district?.toLowerCase().includes(localSearch.toLowerCase()) ||
        l.farmerName.toLowerCase().includes(localSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [listings, selectedCat, localSearch]);

  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Banner */}
      <View style={styles.buyCropsBanner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.buyCropsBannerTitle}>🌾 Buy Crops Directly from Farmers</Text>
          <Text style={styles.buyCropsBannerSub}>
            Fresh farm harvests · Direct farmer prices · Zero broker commissions
          </Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search crop, variety, or district (e.g. Onion, Mandya)..."
          placeholderTextColor={colors.textMuted}
          value={localSearch}
          onChangeText={setLocalSearch}
        />
        {localSearch.length > 0 ? (
          <Pressable onPress={() => setLocalSearch('')}>
            <Text style={{ color: '#888', fontWeight: 'bold', paddingHorizontal: 6 }}>✕</Text>
          </Pressable>
        ) : (
          <Text style={styles.searchIcon}>🔍</Text>
        )}
      </View>

      {/* Categories Horizontal */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        <Pressable
          style={[styles.categoryChip, selectedCat === 'all' && styles.categoryChipActive]}
          onPress={() => setSelectedCat('all')}
        >
          <Text style={styles.categoryEmoji}>🌱</Text>
          <Text style={[styles.categoryLabel, selectedCat === 'all' && styles.categoryLabelActive]}>
            All Crops
          </Text>
        </Pressable>
        {CROP_CATEGORIES.map((cat) => (
          <Pressable
            key={cat.id}
            style={[styles.categoryChip, selectedCat === cat.id && styles.categoryChipActive]}
            onPress={() => setSelectedCat(cat.id)}
          >
            <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
            <Text
              style={[
                styles.categoryLabel,
                selectedCat === cat.id && styles.categoryLabelActive,
              ]}
            >
              {cat.defaultLabel}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Available Crops Count & Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          🌾 Available Farmer Harvests ({filteredListings.length})
        </Text>
      </View>

      {/* Listings Cards */}
      {filteredListings.length === 0 ? (
        <EmptyState
          emoji="🌾"
          title="No crop harvests found"
          message="No farmer lots match your search right now. Be the first to list your harvest!"
          actionLabel="+ List Your Crop"
          onAction={() => router.push('/market/sell/create' as any)}
        />
      ) : (
        filteredListings.map((listing) => (
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
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────
// SELL CROPS BY LISTING MARKETPLACE
// ─────────────────────────────────────────────────────────────
function SellCropsListingMarket() {
  const t = useT();
  const router = useRouter();

  const myListings = useCropMarketplaceStore((s) => s.myListings);
  const requests = useCropMarketplaceStore((s) => s.requests);
  const sales = useCropMarketplaceStore((s) => s.sales);
  const fetchMyListings = useCropMarketplaceStore((s) => s.fetchMyListings);
  const fetchRequests = useCropMarketplaceStore((s) => s.fetchRequests);
  const fetchSales = useCropMarketplaceStore((s) => s.fetchSales);

  const farmerCrops = useFarmerStore((s) => s.crops);

  useEffect(() => {
    fetchMyListings();
    fetchRequests();
    fetchSales();
  }, []);

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const activeMyListings = myListings.filter((l) => l.status === 'active');

  const marketDemandList = useMemo(() => {
    if (!farmerCrops || farmerCrops.length === 0) return [];
    return farmerCrops.map((crop, idx) => ({
      id: `crop-demand-${idx}-${crop}`,
      cropName: crop,
      emoji: '🌾',
      demandLevel: 'High' as const,
      avgPrice: 'Live Mandi Price',
    }));
  }, [farmerCrops]);

  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Action CTAs */}
      <View style={styles.actionBanner}>
        <View style={styles.actionTextCol}>
          <Text style={styles.actionTitle}>🚜 Sell Crops by Listing</Text>
          <Text style={styles.actionSub}>List your harvest directly to wholesale buyers and millers</Text>
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
      {marketDemandList.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 {t('marketDemand')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.s }}>
            {marketDemandList.map((item) => (
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
      )}

      {/* My Active Listings Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('myListings')} ({activeMyListings.length})</Text>
          <Pressable onPress={() => router.push('/market/sell' as any)}>
            <Text style={styles.seeAllText}>{t('seeAll')} →</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  shell: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
  },
  shellWide: {
    maxWidth: MAX_WIDTH,
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
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: font.title,
    fontWeight: '800',
    color: colors.ink,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0B2A14',
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
    position: 'relative',
  },
  iconEmoji: {
    fontSize: 18,
  },
  cartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: colors.primary,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tabToggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.primarySoft,
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    minHeight: 38,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  tabBtnActive: {
    backgroundColor: colors.surface,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.muted,
  },
  tabBtnTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl + 16,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingRight: 44,
    height: 50,
    borderWidth: 1.5,
    borderColor: '#D7E4DC',
    fontSize: 14,
    color: '#111E15',
    ...shadow.card,
  },
  searchIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
    fontSize: 18,
  },

  /* Open Search Bar & Sort Row */
  searchSortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: spacing.md,
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    height: 48,
  },
  openSearchIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  openSearchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.ink,
    paddingVertical: 0,
    height: '100%',
  },
  clearSearchBtn: {
    padding: 5,
    borderRadius: 12,
    backgroundColor: '#EAEFEA',
    marginLeft: 4,
  },
  clearSearchIcon: {
    fontSize: 11,
    color: '#55665C',
    fontWeight: '800',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D7E4DC',
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 24,
    gap: 6,
    ...shadow.card,
  },
  sortBtnActive: {
    borderColor: '#0F613B',
    backgroundColor: '#EAF5EF',
  },
  sortBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111E15',
  },
  sortBtnTextActive: {
    color: '#0F613B',
    fontWeight: '800',
  },
  sortActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0F613B',
  },

  /* Multi-Category Filter */
  categorySection: {
    marginBottom: spacing.m,
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: '#E8F5EE',
    borderWidth: 1,
    borderColor: '#BFE0CD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F613B',
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D32F2F',
  },
  section: {
    marginBottom: spacing.l,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111E15',
    letterSpacing: -0.2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F613B',
  },
  categoriesScroll: {
    gap: 8,
    paddingBottom: 6,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1.5,
    borderColor: '#D7E5DC',
    gap: 6,
    ...shadow.card,
  },
  categoryChipActive: {
    backgroundColor: '#0F613B',
    borderColor: '#0F613B',
    shadowColor: '#0F613B',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  categoryEmoji: {
    fontSize: 17,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111E15',
  },
  categoryLabelActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  selectedCheckMark: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  selectedCheckText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0F613B',
  },

  /* Active Filter Banner */
  filterSummaryBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EAF4EE',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: '#C5E2D0',
  },
  filterSummaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  filterSummaryCount: {
    fontSize: 12.5,
    color: '#111E15',
  },
  filterSummarySort: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F613B',
  },
  resetAllBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3C4C4',
  },
  resetAllText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#D32F2F',
  },

  /* Sort Bottom Sheet Modal */
  sortModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sortModalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 12,
  },
  modalDragBar: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D6DFD9',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sortModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  sortModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111E15',
    letterSpacing: -0.3,
  },
  modalCloseCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF4F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#66776C',
  },
  sortOptionsList: {
    gap: 9,
  },
  sortOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2EBE5',
    backgroundColor: '#FAFCFA',
  },
  sortOptionRowActive: {
    borderColor: '#0F613B',
    backgroundColor: '#F0F7F2',
  },
  sortOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sortOptionIcon: {
    fontSize: 18,
  },
  sortOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111E15',
  },
  sortOptionTextActive: {
    fontWeight: '800',
    color: '#0F613B',
  },
  radioRing: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD7CE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioRingActive: {
    borderColor: '#0F613B',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0F613B',
  },
  horizontalCardWrapper: {
    width: 152,
    marginRight: spacing.m,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.m,
  },
  gridCardWrapper: {
    width: '48%',
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
  buyCropsBanner: {
    backgroundColor: '#0B512E',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    ...shadow.card,
  },
  buyCropsBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  buyCropsBannerSub: {
    fontSize: 12,
    color: '#D1FAE5',
    marginTop: 2,
    lineHeight: 16,
  },
  bannerSellCta: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bannerSellCtaText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0B512E',
  },
});
