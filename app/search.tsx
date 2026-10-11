import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CropListingCard } from '../src/components/CropListingCard';
import { LabourCard } from '../src/components/LabourCard';
import { MachineryCard } from '../src/components/MachineryCard';
import { ProductCard } from '../src/components/ProductCard';
import { colors, font, radius, shadow, spacing } from '../src/constants/theme';
import { useT } from '../src/i18n';
import { cropMarketplaceService } from '../src/services/cropMarketplaceService';
import { labourService } from '../src/services/labourService';
import { machineryService } from '../src/services/machineryService';
import { productService } from '../src/services/productService';
import { useWishlistStore } from '../src/store/wishlistStore';
import { CropListing, Labourer, Machinery, Product } from '../src/types';

export default function GlobalSearchScreen() {
  const t = useT();
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();

  const [query, setQuery] = useState<string>(params.q || '');
  const [labourResults, setLabourResults] = useState<Labourer[]>([]);
  const [machineryResults, setMachineryResults] = useState<Machinery[]>([]);
  const [productResults, setProductResults] = useState<Product[]>([]);
  const [cropResults, setCropResults] = useState<CropListing[]>([]);
  const [searching, setSearching] = useState<boolean>(false);

  const { wishlistIds, toggleWishlist } = useWishlistStore();

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setSearching(true);
    try {
      const [l, m, p, c] = await Promise.all([
        labourService.getLabourers(searchTerm),
        machineryService.getMachinery(searchTerm),
        productService.searchProducts(searchTerm),
        cropMarketplaceService.searchCropListings(searchTerm),
      ]);

      setLabourResults(l);
      setMachineryResults(m);
      setProductResults(p);
      setCropResults(c);
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (params.q) {
      performSearch(params.q);
    }
  }, [params.q]);

  const totalCount =
    labourResults.length + machineryResults.length + productResults.length + cropResults.length;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Search Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← {t('back')}</Text>
        </Pressable>

        <View style={styles.searchInputWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search labour, tractor, urea, seeds, crops..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => performSearch(query)}
            autoFocus
          />
          <Pressable style={styles.searchSubmitBtn} onPress={() => performSearch(query)}>
            <Text style={styles.searchIcon}>🔍</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {searching ? (
          <Text style={styles.statusText}>Searching marketplace...</Text>
        ) : query && totalCount === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>No Results Found for "{query}"</Text>
            <Text style={styles.emptySub}>
              Try searching for "tractor", "labour", "urea", "onion", or "seeds".
            </Text>
          </View>
        ) : (
          <>
            {/* Products Section */}
            {productResults.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🛒 Agricultural Products ({productResults.length})</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {productResults.map((prod) => (
                    <View key={prod.id} style={{ width: 170, marginRight: spacing.m }}>
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

            {/* Crop Harvest Listings */}
            {cropResults.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🌾 Crop Harvest Listings ({cropResults.length})</Text>
                {cropResults.map((crop) => (
                  <CropListingCard
                    key={crop.id}
                    listing={crop}
                    onPress={() =>
                      router.push({
                        pathname: '/market/crops/[id]',
                        params: { id: crop.id },
                      } as any)
                    }
                  />
                ))}
              </View>
            )}

            {/* Machinery Services Section */}
            {machineryResults.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🚜 Machinery Services ({machineryResults.length})</Text>
                {machineryResults.map((m) => (
                  <View key={m.id} style={{ marginBottom: spacing.s }}>
                    <MachineryCard
                      machinery={m}
                      onPress={() => router.push(`/services/machinery/${m.id}` as any)}
                    />
                  </View>
                ))}
              </View>
            )}

            {/* Labour Services Section */}
            {labourResults.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>👨‍🌾 Labour Workers ({labourResults.length})</Text>
                {labourResults.map((l) => (
                  <View key={l.id} style={{ marginBottom: spacing.s }}>
                    <LabourCard
                      labourer={l}
                      onPress={() => router.push(`/services/labour/${l.id}` as any)}
                    />
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.s,
    paddingHorizontal: spacing.m,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.s,
  },
  backBtn: { padding: spacing.xs },
  backText: { fontFamily: font.medium, color: colors.primary, fontSize: 14 },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.m,
    height: 44,
  },
  searchInput: { flex: 1, fontFamily: font.regular, fontSize: 14, color: colors.textPrimary },
  searchSubmitBtn: { padding: spacing.xs },
  searchIcon: { fontSize: 16 },
  content: { padding: spacing.m },
  statusText: { fontFamily: font.medium, fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 40 },
  emptyBox: { alignItems: 'center', marginTop: 60, paddingHorizontal: spacing.l },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.s },
  emptyTitle: { fontFamily: font.bold, fontSize: 16, color: colors.textPrimary },
  emptySub: { fontFamily: font.regular, fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: 4 },
  section: { marginBottom: spacing.l },
  sectionTitle: { fontFamily: font.bold, fontSize: 16, color: colors.textPrimary, marginBottom: spacing.s },
});
