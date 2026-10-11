import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chip } from '../../src/components/Chip';
import { EmptyState } from '../../src/components/EmptyState';
import { FilterSheet } from '../../src/components/FilterSheet';
import { LabourCard } from '../../src/components/LabourCard';
import { MachineryCard } from '../../src/components/MachineryCard';
import { SearchBar } from '../../src/components/SearchBar';
import { LABOUR_CATEGORIES, MACHINERY_CATEGORIES } from '../../src/constants/serviceCategories';
import { colors, font, radius, spacing, TOUCH } from '../../src/constants/theme';
import { useT } from '../../src/i18n';
import { useServiceStore } from '../../src/store/serviceStore';
import { Labourer, Machinery, ServiceType } from '../../src/types';

export default function ServicesScreen() {
  const t = useT();
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string; search?: string }>();

  const {
    activeTab, setActiveTab,
    searchQuery, setSearchQuery,
    labourCategory, setLabourCategory,
    labourers, labourLoading, fetchLabourers,
    machineryCategory, setMachineryCategory,
    machinery, machineryLoading, fetchMachinery,
    savedLabourIds, toggleSaveLabour,
    savedMachineryIds, toggleSaveMachinery,
  } = useServiceStore();

  const [filterVisible, setFilterVisible] = useState(false);
  const labourFilters = useServiceStore((s) => s.labourFilters);
  const machineryFilters = useServiceStore((s) => s.machineryFilters);
  const setLabourFilters = useServiceStore((s) => s.setLabourFilters);
  const setMachineryFilters = useServiceStore((s) => s.setMachineryFilters);
  const resetLabourFilters = useServiceStore((s) => s.resetLabourFilters);
  const resetMachineryFilters = useServiceStore((s) => s.resetMachineryFilters);

  // Handle initial params
  useEffect(() => {
    if (params.tab === 'labour' || params.tab === 'machinery') {
      setActiveTab(params.tab);
    }
    if (params.search) {
      setSearchQuery(params.search);
    }
  }, [params.tab, params.search]);

  // Fetch on mount and when search changes
  useEffect(() => {
    if (activeTab === 'labour') fetchLabourers();
    else fetchMachinery();
  }, [activeTab, searchQuery]);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
  }, []);

  const isLabour = activeTab === 'labour';
  const categories = isLabour ? LABOUR_CATEGORIES : MACHINERY_CATEGORIES;
  const selectedCategory = isLabour ? labourCategory : machineryCategory;

  const handleCategoryPress = (id: string) => {
    if (isLabour) setLabourCategory(id as any);
    else setMachineryCategory(id as any);
  };

  const renderLabourer = useCallback(({ item }: { item: Labourer }) => (
    <View style={{ marginBottom: 12 }}>
      <LabourCard
        labourer={item}
        onPress={() => router.push(`/services/labour/${item.id}`)}
        onSave={() => toggleSaveLabour(item.id)}
        isSaved={savedLabourIds.includes(item.id)}
      />
    </View>
  ), [savedLabourIds]);

  const renderMachine = useCallback(({ item }: { item: Machinery }) => (
    <View style={{ marginBottom: 12 }}>
      <MachineryCard
        machinery={item}
        onPress={() => router.push(`/services/machinery/${item.id}`)}
        onSave={() => toggleSaveMachinery(item.id)}
        isSaved={savedMachineryIds.includes(item.id)}
      />
    </View>
  ), [savedMachineryIds]);

  const currentFilters = isLabour
    ? {
        maxDistance: (labourFilters.maxDistance ?? 50),
        pricingType: (labourFilters.pricingType ?? 'any') as any,
        minRating: (labourFilters.minRating ?? 0),
        availability: (labourFilters.availability ?? 'any') as any,
      }
    : {
        maxDistance: (machineryFilters.maxDistance ?? 50),
        pricingType: (machineryFilters.pricingType ?? 'any') as any,
        minRating: (machineryFilters.minRating ?? 0),
        availability: (machineryFilters.availability ?? 'any') as any,
        operatorIncluded: machineryFilters.operatorIncluded ?? null,
      };

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>{t('services')}</Text>
        <SearchBar
          placeholder={t('searchServices')}
          onSubmit={handleSearch}
        />
      </View>

      {/* Tab Switcher */}
      <View style={s.tabRow}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setActiveTab('labour')}
          style={[s.tab, isLabour && s.tabActive]}
        >
          <Text style={{ fontSize: 28 }}>👨‍🌾</Text>
          <Text style={[s.tabLabel, isLabour && s.tabLabelActive]}>{t('labour')}</Text>
          <Text style={[s.tabSub, isLabour && { color: '#fff' }]}>{t('findWorkersNearby')}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => setActiveTab('machinery')}
          style={[s.tab, !isLabour && s.tabActive]}
        >
          <Text style={{ fontSize: 28 }}>🚜</Text>
          <Text style={[s.tabLabel, !isLabour && s.tabLabelActive]}>{t('machinery')}</Text>
          <Text style={[s.tabSub, !isLabour && { color: '#fff' }]}>{t('findFarmMachines')}</Text>
        </Pressable>
      </View>

      {/* Categories + Filter */}
      <View style={s.catRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: spacing.lg }}>
          {categories.map((c) => (
            <Chip
              key={c.id}
              emoji={c.emoji}
              label={c.label}
              selected={selectedCategory === c.id}
              onPress={() => handleCategoryPress(c.id)}
            />
          ))}
        </ScrollView>
        <Pressable accessibilityRole="button" onPress={() => setFilterVisible(true)} style={s.filterBtn}>
          <Text style={{ fontSize: 20 }}>⚙️</Text>
          <Text style={s.filterText}>{t('filters')}</Text>
        </Pressable>
      </View>

      {/* Results */}
      {isLabour ? (
        labourLoading ? (
          <View style={s.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : labourers.length === 0 ? (
          <EmptyState emoji="👨‍🌾" title={t('noLabourFound')} message={t('noLabourFoundMsg')} />
        ) : (
          <FlatList
            data={labourers}
            keyExtractor={(item) => item.id}
            renderItem={renderLabourer}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : (
        machineryLoading ? (
          <View style={s.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : machinery.length === 0 ? (
          <EmptyState emoji="🚜" title={t('noMachineryFound')} message={t('noMachineryFoundMsg')} />
        ) : (
          <FlatList
            data={machinery}
            keyExtractor={(item) => item.id}
            renderItem={renderMachine}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
          />
        )
      )}

      {/* Filter Sheet */}
      <FilterSheet
        visible={filterVisible}
        serviceType={activeTab}
        initialValues={currentFilters}
        onApply={(vals) => {
          if (isLabour) {
            setLabourFilters({
              maxDistance: vals.maxDistance,
              pricingType: vals.pricingType,
              minRating: vals.minRating,
              availability: vals.availability,
            });
          } else {
            setMachineryFilters({
              maxDistance: vals.maxDistance,
              pricingType: vals.pricingType,
              minRating: vals.minRating,
              availability: vals.availability,
              operatorIncluded: vals.operatorIncluded ?? null,
            });
          }
        }}
        onReset={() => {
          if (isLabour) resetLabourFilters();
          else resetMachineryFilters();
        }}
        onClose={() => setFilterVisible(false)}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm },
  title: { fontSize: font.title, fontWeight: '800', color: colors.ink },
  tabRow: { flexDirection: 'row', gap: 12, paddingHorizontal: spacing.lg, marginTop: spacing.md },
  tab: {
    flex: 1, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 2, borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabLabel: { fontSize: font.body, fontWeight: '800', color: colors.ink, marginTop: 4 },
  tabLabelActive: { color: '#fff' },
  tabSub: { fontSize: font.small - 1, color: colors.muted, marginTop: 2 },
  catRow: { marginTop: spacing.md },
  filterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
  },
  filterText: { fontSize: font.small, fontWeight: '600', color: colors.primary },
  list: { padding: spacing.lg, paddingTop: spacing.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
