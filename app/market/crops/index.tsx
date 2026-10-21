import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CropListingCard } from '../../../src/components/CropListingCard';
import { EmptyState } from '../../../src/components/EmptyState';
import { CROP_CATEGORIES } from '../../../src/constants/cropCategories';
import { colors, font, radius, shadow, spacing } from '../../../src/constants/theme';
import { useCropMarketplaceStore } from '../../../src/store/cropMarketplaceStore';

export default function BuyCropsPage() {
  const router = useRouter();

  const {
    listings,
    fetchListings,
    toggleSaveCrop,
    savedCropIds,
  } = useCropMarketplaceStore();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  useEffect(() => {
    fetchListings();
  }, []);

  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      const matchCat = selectedCat === 'all' || l.category === selectedCat;
      const matchSearch =
        !search.trim() ||
        l.cropName.toLowerCase().includes(search.toLowerCase()) ||
        l.variety.toLowerCase().includes(search.toLowerCase()) ||
        l.location?.district?.toLowerCase().includes(search.toLowerCase()) ||
        l.farmerName.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [listings, selectedCat, search]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>🌾 Buy Crops from Farmers</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <View style={styles.banner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Buy Direct from Verified Farmers</Text>
            <Text style={styles.bannerSub}>
              Farm-fresh harvests, transparent mandi-linked rates, zero broker cuts.
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchRow}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search crop, variety, or district (e.g. Onion, Mandya)..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Text style={{ color: '#888', fontWeight: 'bold', paddingHorizontal: 6 }}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* Category Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catScroll}
        >
          <Pressable
            style={[styles.catPill, selectedCat === 'all' && styles.catPillActive]}
            onPress={() => setSelectedCat('all')}
          >
            <Text style={styles.catEmoji}>🌱</Text>
            <Text style={[styles.catLabel, selectedCat === 'all' && styles.catLabelActive]}>
              All Crops
            </Text>
          </Pressable>
          {CROP_CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              style={[styles.catPill, selectedCat === cat.id && styles.catPillActive]}
              onPress={() => setSelectedCat(cat.id)}
            >
              <Text style={styles.catEmoji}>{cat.emoji}</Text>
              <Text
                style={[
                  styles.catLabel,
                  selectedCat === cat.id && styles.catLabelActive,
                ]}
              >
                {cat.defaultLabel}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Listings Count Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Available Farmer Harvests ({filteredListings.length})
          </Text>
        </View>

        {/* Listings */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2EBE5',
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
  },
  backText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1B5E20',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1B3B2B',
  },
  sellShortcutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#0F613B',
  },
  sellShortcutText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.m,
    paddingBottom: 40,
  },
  banner: {
    backgroundColor: '#0B512E',
    borderRadius: radius.md,
    padding: spacing.m,
    marginBottom: spacing.m,
    ...shadow.card,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bannerSub: {
    fontSize: 12,
    color: '#D1FAE5',
    marginTop: 3,
    lineHeight: 18,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#D7E5DB',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1B3B2B',
  },
  catScroll: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7E5DB',
    gap: 5,
  },
  catPillActive: {
    backgroundColor: '#0B512E',
    borderColor: '#0B512E',
  },
  catEmoji: {
    fontSize: 14,
  },
  catLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4C6E53',
  },
  catLabelActive: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1B3B2B',
  },
});
