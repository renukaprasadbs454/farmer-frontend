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
import { fetchLoanOffersApi, applyForLoanApi, fetchMyLoanApplicationsApi } from '../src/services/financeService';

export default function LoansScreen() {
  const router = useRouter();
  const { farmer, farm, crops } = useFarmerStore();

  const [activeTab, setActiveTab] = useState<'schemes' | 'myLoans'>('schemes');
  const [offers, setOffers] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculator State
  const [calcAmount, setCalcAmount] = useState('100000');
  const [calcMonths, setCalcMonths] = useState('12');
  const [calcRate, setCalcRate] = useState(4.0);

  // Application Modal
  const [selectedOffer, setSelectedOffer] = useState<any | null>(null);
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [applicantName, setApplicantName] = useState(farmer.name || '');
  const [applicantPhone, setApplicantPhone] = useState(farmer.mobile || '');
  const [amountRequested, setAmountRequested] = useState('100000');
  const [tenureMonths, setTenureMonths] = useState('12');
  const [cropName, setCropName] = useState(crops?.[0] || 'Sugarcane');
  const [landArea, setLandArea] = useState(String(farm.cultivatedLand || '3.5'));
  const [surveyNumber, setSurveyNumber] = useState('');
  const [purpose, setPurpose] = useState('Seeds, fertilizer, and crop cultivation working capital');

  const loadLoans = async () => {
    setLoading(true);
    try {
      const [offersData, myAppsData] = await Promise.all([
        fetchLoanOffersApi(),
        fetchMyLoanApplicationsApi(),
      ]);
      setOffers(offersData);
      setMyApplications(myAppsData);
    } catch (e) {
      console.warn('Loan screen error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, []);

  // Simple EMI Formula: [P x R x (1+R)^N]/[(1+R)^N-1]
  const P = parseFloat(calcAmount) || 0;
  const N = parseInt(calcMonths, 10) || 12;
  const monthlyRate = calcRate / 12 / 100;
  const emi =
    P > 0 && monthlyRate > 0
      ? Math.round((P * monthlyRate * Math.pow(1 + monthlyRate, N)) / (Math.pow(1 + monthlyRate, N) - 1))
      : Math.round(P / N);
  const totalInterest = emi * N - P;

  const handleOpenApply = (offer: any) => {
    setSelectedOffer(offer);
    setCalcRate(offer.interestRatePercent || 4.0);
    setAmountRequested(String(offer.minAmount ? Math.max(offer.minAmount, 50000) : 100000));
    setTenureMonths(String(offer.tenureMonthsMin || 12));
    setApplicantName(farmer.name || '');
    setApplicantPhone(farmer.mobile || '');
    setApplyModalVisible(true);
  };

  const handleSubmitApplication = async () => {
    if (!applicantName || !applicantPhone || !amountRequested) {
      alert('Please fill in applicant name, mobile number, and loan amount.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await applyForLoanApi({
        loanOfferId: selectedOffer?.id || offers[0]?.id,
        applicantName,
        applicantPhone,
        loanType: selectedOffer?.loanType || 'CROP_LOAN',
        amountRequested: parseFloat(amountRequested),
        tenureMonths: parseInt(tenureMonths, 10),
        purpose,
        landAreaAcres: parseFloat(landArea) || 1.0,
        cropName,
        surveyNumber,
        village: farm.village || 'Mandya Rural',
        district: farm.district || 'Mandya',
        state: farm.state || 'Karnataka',
      });

      if (res.success) {
        alert('🎉 Loan application submitted successfully! Our agricultural field officer will verify your land title.');
        setApplyModalVisible(false);
        loadLoans();
        setActiveTab('myLoans');
      } else {
        alert(res.message || 'Failed to submit application');
      }
    } catch (err: any) {
      alert(err.message || 'Error submitting application');
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
        <Text style={s.headerTitle}>Crop & Land Loans</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Banner */}
      <View style={s.bannerCard}>
        <Text style={s.bannerTag}>🌾 Subsidized Agri Credit</Text>
        <Text style={s.bannerTitle}>Kisan Credit & Farm Mortgage</Text>
        <Text style={s.bannerSubtitle}>
          Low-interest credit lines up to ₹15 Lakhs backed by SBI, NABARD, and nationalized rural banks with 3% prompt repayment subsidy.
        </Text>
      </View>

      {/* Tab Switcher */}
      <View style={s.tabRow}>
        <Pressable
          onPress={() => setActiveTab('schemes')}
          style={[s.tabBtn, activeTab === 'schemes' && s.activeTabBtn]}
        >
          <Text style={[s.tabText, activeTab === 'schemes' && s.activeTabText]}>
            Loan Offers ({offers.length})
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('myLoans')}
          style={[s.tabBtn, activeTab === 'myLoans' && s.activeTabBtn]}
        >
          <Text style={[s.tabText, activeTab === 'myLoans' && s.activeTabText]}>
            My Applications ({myApplications.length})
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={s.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={s.mutedText}>Fetching institutional loan offers...</Text>
        </View>
      ) : activeTab === 'schemes' ? (
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
          {/* Interactive EMI Calculator Card */}
          <View style={s.calcCard}>
            <Text style={s.calcTitle}>🧮 Interactive EMI & Subsidy Calculator</Text>
            <View style={s.calcRow}>
              <View style={s.inputWrap}>
                <Text style={s.inputLabel}>Loan Amount (₹)</Text>
                <TextInput
                  value={calcAmount}
                  onChangeText={setCalcAmount}
                  keyboardType="numeric"
                  style={s.calcInput}
                />
              </View>
              <View style={s.inputWrap}>
                <Text style={s.inputLabel}>Tenure (Months)</Text>
                <TextInput
                  value={calcMonths}
                  onChangeText={setCalcMonths}
                  keyboardType="numeric"
                  style={s.calcInput}
                />
              </View>
            </View>

            <View style={s.calcResultRow}>
              <View>
                <Text style={s.resLabel}>Estimated Monthly EMI</Text>
                <Text style={s.resVal}>₹{emi.toLocaleString()}/mo</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.resLabel}>Effective Rate (p.a.)</Text>
                <Text style={s.resRate}>{calcRate}% (Subsidized)</Text>
              </View>
            </View>
          </View>

          {/* Scheme Cards */}
          <Text style={s.sectionHeader}>Available Institutional Credit Schemes</Text>
          {offers.map((offer) => (
            <View key={offer.id} style={s.schemeCard}>
              <View style={s.schemeTop}>
                <View style={{ flex: 1 }}>
                  <Text style={s.schemeTitle}>{offer.title}</Text>
                  <Text style={s.providerText}>{offer.providerName}</Text>
                </View>
                <View style={s.rateBadge}>
                  <Text style={s.rateText}>{offer.interestRatePercent}% p.a.</Text>
                </View>
              </View>

              <Text style={s.schemeDesc}>{offer.description}</Text>

              <View style={s.specRow}>
                <View style={s.specCol}>
                  <Text style={s.specLabel}>Max Sanction</Text>
                  <Text style={s.specVal}>₹{(offer.maxAmount / 100000).toFixed(1)} Lakhs</Text>
                </View>
                <View style={s.specCol}>
                  <Text style={s.specLabel}>Tenure Window</Text>
                  <Text style={s.specVal}>{offer.tenureMonthsMin} - {offer.tenureMonthsMax} Mos</Text>
                </View>
                <View style={s.specCol}>
                  <Text style={s.specLabel}>Govt Subsidy</Text>
                  <Text style={[s.specVal, { color: colors.primary }]}>+{offer.subsidyPercent}% Rebate</Text>
                </View>
              </View>

              <Pressable
                onPress={() => handleOpenApply(offer)}
                style={({ pressed }) => [s.applyBtn, pressed && { opacity: 0.85 }]}
              >
                <Text style={s.applyBtnText}>Apply for this Loan →</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      ) : (
        /* My Applications Tab */
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
          {myApplications.length === 0 ? (
            <View style={s.emptyBox}>
              <Text style={s.emptyEmoji}>📋</Text>
              <Text style={s.emptyTitle}>No Loan Applications Yet</Text>
              <Text style={s.emptySubtitle}>
                Apply for a subsidized crop loan or land improvement mortgage. Your applications and approval status will appear here.
              </Text>
              <Pressable onPress={() => setActiveTab('schemes')} style={s.exploreBtn}>
                <Text style={s.exploreBtnText}>Browse Available Schemes</Text>
              </Pressable>
            </View>
          ) : (
            myApplications.map((app) => (
              <View key={app.id} style={s.myAppCard}>
                <View style={s.myAppHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.myAppTitle}>{app.loanOffer?.title || 'Crop Cultivation Loan'}</Text>
                    <Text style={s.myAppBank}>{app.loanOffer?.providerName}</Text>
                  </View>
                  <View style={[s.statusTag, app.status === 'APPROVED' ? s.approvedTag : s.pendingTag]}>
                    <Text style={[s.statusText, app.status === 'APPROVED' ? s.approvedText : s.pendingText]}>
                      {app.status}
                    </Text>
                  </View>
                </View>

                <View style={s.myAppDetails}>
                  <View style={s.detailCol}>
                    <Text style={s.detailLabel}>Requested Amount</Text>
                    <Text style={s.detailVal}>₹{app.amountRequested?.toLocaleString()}</Text>
                  </View>
                  <View style={s.detailCol}>
                    <Text style={s.detailLabel}>Tenure</Text>
                    <Text style={s.detailVal}>{app.tenureMonths} Months</Text>
                  </View>
                  <View style={s.detailCol}>
                    <Text style={s.detailLabel}>Crop & Land</Text>
                    <Text style={s.detailVal}>{app.cropName} ({app.landAreaAcres} Ac)</Text>
                  </View>
                </View>

                {app.adminRemarks ? (
                  <View style={s.remarkBox}>
                    <Text style={s.remarkText}>💬 Bank Officer: {app.adminRemarks}</Text>
                  </View>
                ) : null}
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Loan Application Modal */}
      <Modal visible={applyModalVisible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <View style={s.modalTop}>
              <Text style={s.modalTitle}>Apply for {selectedOffer?.title || 'Loan'}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Close loan application" onPress={() => setApplyModalVisible(false)} style={s.modalClose}>
                <Text style={s.modalCloseText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <Text style={s.formLabel}>Applicant Full Name *</Text>
              <TextInput
                value={applicantName}
                onChangeText={setApplicantName}
                style={s.formInput}
                placeholder="Farmer Name as on Aadhaar"
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
                  <Text style={s.formLabel}>Amount Needed (₹) *</Text>
                  <TextInput
                    value={amountRequested}
                    onChangeText={setAmountRequested}
                    keyboardType="numeric"
                    style={s.formInput}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.formLabel}>Tenure (Months)</Text>
                  <TextInput
                    value={tenureMonths}
                    onChangeText={setTenureMonths}
                    keyboardType="numeric"
                    style={s.formInput}
                  />
                </View>
              </View>

              <View style={s.formRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={s.formLabel}>Primary Crop</Text>
                  <TextInput
                    value={cropName}
                    onChangeText={setCropName}
                    style={s.formInput}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.formLabel}>Cultivated Acres</Text>
                  <TextInput
                    value={landArea}
                    onChangeText={setLandArea}
                    keyboardType="numeric"
                    style={s.formInput}
                  />
                </View>
              </View>

              <Text style={s.formLabel}>Pahani / Survey Number (RTC)</Text>
              <TextInput
                value={surveyNumber}
                onChangeText={setSurveyNumber}
                placeholder="e.g. Sy. No. 142/3A"
                style={s.formInput}
              />

              <Text style={s.formLabel}>Purpose of Loan</Text>
              <TextInput
                value={purpose}
                onChangeText={setPurpose}
                multiline
                numberOfLines={2}
                style={[s.formInput, { height: 60 }]}
              />

              <Text style={s.guaranteeNote}>
                🔒 Documents required for disbursement: Aadhaar Card, 7/12 Extract / Pahani, and Bank Passbook.
              </Text>
            </ScrollView>

            <Pressable
              onPress={handleSubmitApplication}
              disabled={submitting}
              style={[s.submitBtn, submitting && { opacity: 0.7 }]}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.submitBtnText}>Submit Loan Application</Text>
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
    color: colors.primary,
    fontSize: font.body,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: font.title,
    fontWeight: '800',
    color: colors.ink,
  },
  bannerCard: {
    backgroundColor: '#0B3F27',
    borderRadius: radius.l,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  bannerTag: {
    fontSize: font.small,
    color: '#86EFAC',
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
    color: '#D1FAE5',
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
    fontWeight: '800',
    color: colors.primary,
  },
  resRate: {
    fontSize: font.body,
    fontWeight: '800',
    color: '#059669',
  },
  sectionHeader: {
    fontSize: font.body,
    fontWeight: '800',
    color: colors.ink,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  schemeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.m,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: spacing.xs,
  },
  schemeTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  schemeTitle: {
    fontSize: font.body,
    fontWeight: '800',
    color: colors.ink,
  },
  providerText: {
    fontSize: font.small,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  rateBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  rateText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#065F46',
  },
  schemeDesc: {
    fontSize: font.small,
    color: colors.muted,
    marginVertical: spacing.xs,
    lineHeight: 18,
  },
  specRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: radius.s,
    padding: spacing.sm,
    marginVertical: spacing.xs,
    justifyContent: 'space-between',
  },
  specCol: {
    alignItems: 'center',
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
  applyBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.s,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  applyBtnText: {
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
    backgroundColor: colors.primary,
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
    color: colors.primary,
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
  myAppDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
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
  remarkBox: {
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: radius.s,
    marginTop: spacing.sm,
  },
  remarkText: {
    fontSize: 11,
    color: colors.muted,
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
  guaranteeNote: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 12,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  submitBtn: {
    backgroundColor: colors.primary,
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
