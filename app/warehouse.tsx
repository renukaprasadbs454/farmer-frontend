import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ScreenContainer } from '../src/components/ScreenContainer';
import { colors, font, radius, spacing } from '../src/constants/theme';
import { useFarmerStore } from '../src/store/farmerStore';
import {
  fetchWarehouseListingsApi,
  bookWarehouseSpaceApi,
  fetchMyWarehouseBookingsApi,
} from '../src/services/financeService';

export default function WarehouseScreen() {
  const router = useRouter();
  const { farmer, farm } = useFarmerStore();

  const [activeTab, setActiveTab] = useState<'facilities' | 'myBookings'>('facilities');
  const [facilities, setFacilities] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Space Calculator State
  const [calcSqFt, setCalcSqFt] = useState('500');
  const [calcDays, setCalcDays] = useState('30');
  const [selectedFacility, setSelectedFacility] = useState<any | null>(null);

  // Booking Modal
  const [bookModalVisible, setBookModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applicantName, setApplicantName] = useState(farmer.name || '');
  const [applicantPhone, setApplicantPhone] = useState(farmer.mobile || '');
  const [cropType, setCropType] = useState('Onion / Potato');
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'DAILY'>('MONTHLY');
  const [requestedSqFt, setRequestedSqFt] = useState('500');
  const [durationDays, setDurationDays] = useState('30');

  const loadWarehouses = async () => {
    setLoading(true);
    try {
      const [facData, myBookData] = await Promise.all([
        fetchWarehouseListingsApi(),
        fetchMyWarehouseBookingsApi(),
      ]);
      setFacilities(facData);
      setMyBookings(myBookData);
      if (facData.length > 0) {
        setSelectedFacility(facData[0]);
      }
    } catch (e) {
      console.warn('Warehouse screen error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  const activeFac = selectedFacility || facilities[0];
  const sqftNum = parseFloat(calcSqFt) || 100;
  const daysNum = parseInt(calcDays, 10) || 30;
  const isMonthly = daysNum >= 30;
  const estimatedRent = isMonthly
    ? Math.round(sqftNum * (activeFac?.rentPerSqFtMonth || 30) * Math.ceil(daysNum / 30))
    : Math.round(sqftNum * (activeFac?.rentPerSqFtDay || 1.2) * daysNum);

  const handleOpenBook = (fac: any) => {
    setSelectedFacility(fac);
    setApplicantName(farmer.name || '');
    setApplicantPhone(farmer.mobile || '');
    setRequestedSqFt(calcSqFt || '500');
    setDurationDays(calcDays || '30');
    setBillingCycle(parseInt(calcDays, 10) >= 30 ? 'MONTHLY' : 'DAILY');
    setBookModalVisible(true);
  };

  const handleConfirmBooking = async () => {
    if (!applicantName || !applicantPhone || !requestedSqFt) {
      alert('Please fill in applicant name, mobile number, and requested space.');
      return;
    }

    setSubmitting(true);
    try {
      const days = parseInt(durationDays, 10) || 30;
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);

      const res = await bookWarehouseSpaceApi({
        warehouseListingId: activeFac?.id,
        applicantName,
        applicantPhone,
        cropType,
        requestedSqFt: parseFloat(requestedSqFt),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        billingCycle,
      });

      if (res.success) {
        alert('🎉 Storage reservation submitted! The warehouse manager will inspect available chamber bays and assign your bay slot.');
        setBookModalVisible(false);
        loadWarehouses();
        setActiveTab('myBookings');
      } else {
        alert(res.message || 'Failed to submit reservation');
      }
    } catch (err: any) {
      alert(err.message || 'Error submitting booking');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll={false}>
      {/* Top Header */}
      <View style={s.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </Pressable>
        <Text style={s.headerTitle}>Warehouse Rental</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Banner */}
      <View style={s.bannerCard}>
        <Text style={s.bannerTag}>🏬 Cold Storage & Godowns</Text>
        <Text style={s.bannerTitle}>Rent Storage Space as a Service</Text>
        <Text style={s.bannerSubtitle}>
          Reserve temperature-controlled cold chambers (0°C to 4°C) or scientific grain godowns by square foot. Prevent distress sales at peak harvest.
        </Text>
      </View>

      {/* Tab Switcher */}
      <View style={s.tabRow}>
        <Pressable
          onPress={() => setActiveTab('facilities')}
          style={[s.tabBtn, activeTab === 'facilities' && s.activeTabBtn]}
        >
          <Text style={[s.tabText, activeTab === 'facilities' && s.activeTabText]}>
            Nearby Warehouses ({facilities.length})
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('myBookings')}
          style={[s.tabBtn, activeTab === 'myBookings' && s.activeTabBtn]}
        >
          <Text style={[s.tabText, activeTab === 'myBookings' && s.activeTabText]}>
            My Storage Passes ({myBookings.length})
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={s.centerBox}>
          <ActivityIndicator size="large" color="#0D9488" />
          <Text style={s.mutedText}>Locating certified warehouses in your district...</Text>
        </View>
      ) : activeTab === 'facilities' ? (
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
          {/* Storage Rent Estimator Card */}
          <View style={s.calcCard}>
            <Text style={s.calcTitle}>📐 Storage Cost & Space Calculator</Text>
            <View style={s.calcRow}>
              <View style={s.inputWrap}>
                <Text style={s.inputLabel}>Space Needed (Sq. Ft.)</Text>
                <TextInput
                  value={calcSqFt}
                  onChangeText={setCalcSqFt}
                  keyboardType="numeric"
                  style={s.calcInput}
                />
              </View>
              <View style={s.inputWrap}>
                <Text style={s.inputLabel}>Storage Days</Text>
                <TextInput
                  value={calcDays}
                  onChangeText={setCalcDays}
                  keyboardType="numeric"
                  style={s.calcInput}
                />
              </View>
            </View>

            <View style={s.calcResultRow}>
              <View>
                <Text style={s.resLabel}>Estimated Total Rent</Text>
                <Text style={s.resVal}>₹{estimatedRent.toLocaleString()}</Text>
                <Text style={s.subRateText}>
                  Based on ₹{isMonthly ? activeFac?.rentPerSqFtMonth : activeFac?.rentPerSqFtDay}/sq.ft {isMonthly ? 'monthly' : 'daily'}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.resLabel}>Capacity Availability</Text>
                <Text style={s.availVal}>
                  {activeFac?.availableCapacitySqFt?.toLocaleString()} sq.ft. Free
                </Text>
              </View>
            </View>
          </View>

          {/* Facility Cards */}
          <Text style={s.sectionHeader}>Verified Facilities in Mandya & Nearby</Text>
          {facilities.map((fac) => (
            <View key={fac.id} style={s.facilityCard}>
              <View style={s.facTop}>
                <View style={{ flex: 1 }}>
                  <Text style={s.facCategory}>{fac.warehouseType?.replace(/_/g, ' ')}</Text>
                  <Text style={s.facTitle}>{fac.name}</Text>
                  <Text style={s.facLocation}>📍 {fac.location}, {fac.district}</Text>
                </View>
                {fac.temperatureRange && (
                  <View style={s.tempBadge}>
                    <Text style={s.tempText}>❄️ {fac.temperatureRange}</Text>
                  </View>
                )}
              </View>

              {/* Tariffs & Capacity */}
              <View style={s.specRow}>
                <View style={s.specCol}>
                  <Text style={s.specLabel}>Daily Rate</Text>
                  <Text style={s.specVal}>₹{fac.rentPerSqFtDay}/sq.ft</Text>
                </View>
                <View style={s.specCol}>
                  <Text style={s.specLabel}>Monthly Rate</Text>
                  <Text style={[s.specVal, { color: '#0D9488' }]}>₹{fac.rentPerSqFtMonth}/sq.ft</Text>
                </View>
                <View style={s.specCol}>
                  <Text style={s.specLabel}>Available Space</Text>
                  <Text style={s.specVal}>{fac.availableCapacitySqFt?.toLocaleString()} sq.ft</Text>
                </View>
              </View>

              <View style={s.amenitiesRow}>
                {fac.features?.map((f: string, idx: number) => (
                  <Text key={idx} style={s.amenityBadge}>✓ {f}</Text>
                ))}
              </View>

              <Pressable
                onPress={() => handleOpenBook(fac)}
                style={({ pressed }) => [s.bookBtn, pressed && { opacity: 0.85 }]}
              >
                <Text style={s.bookBtnText}>Reserve Storage Space →</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      ) : (
        /* My Bookings Tab */
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
          {myBookings.length === 0 ? (
            <View style={s.emptyBox}>
              <Text style={s.emptyEmoji}>🏬</Text>
              <Text style={s.emptyTitle}>No Storage Reservations Yet</Text>
              <Text style={s.emptySubtitle}>
                Rent space in nearby cold storages or godowns to preserve your harvest quality and wait for premium mandi price windows.
              </Text>
              <Pressable onPress={() => setActiveTab('facilities')} style={s.exploreBtn}>
                <Text style={s.exploreBtnText}>Browse Available Storages</Text>
              </Pressable>
            </View>
          ) : (
            myBookings.map((b) => (
              <View key={b.id} style={s.myAppCard}>
                <View style={s.myAppHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.myAppTitle}>{b.warehouseListing?.name || 'Warehouse Storage'}</Text>
                    <Text style={s.myAppBank}>Crop: {b.cropType} · {b.requestedSqFt} Sq. Ft.</Text>
                  </View>
                  <View style={[s.statusTag, b.status === 'APPROVED' ? s.approvedTag : s.pendingTag]}>
                    <Text style={[s.statusText, b.status === 'APPROVED' ? s.approvedText : s.pendingText]}>
                      {b.status === 'APPROVED' ? 'ASSIGNED' : b.status}
                    </Text>
                  </View>
                </View>

                {b.assignedBayNumber ? (
                  <View style={s.bayPassCard}>
                    <Text style={s.bayPassTitle}>🎫 Verified Storage Bay Pass</Text>
                    <Text style={s.bayNumber}>{b.assignedBayNumber}</Text>
                    <Text style={s.bayInstruct}>Present this digital pass at the warehouse gate for produce intake.</Text>
                  </View>
                ) : (
                  <View style={s.awaitingBayCard}>
                    <Text style={s.awaitingBayText}>⏳ Warehouse manager is assigning your specific storage chamber bay...</Text>
                  </View>
                )}

                <View style={s.myAppDetails}>
                  <View style={s.detailCol}>
                    <Text style={s.detailLabel}>Duration</Text>
                    <Text style={s.detailVal}>{b.totalDays} Days</Text>
                  </View>
                  <View style={s.detailCol}>
                    <Text style={s.detailLabel}>Estimated Rent</Text>
                    <Text style={s.detailVal}>₹{b.totalRentEstimate?.toLocaleString()}</Text>
                  </View>
                  <View style={s.detailCol}>
                    <Text style={s.detailLabel}>Dates</Text>
                    <Text style={s.detailVal}>
                      {new Date(b.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Booking Modal */}
      <Modal visible={bookModalVisible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <View style={s.modalTop}>
              <Text style={s.modalTitle}>Book Space in {activeFac?.name}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Close storage booking" onPress={() => setBookModalVisible(false)} style={s.modalClose}>
                <Text style={s.modalCloseText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <Text style={s.formLabel}>Applicant Farmer Name *</Text>
              <TextInput
                value={applicantName}
                onChangeText={setApplicantName}
                style={s.formInput}
              />

              <Text style={s.formLabel}>Mobile Number *</Text>
              <TextInput
                value={applicantPhone}
                onChangeText={setApplicantPhone}
                keyboardType="phone-pad"
                style={s.formInput}
              />

              <View style={s.formRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={s.formLabel}>Space Needed (Sq. Ft.) *</Text>
                  <TextInput
                    value={requestedSqFt}
                    onChangeText={setRequestedSqFt}
                    keyboardType="numeric"
                    style={s.formInput}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.formLabel}>Storage Duration (Days)</Text>
                  <TextInput
                    value={durationDays}
                    onChangeText={setDurationDays}
                    keyboardType="numeric"
                    style={s.formInput}
                  />
                </View>
              </View>

              <Text style={s.formLabel}>Crop / Produce To Store *</Text>
              <TextInput
                value={cropType}
                onChangeText={setCropType}
                placeholder="e.g. Onion, Potato, Apples, Grains"
                style={s.formInput}
              />

              <View style={s.modalSummary}>
                <View style={s.summaryRow}>
                  <Text style={s.summaryLabel}>Facility Tariff:</Text>
                  <Text style={s.summaryVal}>₹{billingCycle === 'MONTHLY' ? activeFac?.rentPerSqFtMonth : activeFac?.rentPerSqFtDay}/sq.ft ({billingCycle.toLowerCase()})</Text>
                </View>
                <View style={s.summaryRow}>
                  <Text style={s.summaryLabel}>Estimated Total Rent:</Text>
                  <Text style={[s.summaryVal, { color: '#0D9488' }]}>₹{estimatedRent.toLocaleString()}</Text>
                </View>
              </View>

              <Text style={s.guaranteeNote}>
                🔒 24/7 CCTV surveillance, diesel generator backup, and in-transit goods insurance included with booking.
              </Text>
            </ScrollView>

            <Pressable
              onPress={handleConfirmBooking}
              disabled={submitting}
              style={[s.submitBtn, submitting && { opacity: 0.7 }]}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.submitBtnText}>Confirm Space Reservation</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  backBtn: {
    padding: spacing.xs,
  },
  backText: {
    color: '#0D9488',
    fontSize: font.body,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: font.title,
    fontWeight: '800',
    color: colors.ink,
  },
  bannerCard: {
    backgroundColor: '#115E59',
    borderRadius: radius.l,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  bannerTag: {
    fontSize: font.small,
    color: '#99F6E4',
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: font.subtitle,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: font.small,
    color: '#CCFBF1',
    lineHeight: 18,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: radius.full,
    padding: 4,
    marginVertical: spacing.sm,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radius.full,
  },
  activeTabBtn: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  tabText: {
    fontSize: font.label,
    fontWeight: '600',
    color: colors.muted,
  },
  activeTabText: {
    fontWeight: '800',
    color: colors.ink,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  calcCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.m,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: spacing.xs,
  },
  calcTitle: {
    fontSize: font.body,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  calcRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputWrap: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
    marginBottom: 4,
  },
  calcInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: radius.s,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: font.body,
    fontWeight: '700',
    color: colors.ink,
  },
  calcResultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  resLabel: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '600',
  },
  resVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0D9488',
  },
  subRateText: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 2,
  },
  availVal: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.ink,
  },
  sectionHeader: {
    fontSize: font.body,
    fontWeight: '800',
    color: colors.ink,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  facilityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.m,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: spacing.xs,
  },
  facTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  facCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
  },
  facTitle: {
    fontSize: font.body,
    fontWeight: '800',
    color: colors.ink,
    marginTop: 2,
  },
  facLocation: {
    fontSize: font.small,
    color: colors.muted,
    marginTop: 2,
  },
  tempBadge: {
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  tempText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F766E',
  },
  specRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: radius.s,
    padding: spacing.sm,
    marginVertical: spacing.sm,
    justifyContent: 'space-between',
  },
  specCol: {
    alignItems: 'center',
    flex: 1,
  },
  specLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
  },
  specVal: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.ink,
    marginTop: 2,
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: spacing.sm,
  },
  amenityBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0F766E',
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bookBtn: {
    backgroundColor: '#0D9488',
    borderRadius: radius.s,
    paddingVertical: 12,
    alignItems: 'center',
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: font.label,
    fontWeight: '800',
  },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.l,
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    fontSize: font.subtitle,
    fontWeight: '800',
    color: colors.ink,
  },
  emptySubtitle: {
    fontSize: font.small,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 280,
  },
  exploreBtn: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radius.full,
    marginTop: spacing.md,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: font.label,
  },
  myAppCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.m,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: spacing.xs,
  },
  myAppHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  myAppTitle: {
    fontSize: font.body,
    fontWeight: '800',
    color: colors.ink,
  },
  myAppBank: {
    fontSize: font.small,
    color: '#0D9488',
    fontWeight: '600',
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  approvedTag: {
    backgroundColor: '#ECFDF5',
  },
  pendingTag: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  approvedText: {
    color: '#065F46',
  },
  pendingText: {
    color: '#92400E',
  },
  bayPassCard: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: radius.s,
    padding: spacing.sm,
    marginVertical: spacing.sm,
    alignItems: 'center',
  },
  bayPassTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F766E',
    textTransform: 'uppercase',
  },
  bayNumber: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: '#0D9488',
    marginVertical: 2,
  },
  bayInstruct: {
    fontSize: 10,
    color: colors.muted,
  },
  awaitingBayCard: {
    backgroundColor: '#FFFBEB',
    padding: 8,
    borderRadius: radius.s,
    marginVertical: spacing.sm,
  },
  awaitingBayText: {
    fontSize: 11,
    color: '#92400E',
    textAlign: 'center',
  },
  myAppDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  detailCol: {},
  detailLabel: {
    fontSize: 10,
    color: colors.muted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: radius.l,
    borderTopRightRadius: radius.l,
    padding: spacing.md,
  },
  modalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: font.subtitle,
    fontWeight: '800',
    color: colors.ink,
  },
  modalClose: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 18,
    color: colors.muted,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.ink,
    marginTop: 8,
    marginBottom: 4,
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: radius.s,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: font.body,
    color: colors.ink,
  },
  formRow: {
    flexDirection: 'row',
  },
  modalSummary: {
    backgroundColor: '#F0FDFA',
    padding: spacing.sm,
    borderRadius: radius.s,
    marginTop: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.muted,
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
  },
  guaranteeNote: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 12,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  submitBtn: {
    backgroundColor: '#0D9488',
    borderRadius: radius.s,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: font.button,
    fontWeight: '800',
  },
  centerBox: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  mutedText: {
    color: colors.muted,
    fontSize: font.small,
    marginTop: spacing.xs,
  },
});
