import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CropListingCard } from '../../src/components/CropListingCard';
import { EmptyState } from '../../src/components/EmptyState';
import { colors, font, spacing } from '../../src/constants/theme';
import { useT } from '../../src/i18n';
import { useCropMarketplaceStore } from '../../src/store/cropMarketplaceStore';

export default function SavedCropsScreen() {
  const t = useT();
  const router = useRouter();

  const { savedCropIds, listings, myListings, toggleSaveCrop } = useCropMarketplaceStore();

  const all = [...listings, ...myListings];
  const savedListings = all.filter((l) => savedCropIds.includes(l.id));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← {t('back')}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t('savedCrops')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {savedListings.length === 0 ? (
        <EmptyState
          emoji="⭐"
          title="No saved crops"
          message="Tap the heart icon on any crop listing to save it here."
        />
      ) : (
        <FlatList
          data={savedListings}
          keyExtractor={(l) => l.id}
          contentContainerStyle={{ padding: spacing.m }}
          renderItem={({ item: listing }) => (
            <CropListingCard
              listing={listing}
              onPress={() =>
                router.push({
                  pathname: '/market/crops/[id]',
                  params: { id: listing.id },
                } as any)
              }
              onSaveToggle={() => toggleSaveCrop(listing.id)}
              isSaved={true}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.m,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: spacing.xs },
  backText: { fontFamily: font.medium, color: colors.primary, fontSize: 14 },
  headerTitle: { fontFamily: font.bold, fontSize: 16, color: colors.textPrimary },
});
