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
  fetchInsuranceOffersApi,
  applyForInsuranceApi,
  fetchMyInsuranceApplicationsApi,
  fileInsuranceClaimApi,
} from '../src/services/financeService';

export default function InsuranceScreen() {
  const router = useRouter();
  const { farmer, farm } = useFarmerStore();

  const [activeTab, setActiveTab] = useState<'schemes' | 'myPolicies'>('schemes');
  const [offers, setOffers] = useState<any[]>([]);
  const [myPolicies, setMyPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Premium Estimator State
  const [estCrop, setEstCrop] = useState('Sugarcane');
  const [estAcres, setEstAcres] = useState(String(farm.cultivatedLand || '3.5'));
  const [selectedOffer, setSelectedOffer] = useState<any | null>(null);

  // Enrollment Modal
  const [enrollModalVisible, setEnrollModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applicantName, setApplicantName] = useState(farmer.name || '');
  const [applicantPhone, setApplicantPhone] = useState(farmer.mobile || '');
  const [surveyNumber, setSurveyNumber] = useState('');
  const [cropSeason, setCropSeason] = useState('Kharif');

  // Claim Filing Modal
  const [claimModalVisible, setClaimModalVisible] = useState(false);
  const [selectedPolicyForClaim, setSelectedPolicyForClaim] = useState<any | null>(null);
  const [calamityType, setCalamityType] = useState('Excess Rainfall / Waterlogging');
  const [damagePercent, setDamagePercent] = useState('50');
  const [damageDesc, setDamageDesc] = useState('');

  const loadInsurance = async () => {
    setLoading(true);
    try {
      const [offersData, myPolData] = await Promise.all([
        fetchInsuranceOffersApi(),
        fetchMyInsuranceApplicationsApi(),
      ]);
      setOffers(offersData);
      setMyPolicies(myPolData);
      if (offersData.length > 0) {
        setSelectedOffer(offersData[0]);
      }
    } catch (e) {
      console.warn('Insurance screen error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsurance();
  }, []);

  const acresNum = parseFloat(estAcres) || 1.0;
  const activeOffer = selectedOffer || offers[0];
  const sumInsured = (activeOffer?.sumInsuredPerAcre || 40000) * acresNum;
  const farmerPremium = Math.round(sumInsured * ((activeOffer?.premiumRatePercent || 2.0) / 100));
  const govtSubsidy = Math.round(sumInsured * 0.12); // Govts cover ~12-15% actuarial balance

  const handleOpenEnroll = (offer: any) => {
    setSelectedOffer(offer);
    setApplicantName(farmer.name || '');
    setApplicantPhone(farmer.mobile || '');
    setEnrollModalVisible(true);
  };

  const handleEnrollSubmit = async () => {
    if (!applicantName || !applicantPhone || !estCrop) {
      alert('Please fill in applicant name, mobile number, and crop.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await applyForInsuranceApi({
        policyOfferId: activeOffer?.id,
        applicantName,
        applicantPhone,
        cropName: estCrop,
        cropSeason,
        landAreaAcres: acresNum,
        surveyNumber,
      });

      if (res.success) {
        alert('🎉 Insurance enrollment submitted! Your subsidized premium has been logged and the policy certificate will be generated.');
        setEnrollModalVisible(false);
        loadInsurance();
        setActiveTab('myPolicies');
      } else {
        alert(res.message || 'Failed to submit enrollment');
      }
    } catch (err: any) {
      alert(err.message || 'Error submitting insurance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenClaim = (policy: any) => {
    setSelectedPolicyForClaim(policy);
    setClaimModalVisible(true);
  };

  const handleSubmitClaim = async () => {
    if (!selectedPolicyForClaim) return;
    setSubmitting(true);
    try {
      const res = await fileInsuranceClaimApi(selectedPolicyForClaim.id, {
        calamityType,
        damagePercent: parseFloat(damagePercent) || 50,
        damageDescription: damageDesc || 'Crop damage due to adverse weather event',
      });

      if (res.success) {
        alert('🛡️ Crop loss intimation filed successfully! An insurance surveyor has been alerted to inspect your field.');
        setClaimModalVisible(false);
        loadInsurance();
      } else {
        alert(res.message || 'Failed to file claim');
      }
    } catch (err: any) {
      alert(err.message || 'Error filing claim');
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
        <Text style={s.headerTitle}>Crop Insurance</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Banner */}
      <View style={s.bannerCard}>
        <Text style={s.bannerTag}>🛡️ Pradhan Mantri Fasal Bima</Text>
        <Text style={s.bannerTitle}>Comprehensive Crop Shield</Text>
        <Text style={s.bannerSubtitle}>
          Insulate your harvest against drought, unseasonal rains, pest epidemics, and hailstorms with maximum 2% subsidized farmer premium.
        </Text>
      </View>

      {/* Tab Switcher */}
      <View style={s.tabRow}>
        <Pressable
          onPress={() => setActiveTab('schemes')}
          style={[s.tabBtn, activeTab === 'schemes' && s.activeTabBtn]}
        >
          <Text style={[s.tabText, activeTab === 'schemes' && s.activeTabText]}>
            Policy Schemes ({offers.length})
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('myPolicies')}
          style={[s.tabBtn, activeTab === 'myPolicies' && s.activeTabBtn]}
        >
          <Text style={[s.tabText, activeTab === 'myPolicies' && s.activeTabText]}>
            My Policies & Claims ({myPolicies.length})
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={s.centerBox}>
          <ActivityIndicator size="large" color="#1D4ED8" />
          <Text style={s.mutedText}>Fetching government & private crop schemes...</Text>
        </View>
      ) : activeTab === 'schemes' ? (
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
          {/* Live Premium Calculator Card */}
          <View style={s.calcCard}>
            <Text style={s.calcTitle}>🌦️ Subsidized Premium Calculator</Text>
            <View style={s.calcRow}>
              <View style={s.inputWrap}>
                <Text style={s.inputLabel}>Crop Name</Text>
                <TextInput
                  value={estCrop}
                  onChangeText={setEstCrop}
                  style={s.calcInput}
                  placeholder="e.g. Onion, Sugarcane"
                />
              </View>
              <View style={s.inputWrap}>
                <Text style={s.inputLabel}>Sown Area (Acres)</Text>
                <TextInput
                  value={estAcres}
                  onChangeText={setEstAcres}
                  keyboardType="numeric"
                  style={s.calcInput}
                />
              </View>
            </View>

            <View style={s.calcResultRow}>
              <View>
                <Text style={s.resLabel}>Farmer Share Premium</Text>
                <Text style={s.resVal}>₹{farmerPremium.toLocaleString()}</Text>
                <Text style={s.subsidyText}>+{govtSubsidy.toLocaleString()} Govt Subsidy</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.resLabel}>Total Sum Insured</Text>
                <Text style={s.sumVal}>₹{sumInsured.toLocaleString()}</Text>
                <Text style={s.rateTag}>{activeOffer?.premiumRatePercent || 2}% Rate</Text>
              </View>
            </View>
          </View>

          {/* Scheme Cards */}
          <Text style={s.sectionHeader}>Available Crop Protection Schemes</Text>
          {offers.map((offer) => (
            <View key={offer.id} style={s.schemeCard}>
              <View style={s.schemeTop}>
                <View style={{ flex: 1 }}>
                  <Text style={s.schemeTitle}>{offer.policyName}</Text>
                  <Text style={s.providerText}>{offer.underwriterName}</Text>
                </View>
                <View style={s.rateBadge}>
                  <Text style={s.rateText}>{offer.premiumRatePercent}% Premium</Text>
                </View>
              </View>

              <Text style={s.schemeDesc}>{offer.coverageDetails}</Text>

              <View style={s.specRow}>
                <View style={s.specCol}>
                  <Text style={s.specLabel}>Sum Insured / Acre</Text>
                  <Text style={s.specVal}>₹{offer.sumInsuredPerAcre?.toLocaleString()}</Text>
                </View>
                <View style={s.specCol}>
                  <Text style={s.specLabel}>Farmer Share</Text>
                  <Text style={[s.specVal, { color: '#1D4ED8' }]}>{offer.premiumRatePercent}% Only</Text>
                </View>
              </View>

              <View style={s.perilsWrap}>
                <Text style={s.perilsTitle}>Covered Risks:</Text>
                <View style={s.tagsRow}>
                  {offer.perilsCovered?.map((peril: string, idx: number) => (
                    <Text key={idx} style={s.tagBadge}>✓ {peril}</Text>
                  ))}
                </View>
              </View>

              <Pressable
                onPress={() => handleOpenEnroll(offer)}
                style={({ pressed }) => [s.applyBtn, pressed && { opacity: 0.85 }]}
              >
                <Text style={s.applyBtnText}>Enroll Crop in this Policy →</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      ) : (
        /* My Policies Tab */
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
          {myPolicies.length === 0 ? (
            <View style={s.emptyBox}>
              <Text style={s.emptyEmoji}>🛡️</Text>
              <Text style={s.emptyTitle}>No Active Crop Policies</Text>
              <Text style={s.emptySubtitle}>
                Enroll your seasonal crops under PMFBY to receive instant financial recovery in case of localized drought, pest attack, or excessive rainfall.
              </Text>
              <Pressable onPress={() => setActiveTab('schemes')} style={s.exploreBtn}>
                <Text style={s.exploreBtnText}>Explore Crop Insurance</Text>
              </Pressable>
            </View>
          ) : (
            myPolicies.map((pol) => (
              <View key={pol.id} style={s.myAppCard}>
                <View style={s.myAppHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.myAppTitle}>{pol.cropName} ({pol.cropSeason} Season)</Text>
                    <Text style={s.myAppBank}>{pol.policyOffer?.underwriterName || 'PMFBY Insured'}</Text>
                    {pol.policyNumber && (
                      <Text style={s.policyNumText}>Certificate #: {pol.policyNumber}</Text>
                    )}
                  </View>
                  <View style={[s.statusTag, pol.status === 'APPROVED' ? s.approvedTag : s.pendingTag]}>
                    <Text style={[s.statusText, pol.status === 'APPROVED' ? s.approvedText : s.pendingText]}>
                      {pol.status === 'APPROVED' ? 'COVERED' : pol.status}
                    </Text>
                  </View>
                </View>

                <View style={s.myAppDetails}>
                  <View style={s.detailCol}>
                    <Text style={s.detailLabel}>Sum Insured</Text>
                    <Text style={s.detailVal}>₹{pol.sumInsured?.toLocaleString()}</Text>
                  </View>
                  <View style={s.detailCol}>
                    <Text style={s.detailLabel}>Premium Paid</Text>
                    <Text style={s.detailVal}>₹{pol.calculatedPremium?.toLocaleString()}</Text>
                  </View>
                  <View style={s.detailCol}>
                    <Text style={s.detailLabel}>Land Extent</Text>
                    <Text style={s.detailVal}>{pol.landAreaAcres} Acres</Text>
                  </View>
                </View>

                {pol.claimStatus === 'FILED' ? (
                  <View style={s.claimAlert}>
                    <Text style={s.claimAlertText}>⚠️ Loss Report Filed: Surveyor Inspection Assigned</Text>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => handleOpenClaim(pol)}
                    style={s.claimBtn}
                  >
                    <Text style={s.claimBtnText}>⚡ Report Crop Damage / File Claim</Text>
                  </Pressable>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Enrollment Modal */}
      <Modal visible={enrollModalVisible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <View style={s.modalTop}>
              <Text style={s.modalTitle}>Enroll in {activeOffer?.policyName || 'Insurance'}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Close insurance enrollment" onPress={() => setEnrollModalVisible(false)} style={s.modalClose}>
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
                  <Text style={s.formLabel}>Crop to Protect</Text>
                  <TextInput
                    value={estCrop}
                    onChangeText={setEstCrop}
                    style={s.formInput}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.formLabel}>Cultivated Acres</Text>
                  <TextInput
                    value={estAcres}
                    onChangeText={setEstAcres}
                    keyboardType="numeric"
                    style={s.formInput}
                  />
                </View>
              </View>

              <View style={s.formRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={s.formLabel}>Crop Season</Text>
                  <TextInput
                    value={cropSeason}
                    onChangeText={setCropSeason}
                    style={s.formInput}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.formLabel}>Survey Number (RTC)</Text>
                  <TextInput
                    value={surveyNumber}
                    onChangeText={setSurveyNumber}
                    placeholder="e.g. Sy. No. 89/1"
                    style={s.formInput}
                  />
                </View>
              </View>

              <View style={s.modalSummary}>
                <View style={s.summaryRow}>
                  <Text style={s.summaryLabel}>Total Sum Insured:</Text>
                  <Text style={s.summaryVal}>₹{sumInsured.toLocaleString()}</Text>
                </View>
                <View style={s.summaryRow}>
                  <Text style={s.summaryLabel}>Farmer Premium Payable (2%):</Text>
                  <Text style={[s.summaryVal, { color: '#1D4ED8' }]}>₹{farmerPremium.toLocaleString()}</Text>
                </View>
              </View>
            </ScrollView>

            <Pressable
              onPress={handleEnrollSubmit}
              disabled={submitting}
              style={[s.submitBtn, submitting && { opacity: 0.7 }]}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.submitBtnText}>Confirm Insurance Enrollment</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Claim Filing Modal */}
      <Modal visible={claimModalVisible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <View style={s.modalTop}>
              <Text style={s.modalTitle}>File Crop Loss Intimation</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Close crop loss form" onPress={() => setClaimModalVisible(false)} style={s.modalClose}>
                <Text style={s.modalCloseText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              <Text style={s.formLabel}>Cause of Damage / Calamity Type *</Text>
              <TextInput
                value={calamityType}
                onChangeText={setCalamityType}
                style={s.formInput}
                placeholder="e.g. Unseasonal Rainfall / Pest Attack / Drought"
              />

              <Text style={s.formLabel}>Estimated Crop Damage (%) *</Text>
              <TextInput
                value={damagePercent}
                onChangeText={setDamagePercent}
                keyboardType="numeric"
                style={s.formInput}
                placeholder="e.g. 60"
              />

              <Text style={s.formLabel}>Field Damage Description</Text>
              <TextInput
                value={damageDesc}
                onChangeText={setDamageDesc}
                multiline
                numberOfLines={3}
                style={[s.formInput, { height: 70 }]}
                placeholder="Describe visible crop damage, lodging, water accumulation..."
              />

              <Text style={s.guaranteeNote}>
                📸 Keep field photos and video ready. Under PMFBY guidelines, claim intimation must occur within 72 hours of damage.
              </Text>
            </ScrollView>

            <Pressable
              onPress={handleSubmitClaim}
              disabled={submitting}
              style={[s.submitBtn, { backgroundColor: '#DC2626' }, submitting && { opacity: 0.7 }]}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.submitBtnText}>Submit Loss Intimation</Text>
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
    color: '#1D4ED8',
    fontSize: font.body,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: font.title,
    fontWeight: '800',
    color: colors.ink,
  },
  bannerCard: {
    backgroundColor: '#1E3A8A',
    borderRadius: radius.l,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  bannerTag: {
    fontSize: font.small,
    color: '#93C5FD',
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
    color: '#DBEAFE',
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
    color: '#1D4ED8',
  },
  subsidyText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '700',
  },
  sumVal: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
  },
  rateTag: {
    fontSize: 10,
    color: '#2563EB',
    fontWeight: '700',
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
    color: '#1D4ED8',
    fontWeight: '700',
    marginTop: 2,
  },
  rateBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  rateText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E40AF',
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
    flex: 1,
  },
  specLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
  },
  specVal: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
    marginTop: 2,
  },
  perilsWrap: {
    marginVertical: spacing.xs,
  },
  perilsTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.muted,
    marginBottom: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tagBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1E40AF',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  applyBtn: {
    backgroundColor: '#1D4ED8',
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
    backgroundColor: '#1D4ED8',
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
    color: '#1D4ED8',
    fontWeight: '600',
  },
  policyNumText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: colors.muted,
    marginTop: 2,
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
    backgroundColor: '#EFF6FF',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  approvedText: {
    color: '#065F46',
  },
  pendingText: {
    color: '#1E40AF',
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
  claimBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: radius.s,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  claimBtnText: {
    color: '#B91C1C',
    fontSize: font.small,
    fontWeight: '700',
  },
  claimAlert: {
    backgroundColor: '#FFFBEB',
    padding: 8,
    borderRadius: radius.s,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  claimAlertText: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '600',
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
    backgroundColor: '#EFF6FF',
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
    backgroundColor: '#1D4ED8',
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
