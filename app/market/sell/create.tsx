import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CROP_CATEGORIES, CROP_QUALITIES, CROP_UNITS } from '../../../src/constants/cropCategories';
import { colors, font, radius, shadow, spacing } from '../../../src/constants/theme';
import { useT } from '../../../src/i18n';
import { useCropMarketplaceStore } from '../../../src/store/cropMarketplaceStore';
import { useFarmerStore } from '../../../src/store/farmerStore';
import { CropCategory, CropFarmingMethod, CropQuality, CropUnit, PreferredBuyerType } from '../../../src/types';

export default function CreateCropListingScreen() {
  const t = useT();
  const router = useRouter();

  const farmer = useFarmerStore((s) => s.farmer);
  const farm = useFarmerStore((s) => s.farm);
  const farmerCrops = useFarmerStore((s) => s.crops);

  const createListing = useCropMarketplaceStore((s) => s.createListing);

  const [step, setStep] = useState<number>(1);

  // Form State
  const [cropCategory, setCropCategory] = useState<CropCategory>('vegetables');
  const [cropName, setCropName] = useState<string>('');
  const [variety, setVariety] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [unit, setUnit] = useState<CropUnit>('kg');
  const [pricePerUnit, setPricePerUnit] = useState<string>('');
  const [minOrderQty, setMinOrderQty] = useState<string>('');
  const [allowNegotiation, setAllowNegotiation] = useState<boolean>(true);
  const [quality, setQuality] = useState<CropQuality>('Grade A');
  const [farmingMethod, setFarmingMethod] = useState<CropFarmingMethod>('Organic');
  const [harvestDate, setHarvestDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [images, setImages] = useState<string[]>(['🌾']);
  const [description, setDescription] = useState<string>('');
  const [preferredBuyer, setPreferredBuyer] = useState<PreferredBuyerType>('any');

  // Auto-fill from onboarding crops if cropName is empty
  useEffect(() => {
    if (farmerCrops.length > 0 && !cropName) {
      setCropName(farmerCrops[0]);
    }
  }, [farmerCrops]);

  // Validation per step
  const canGoNext = () => {
    if (step === 1) return cropName.trim().length > 0;
    if (step === 2) return Number(quantity) > 0 && Number(pricePerUnit) > 0;
    if (step === 3) return harvestDate.trim().length > 0;
    if (step === 4) return true;
    if (step === 5) return true;
    return true;
  };

  const handleNext = () => {
    if (!canGoNext()) {
      Alert.alert('Required Fields', 'Please complete all required fields in this step.');
      return;
    }
    if (step < 6) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else router.back();
  };

  const handlePublish = async (isDraft: boolean = false) => {
    try {
      const qtyNum = Number(quantity) || 100;
      const priceNum = Number(pricePerUnit) || 10;
      const minQtyNum = Number(minOrderQty) || Math.min(10, qtyNum);

      const currentFarmerId = useFarmerStore.getState().accountId || 'farmer-me';

      const newListing = await createListing({
        farmerId: currentFarmerId,
        farmerName: farmer.name || 'Farmer',
        farmerMobile: farmer.mobile,
        cropName,
        category: cropCategory,
        variety: variety || 'Standard Local Variety',
        totalQuantity: qtyNum,
        unit,
        pricePerUnit: priceNum,
        minimumOrderQuantity: minQtyNum,
        allowNegotiation,
        quality,
        farmingMethod,
        harvestDate,
        location: {
          label: farm.village || 'My Farm',
          district: farm.district || 'Mandya',
          state: farm.state || 'Karnataka',
        },
        images: images.length > 0 ? images : ['🌾'],
        description:
          description ||
          `Fresh ${cropName} harvested directly from our farm. ${quality} quality.`,
        preferredBuyer,
        status: isDraft ? 'draft' : 'active',
      });

      Alert.alert(
        isDraft ? 'Draft Saved' : 'Listing Published! 🎉',
        isDraft
          ? 'Saved in your drafts section.'
          : `Your ${cropName} listing is now live for buyers to make offers.`,
        [
          {
            text: 'View My Listings',
            onPress: () => router.replace('/market/sell' as any),
          },
        ],
      );
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    }
  };

  const totalValue = (Number(quantity) || 0) * (Number(pricePerUnit) || 0);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backText}>← {t('back')}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t('listYourCrop')}</Text>
        <Pressable onPress={() => handlePublish(true)}>
          <Text style={styles.draftText}>{t('saveDraft')}</Text>
        </Pressable>
      </View>

      {/* Progress Bar (Step 1-6) */}
      <View style={styles.progressContainer}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              i <= step && styles.progressDotActive,
              i === step && styles.progressDotCurrent,
            ]}
          />
        ))}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* STEP 1: CROP & VARIETY */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{t('listCropStep1')}</Text>

            {/* Quick Pick from Onboarding Crops */}
            {farmerCrops.length > 0 && (
              <View style={styles.quickPickSection}>
                <Text style={styles.inputLabel}>Your Grown Crops (Quick Select):</Text>
                <View style={styles.chipRow}>
                  {farmerCrops.map((c) => (
                    <Pressable
                      key={c}
                      style={[
                        styles.chip,
                        cropName === c && styles.chipActive,
                      ]}
                      onPress={() => setCropName(c)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          cropName === c && styles.chipTextActive,
                        ]}
                      >
                        🌾 {c}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            <Text style={styles.inputLabel}>{t('cropCategory')} *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.m }}>
              {CROP_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.chip,
                    cropCategory === cat.id && styles.chipActive,
                  ]}
                  onPress={() => setCropCategory(cat.id)}
                >
                  <Text style={styles.chipEmoji}>{cat.emoji}</Text>
                  <Text style={[styles.chipText, cropCategory === cat.id && styles.chipTextActive]}>
                    {cat.defaultLabel}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>{t('cropName')} *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Red Onion, Tomato, Paddy..."
              value={cropName}
              onChangeText={setCropName}
            />

            <Text style={styles.inputLabel}>{t('variety')}</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Bhima Super Red, Namdhari NS-585..."
              value={variety}
              onChangeText={setVariety}
            />
          </View>
        )}

        {/* STEP 2: QUANTITY & PRICE */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{t('listCropStep2')}</Text>

            <Text style={styles.inputLabel}>{t('unit')} *</Text>
            <View style={styles.chipRow}>
              {CROP_UNITS.map((u) => (
                <Pressable
                  key={u.id}
                  style={[styles.chip, unit === u.id && styles.chipActive]}
                  onPress={() => setUnit(u.id)}
                >
                  <Text style={[styles.chipText, unit === u.id && styles.chipTextActive]}>
                    {u.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.inputLabel}>{t('quantity')} *</Text>
            <TextInput
              style={styles.input}
              placeholder={`e.g. 500 (${unit})`}
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
            />

            <Text style={styles.inputLabel}>{t('expectedPrice')} (₹ / {unit}) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 28"
              keyboardType="numeric"
              value={pricePerUnit}
              onChangeText={setPricePerUnit}
            />

            <Text style={styles.inputLabel}>{t('minOrderQty')} ({unit})</Text>
            <TextInput
              style={styles.input}
              placeholder={`e.g. 50 (${unit})`}
              keyboardType="numeric"
              value={minOrderQty}
              onChangeText={setMinOrderQty}
            />

            {/* Price Negotiation Toggle */}
            <Pressable
              style={styles.toggleRow}
              onPress={() => setAllowNegotiation(!allowNegotiation)}
            >
              <View>
                <Text style={styles.toggleTitle}>{t('allowNegotiation')}</Text>
                <Text style={styles.toggleSub}>Buyers can propose an offer price</Text>
              </View>
              <Text style={styles.toggleValue}>{allowNegotiation ? '✅ Yes' : '❌ No'}</Text>
            </Pressable>

            {/* Calculation Card */}
            {totalValue > 0 && (
              <View style={styles.calcCard}>
                <Text style={styles.calcLabel}>{t('estimatedValue')}</Text>
                <Text style={styles.calcValue}>
                  {quantity} {unit} × ₹{pricePerUnit} = <Text style={styles.calcTotal}>₹{totalValue.toLocaleString('en-IN')}</Text>
                </Text>
              </View>
            )}
          </View>
        )}

        {/* STEP 3: QUALITY & HARVEST */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{t('listCropStep3')}</Text>

            <Text style={styles.inputLabel}>{t('quality')} *</Text>
            <View style={styles.chipRow}>
              {CROP_QUALITIES.map((q) => (
                <Pressable
                  key={q}
                  style={[styles.chip, quality === q && styles.chipActive]}
                  onPress={() => setQuality(q)}
                >
                  <Text style={[styles.chipText, quality === q && styles.chipTextActive]}>
                    ⭐ {q}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.inputLabel}>{t('farmingMethod')}</Text>
            <View style={styles.chipRow}>
              {(['Conventional', 'Organic', 'Natural'] as CropFarmingMethod[]).map((m) => (
                <Pressable
                  key={m}
                  style={[styles.chip, farmingMethod === m && styles.chipActive]}
                  onPress={() => setFarmingMethod(m)}
                >
                  <Text style={[styles.chipText, farmingMethod === m && styles.chipTextActive]}>
                    {m === 'Organic' ? '🌿 Organic' : m}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.inputLabel}>{t('harvestDate')} *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD (e.g. 2026-09-30)"
              value={harvestDate}
              onChangeText={setHarvestDate}
            />
          </View>
        )}

        {/* STEP 4: FARM LOCATION */}
        {step === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{t('listCropStep4')}</Text>

            <View style={styles.locationCard}>
              <Text style={styles.locationTitle}>📍 Saved Farm Location</Text>
              <Text style={styles.locationDetail}>
                Village: {farm.village || 'N/A'}
              </Text>
              <Text style={styles.locationDetail}>
                Taluk / District: {farm.taluk}, {farm.district}
              </Text>
              <Text style={styles.locationDetail}>
                State & Pincode: {farm.state} - {farm.pincode}
              </Text>
              <Text style={styles.locationSub}>
                Buyers will view this location to calculate transport & pickup distance.
              </Text>
            </View>
          </View>
        )}

        {/* STEP 5: PHOTOS & DESCRIPTION */}
        {step === 5 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{t('listCropStep5')}</Text>

            <Text style={styles.inputLabel}>Crop Icon / Photo Placeholder</Text>
            <View style={styles.emojiPickRow}>
              {['🧅', '🍅', '🌾', '🌽', '🌶️', '🥔', '🥥', '🥦', '🍏'].map((emoji) => (
                <Pressable
                  key={emoji}
                  style={[styles.emojiBox, images[0] === emoji && styles.emojiBoxActive]}
                  onPress={() => setImages([emoji])}
                >
                  <Text style={styles.emojiPick}>{emoji}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.inputLabel}>{t('cropDescription')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add details about drying, packaging, storage condition, and ready pickup dates..."
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />

            <Text style={styles.inputLabel}>{t('preferredBuyer')}</Text>
            <View style={styles.chipRow}>
              {(['any', 'wholesaler', 'trader', 'retailer', 'exporter'] as PreferredBuyerType[]).map((b) => (
                <Pressable
                  key={b}
                  style={[styles.chip, preferredBuyer === b && styles.chipActive]}
                  onPress={() => setPreferredBuyer(b)}
                >
                  <Text style={[styles.chipText, preferredBuyer === b && styles.chipTextActive]}>
                    {b.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* STEP 6: REVIEW & PUBLISH */}
        {step === 6 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{t('listCropStep6')}</Text>

            <View style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewEmoji}>{images[0] || '🌾'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewName}>{cropName}</Text>
                  <Text style={styles.reviewVariety}>{variety || 'Standard Variety'}</Text>
                </View>
              </View>

              <View style={styles.reviewDivider} />

              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Quantity Available:</Text>
                <Text style={styles.reviewValue}>{quantity} {unit}</Text>
              </View>

              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Expected Price:</Text>
                <Text style={styles.reviewValue}>₹{pricePerUnit} / {unit}</Text>
              </View>

              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Min Order Quantity:</Text>
                <Text style={styles.reviewValue}>{minOrderQty || '1'} {unit}</Text>
              </View>

              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Quality & Method:</Text>
                <Text style={styles.reviewValue}>{quality} · {farmingMethod}</Text>
              </View>

              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Harvest Date:</Text>
                <Text style={styles.reviewValue}>{harvestDate}</Text>
              </View>

              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Negotiable:</Text>
                <Text style={styles.reviewValue}>{allowNegotiation ? 'Yes' : 'No (Fixed Price)'}</Text>
              </View>

              <View style={styles.reviewDivider} />

              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Est. Total Value:</Text>
                <Text style={styles.reviewTotal}>₹{totalValue.toLocaleString('en-IN')}</Text>
              </View>
            </View>

            <Pressable style={styles.publishBtn} onPress={() => handlePublish(false)}>
              <Text style={styles.publishBtnText}>🚀 {t('publishListing')}</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Navigation Footer Controls */}
      <View style={styles.footer}>
        {step < 6 ? (
          <Pressable style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>{t('next')} →</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.draftFooterBtn} onPress={() => handlePublish(true)}>
            <Text style={styles.draftFooterText}>{t('saveDraft')}</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: spacing.xs,
  },
  backText: {
    fontFamily: font.medium,
    fontSize: 14,
    color: colors.primary,
  },
  headerTitle: {
    fontFamily: font.bold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  draftText: {
    fontFamily: font.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.s,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  progressDot: {
    width: 24,
    height: 6,
    borderRadius: radius.xs,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.primarySoft,
  },
  progressDotCurrent: {
    backgroundColor: colors.primary,
    width: 32,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.m,
  },
  stepContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    padding: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  stepTitle: {
    fontFamily: font.bold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.m,
  },
  quickPickSection: {
    backgroundColor: colors.surfaceVariant,
    padding: spacing.s,
    borderRadius: radius.s,
    marginBottom: spacing.m,
  },
  inputLabel: {
    fontFamily: font.bold,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    marginTop: spacing.s,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: radius.s,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.m,
    height: 48,
    fontFamily: font.regular,
    fontSize: 14,
    color: colors.textPrimary,
  },
  textArea: {
    height: 90,
    paddingTop: spacing.s,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
    marginBottom: spacing.s,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.s,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    gap: spacing.xs,
  },
  chipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  chipEmoji: {
    fontSize: 16,
  },
  chipText: {
    fontFamily: font.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  chipTextActive: {
    fontFamily: font.bold,
    color: colors.primary,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    padding: spacing.m,
    borderRadius: radius.s,
    marginVertical: spacing.m,
  },
  toggleTitle: {
    fontFamily: font.bold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  toggleSub: {
    fontFamily: font.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  toggleValue: {
    fontFamily: font.bold,
    fontSize: 14,
    color: colors.primary,
  },
  calcCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: radius.s,
    padding: spacing.m,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  calcLabel: {
    fontFamily: font.regular,
    fontSize: 12,
    color: '#2E7D32',
  },
  calcValue: {
    fontFamily: font.medium,
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: 2,
  },
  calcTotal: {
    fontFamily: font.bold,
    fontSize: 18,
    color: '#1B5E20',
  },
  locationCard: {
    backgroundColor: colors.surfaceVariant,
    padding: spacing.m,
    borderRadius: radius.s,
    gap: spacing.xs,
  },
  locationTitle: {
    fontFamily: font.bold,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  locationDetail: {
    fontFamily: font.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  locationSub: {
    fontFamily: font.regular,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: spacing.s,
  },
  emojiPickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
    marginVertical: spacing.s,
  },
  emojiBox: {
    width: 48,
    height: 48,
    borderRadius: radius.s,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiBoxActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  emojiPick: {
    fontSize: 24,
  },
  reviewCard: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.s,
    padding: spacing.m,
    marginBottom: spacing.l,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  reviewEmoji: {
    fontSize: 36,
  },
  reviewName: {
    fontFamily: font.bold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  reviewVariety: {
    fontFamily: font.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  reviewDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.m,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.s,
  },
  reviewLabel: {
    fontFamily: font.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  reviewValue: {
    fontFamily: font.medium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  reviewTotal: {
    fontFamily: font.bold,
    fontSize: 18,
    color: colors.primary,
  },
  publishBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.s,
    paddingVertical: spacing.m,
    alignItems: 'center',
  },
  publishBtnText: {
    fontFamily: font.bold,
    fontSize: 16,
    color: colors.surface,
  },
  footer: {
    padding: spacing.m,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  nextBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.s,
    paddingVertical: spacing.m,
    alignItems: 'center',
  },
  nextBtnText: {
    fontFamily: font.bold,
    fontSize: 16,
    color: colors.surface,
  },
  draftFooterBtn: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.s,
    paddingVertical: spacing.m,
    alignItems: 'center',
  },
  draftFooterText: {
    fontFamily: font.bold,
    fontSize: 14,
    color: colors.textPrimary,
  },
});
