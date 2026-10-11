import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, radius, shadow, spacing } from '../../../src/constants/theme';
import { useT } from '../../../src/i18n';
import { useCropMarketplaceStore } from '../../../src/store/cropMarketplaceStore';
import { CropListing } from '../../../src/types';

import { useFarmerStore } from '../../../src/store/farmerStore';

export default function CropDetailScreen() {
  const t = useT();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    listings,
    myListings,
    sendPurchaseRequest,
    savedCropIds,
    toggleSaveCrop,
    addRecentlyViewedCrop,
  } = useCropMarketplaceStore();

  const [listing, setListing] = useState<CropListing | undefined>(undefined);
  const [requestModalVisible, setRequestModalVisible] = useState<boolean>(false);

  // Purchase Request Form state
  const [requestedQty, setRequestedQty] = useState<string>('');
  const [offerPrice, setOfferPrice] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [pickupDate, setPickupDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [deliveryRequired, setDeliveryRequired] = useState<boolean>(false);

  useEffect(() => {
    const all = [...listings, ...myListings];
    const found = all.find((l) => l.id === id);
    if (found) {
      setListing(found);
      setRequestedQty(String(Math.min(100, found.availableQuantity)));
      setOfferPrice(String(found.pricePerUnit));
      addRecentlyViewedCrop(found.id);
    }
  }, [id, listings, myListings]);

  if (!listing) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 40, fontFamily: font.bold }}>
          Crop Listing Not Found
        </Text>
      </SafeAreaView>
    );
  }

  const currentFarmerId = useFarmerStore.getState().accountId || 'farmer-me';
  const isSaved = savedCropIds.includes(listing.id);
  const isMine = listing.farmerId === currentFarmerId || listing.farmerId === 'farmer-current' || listing.farmerId === 'farmer-me';
  const isSoldOut = listing.availableQuantity === 0 || listing.status === 'sold';

  const reqQtyNum = Number(requestedQty) || 0;
  const offerPriceNum = Number(offerPrice) || listing.pricePerUnit;
  const estimatedAmount = reqQtyNum * offerPriceNum;

  const handleSendRequest = async () => {
    if (reqQtyNum <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity.');
      return;
    }
    if (reqQtyNum > listing.availableQuantity) {
      Alert.alert(
        'Quantity Exceeded',
        `Only ${listing.availableQuantity} ${listing.unit} is available.`,
      );
      return;
    }
    if (reqQtyNum < listing.minimumOrderQuantity) {
      Alert.alert(
        'Below Minimum Order',
        `Minimum order quantity is ${listing.minimumOrderQuantity} ${listing.unit}.`,
      );
      return;
    }

    const farmerState = useFarmerStore.getState();
    const buyerName = farmerState.farmer.name || 'Verified Buyer';
    const buyerLocation = [farmerState.farm.village, farmerState.farm.district, farmerState.farm.state].filter(Boolean).join(', ') || 'APMC Market';

    try {
      await sendPurchaseRequest({
        cropListingId: listing.id,
        cropName: listing.cropName,
        buyer: {
          id: farmerState.accountId || `buyer-${Date.now()}`,
          name: buyerName,
          type: 'Trader',
          location: buyerLocation,
          rating: 5.0,
          verified: true,
        },
        requestedQuantity: reqQtyNum,
        unit: listing.unit,
        offerPrice: offerPriceNum,
        totalEstimatedAmount: estimatedAmount,
        message: message || 'I am interested in purchasing your harvest.',
        pickupDate: pickupDate || new Date().toISOString().split('T')[0],
        deliveryRequired,
      });

      setRequestModalVisible(false);

      Alert.alert(
        'Purchase Request Sent! 📩',
        `Your offer of ₹${offerPriceNum}/${listing.unit} for ${reqQtyNum} ${listing.unit} has been sent to ${listing.farmerName}.`,
        [
          {
            text: 'View Requests',
            onPress: () => router.push('/market/sell/requests' as any),
          },
          { text: 'OK' },
        ],
      );
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← {t('back')}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{listing.cropName}</Text>
        <Pressable onPress={() => toggleSaveCrop(listing.id)}>
          <Text style={styles.heartText}>{isSaved ? '❤️' : '🤍'}</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Banner Image */}
        <View style={styles.bannerContainer}>
          <Text style={styles.bannerEmoji}>{listing.images[0] || '🌾'}</Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>{listing.status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Core Info */}
        <View style={styles.mainInfoCard}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.cropTitle}>{listing.cropName}</Text>
              <Text style={styles.varietyText}>{listing.variety}</Text>
            </View>
            <View style={styles.badgeCol}>
              <View style={styles.qualityBadge}>
                <Text style={styles.qualityText}>{listing.quality}</Text>
              </View>
              <View style={[styles.methodBadge, listing.farmingMethod === 'Organic' && styles.organicBadge]}>
                <Text style={[styles.methodText, listing.farmingMethod === 'Organic' && styles.organicText]}>
                  {listing.farmingMethod}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Pricing & Stock */}
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>{t('pricePerUnit')}</Text>
              <Text style={styles.priceValue}>
                ₹{listing.pricePerUnit} <Text style={styles.unitText}>/ {listing.unit}</Text>
              </Text>
              <Text style={styles.negText}>
                {listing.allowNegotiation ? `✅ ${t('negotiable')}` : `🔒 ${t('fixedPrice')}`}
              </Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.priceLabel}>{t('quantity')}</Text>
              <Text style={[styles.qtyValue, isSoldOut && styles.soldOutText]}>
                {isSoldOut ? t('soldOut') : `${listing.availableQuantity} ${listing.unit}`}
              </Text>
              <Text style={styles.minOrderText}>Min Order: {listing.minimumOrderQuantity} {listing.unit}</Text>
            </View>
          </View>
        </View>

        {/* Specifications Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📋 Harvest Specifications</Text>

          <View style={styles.specGrid}>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>Harvest Date</Text>
              <Text style={styles.specValue}>{listing.harvestDate}</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>Category</Text>
              <Text style={styles.specValue}>{listing.category.toUpperCase()}</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>Preferred Buyer</Text>
              <Text style={styles.specValue}>{listing.preferredBuyer.toUpperCase()}</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>Total Harvested</Text>
              <Text style={styles.specValue}>{listing.totalQuantity} {listing.unit}</Text>
            </View>
          </View>
        </View>

        {/* Farmer & Location Info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>👨‍🌾 Farmer Information</Text>
          <View style={styles.farmerRow}>
            <View style={styles.farmerAvatar}>
              <Text style={styles.farmerAvatarText}>👨‍🌾</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.farmerName}>{listing.farmerName}</Text>
              <Text style={styles.farmerLocation}>
                📍 {listing.location.label ? `${listing.location.label}, ` : ''}
                {listing.location.district}, {listing.location.state}
              </Text>

            </View>
            <Pressable
              style={styles.contactBtn}
              onPress={() => Alert.alert('Contact Farmer', `Call ${listing.farmerName} at ${listing.farmerMobile || '+91 98765 43210'}`)}
            >
              <Text style={styles.contactBtnText}>📞 {t('contact')}</Text>
            </Pressable>
          </View>
        </View>

        {/* Description & Notes */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📝 Description & Notes</Text>
          <Text style={styles.descriptionText}>{listing.description}</Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom CTA Bar */}
      <View style={styles.bottomBar}>
        {isMine ? (
          <Pressable
            style={styles.manageBtn}
            onPress={() => router.push('/market/sell' as any)}
          >
            <Text style={styles.manageBtnText}>⚙️ Manage My Listing</Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.requestBtn, isSoldOut && styles.disabledBtn]}
            disabled={isSoldOut}
            onPress={() => setRequestModalVisible(true)}
          >
            <Text style={styles.requestBtnText}>
              {isSoldOut ? t('soldOut') : `📩 Request via Admin Broker`}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Purchase Request Modal */}
      <Modal
        visible={requestModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRequestModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📩 Send Purchase Request</Text>
              <Pressable onPress={() => setRequestModalVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              <Text style={styles.inputLabel}>
                {t('quantityRequired')} ({listing.unit}) *
              </Text>
              <TextInput
                style={styles.modalInput}
                placeholder={`Max ${listing.availableQuantity} ${listing.unit}`}
                keyboardType="numeric"
                value={requestedQty}
                onChangeText={setRequestedQty}
              />

              <Text style={styles.inputLabel}>
                {t('offerPrice')} (₹/{listing.unit}) *
              </Text>
              <TextInput
                style={styles.modalInput}
                placeholder={`Expected ₹${listing.pricePerUnit}`}
                keyboardType="numeric"
                value={offerPrice}
                onChangeText={setOfferPrice}
              />

              <Text style={styles.inputLabel}>{t('pickupDate')} *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="YYYY-MM-DD"
                value={pickupDate}
                onChangeText={setPickupDate}
              />

              <Text style={styles.inputLabel}>Message to Farmer</Text>
              <TextInput
                style={[styles.modalInput, { height: 70 }]}
                placeholder="Add logistics, transport preferences..."
                multiline
                value={message}
                onChangeText={setMessage}
              />

              {/* Total Calculation Card */}
              <View style={styles.modalCalcCard}>
                <Text style={styles.calcLabel}>Estimated Total Amount:</Text>
                <Text style={styles.calcValue}>
                  {reqQtyNum} {listing.unit} × ₹{offerPriceNum} ={' '}
                  <Text style={styles.calcTotal}>₹{estimatedAmount.toLocaleString('en-IN')}</Text>
                </Text>
              </View>
            </ScrollView>

            <Pressable style={styles.submitModalBtn} onPress={handleSendRequest}>
              <Text style={styles.submitModalBtnText}>Send Offer via Admin Broker</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  heartText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.m,
    paddingBottom: spacing.xxl,
  },
  bannerContainer: {
    height: 140,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.m,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: spacing.m,
  },
  bannerEmoji: {
    fontSize: 64,
  },
  statusPill: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  statusPillText: {
    fontFamily: font.bold,
    fontSize: 10,
    color: colors.surface,
  },
  mainInfoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    padding: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.m,
    ...shadow.card,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cropTitle: {
    fontFamily: font.bold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  varietyText: {
    fontFamily: font.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badgeCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  qualityBadge: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  qualityText: {
    fontFamily: font.medium,
    fontSize: 11,
    color: colors.textPrimary,
  },
  methodBadge: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  organicBadge: {
    backgroundColor: '#E8F5E9',
  },
  methodText: {
    fontFamily: font.medium,
    fontSize: 11,
    color: colors.textSecondary,
  },
  organicText: {
    color: '#2E7D32',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.m,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontFamily: font.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  priceValue: {
    fontFamily: font.bold,
    fontSize: 22,
    color: colors.primary,
  },
  unitText: {
    fontFamily: font.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  negText: {
    fontFamily: font.medium,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  qtyValue: {
    fontFamily: font.bold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  soldOutText: {
    color: colors.error,
  },
  minOrderText: {
    fontFamily: font.regular,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    padding: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.m,
  },
  sectionTitle: {
    fontFamily: font.bold,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: spacing.s,
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  specBox: {
    width: '47%',
    backgroundColor: colors.surfaceVariant,
    padding: spacing.s,
    borderRadius: radius.s,
  },
  specLabel: {
    fontFamily: font.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  specValue: {
    fontFamily: font.bold,
    fontSize: 13,
    color: colors.textPrimary,
    marginTop: 2,
  },
  farmerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  farmerAvatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  farmerAvatarText: {
    fontSize: 20,
  },
  farmerName: {
    fontFamily: font.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  farmerLocation: {
    fontFamily: font.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  contactBtn: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: radius.s,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contactBtnText: {
    fontFamily: font.medium,
    fontSize: 12,
    color: colors.primary,
  },
  descriptionText: {
    fontFamily: font.regular,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  bottomBar: {
    padding: spacing.m,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  requestBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.s,
    paddingVertical: spacing.m,
    alignItems: 'center',
  },
  requestBtnText: {
    fontFamily: font.bold,
    fontSize: 16,
    color: colors.surface,
  },
  manageBtn: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.s,
    paddingVertical: spacing.m,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  manageBtnText: {
    fontFamily: font.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  disabledBtn: {
    backgroundColor: colors.disabled,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.l,
    borderTopRightRadius: radius.l,
    padding: spacing.m,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  modalTitle: {
    fontFamily: font.bold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  closeBtn: {
    fontSize: 20,
    color: colors.textMuted,
  },
  inputLabel: {
    fontFamily: font.bold,
    fontSize: 13,
    color: colors.textPrimary,
    marginTop: spacing.s,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderRadius: radius.s,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.m,
    height: 44,
    fontFamily: font.regular,
    fontSize: 14,
  },
  modalCalcCard: {
    backgroundColor: '#E8F5E9',
    padding: spacing.s,
    borderRadius: radius.s,
    marginVertical: spacing.m,
  },
  calcLabel: {
    fontFamily: font.regular,
    fontSize: 11,
    color: '#2E7D32',
  },
  calcValue: {
    fontFamily: font.medium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  calcTotal: {
    fontFamily: font.bold,
    fontSize: 16,
    color: '#1B5E20',
  },
  submitModalBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.s,
    paddingVertical: spacing.m,
    alignItems: 'center',
    marginTop: spacing.s,
  },
  submitModalBtnText: {
    fontFamily: font.bold,
    fontSize: 16,
    color: colors.surface,
  },
});
