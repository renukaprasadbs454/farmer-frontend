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
  fetchCropCommoditiesApi,
  investInCropApi,
  sellCropInvestmentApi,
  fetchMyPortfolioApi,
} from '../src/services/financeService';

export default function InvestScreen() {
  const router = useRouter();
  const { farmer } = useFarmerStore();

  const [activeTab, setActiveTab] = useState<'market' | 'portfolio'>('market');
  const [commodities, setCommodities] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any>({
    summary: { totalInvested: 0, totalCurrentValue: 0, unrealizedPnL: 0, unrealizedPnLPercent: 0, totalRealizedPnL: 0 },
    data: [],
  });
  const [loading, setLoading] = useState(true);

  // Buy Modal State
  const [selectedCrop, setSelectedCrop] = useState<any | null>(null);
  const [buyModalVisible, setBuyModalVisible] = useState(false);
  const [unitsToBuy, setUnitsToBuy] = useState('5');
  const [submitting, setSubmitting] = useState(false);

  const loadMarketData = async () => {
    setLoading(true);
    try {
      const [crops, portData] = await Promise.all([
        fetchCropCommoditiesApi(),
        fetchMyPortfolioApi(),
      ]);
      setCommodities(crops);
      setPortfolio(portData);
    } catch (e) {
      console.warn('Invest screen load error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketData();
  }, []);

  const handleOpenBuy = (crop: any) => {
    setSelectedCrop(crop);
    setUnitsToBuy(String(crop.minInvestmentUnits || 1));
    setBuyModalVisible(true);
  };

  const handleConfirmBuy = async () => {
    if (!selectedCrop) return;
    const units = parseFloat(unitsToBuy);
    if (isNaN(units) || units <= 0) {
      alert('Please enter a valid quantity of units.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await investInCropApi({
        commodityId: selectedCrop.id,
        unitsPurchased: units,
        farmerName: farmer.name || 'Farmer',
        farmerPhone: farmer.mobile || '9845100001',
      });

      if (res.success) {
        alert(`📈 Success! You bought ${units} ${selectedCrop.unit} of ${selectedCrop.cropName} at ₹${selectedCrop.currentPrice}/${selectedCrop.unit}.`);
        setBuyModalVisible(false);
        loadMarketData();
        setActiveTab('portfolio');
      } else {
        alert(res.message || 'Investment failed');
      }
    } catch (err: any) {
      alert(err.message || 'Error executing investment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSellPosition = async (investmentId: string, cropName: string) => {
    if (!confirm(`Sell your position in ${cropName} at the current live Mandi price?`)) return;

    try {
      const res = await sellCropInvestmentApi(investmentId);
      if (res.success) {
        alert(res.message || 'Position sold successfully!');
        loadMarketData();
      } else {
        alert(res.message || 'Failed to sell position');
      }
    } catch (err: any) {
      alert(err.message || 'Error selling investment');
    }
  };

  const unitsNum = parseFloat(unitsToBuy) || 0;
  const totalCost = unitsNum * (selectedCrop?.currentPrice || 0);

  const summary = portfolio.summary || {
    totalInvested: 0,
    totalCurrentValue: 0,
    unrealizedPnL: 0,
    unrealizedPnLPercent: 0,
    totalRealizedPnL: 0,
  };
  const isOverallProfit = summary.unrealizedPnL >= 0;

  return (
    <ScreenContainer scroll={false}>
      {/* Top Header */}
      <View style={s.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </Pressable>
        <Text style={s.headerTitle}>Crop Stock Market</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Banner */}
      <View style={s.bannerCard}>
        <Text style={s.bannerTag}>📈 APMC Commodity Trading</Text>
        <Text style={s.bannerTitle}>Invest in Crops · Sell at Peaks</Text>
        <Text style={s.bannerSubtitle}>
          Buy crop commodity units at harvest spot rates (e.g. Onion @ ₹10) and sell directly when seasonal shortages drive prices to ₹30+.
        </Text>
      </View>

      {/* Tab Switcher */}
      <View style={s.tabRow}>
        <Pressable
          onPress={() => setActiveTab('market')}
          style={[s.tabBtn, activeTab === 'market' && s.activeTabBtn]}
        >
          <Text style={[s.tabText, activeTab === 'market' && s.activeTabText]}>
            Live Mandi Market ({commodities.length})
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('portfolio')}
          style={[s.tabBtn, activeTab === 'portfolio' && s.activeTabBtn]}
        >
          <Text style={[s.tabText, activeTab === 'portfolio' && s.activeTabText]}>
            My Portfolio ({portfolio.data?.length || 0})
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={s.centerBox}>
          <ActivityIndicator size="large" color="#D97706" />
          <Text style={s.mutedText}>Fetching live Mandi commodity prices...</Text>
        </View>
      ) : activeTab === 'market' ? (
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
          <Text style={s.sectionHeader}>Live Tradable Crops (APMC Spot)</Text>
          {commodities.map((crop) => {
            const isPositive = crop.changePercent >= 0;
            return (
              <View key={crop.id} style={s.cropCard}>
                <View style={s.cropTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.cropCategory}>{crop.category} · {crop.variety || 'Mandi Grade'}</Text>
                    <Text style={s.cropTitle}>{crop.cropName}</Text>
                  </View>
                  <View style={[s.changeBadge, isPositive ? s.gainBadge : s.lossBadge]}>
                    <Text style={[s.changeText, isPositive ? s.gainText : s.lossText]}>
                      {isPositive ? '▲ +' : '▼ '}{crop.changePercent}%
                    </Text>
                  </View>
                </View>

                {/* Price Matrix */}
                <View style={s.priceBox}>
                  <View>
                    <Text style={s.priceLabel}>Current Spot Price</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                      <Text style={s.spotPrice}>₹{crop.currentPrice?.toLocaleString()}</Text>
                      <Text style={s.unitText}> / {crop.unit}</Text>
                    </View>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={s.priceLabel}>Day Range</Text>
                    <Text style={s.rangeText}>₹{crop.dayLow} - ₹{crop.dayHigh}</Text>
                  </View>
                </View>

                <View style={s.actionRow}>
                  <Text style={s.minUnitsText}>Min: {crop.minInvestmentUnits} {crop.unit}</Text>
                  <Pressable
                    onPress={() => handleOpenBuy(crop)}
                    style={({ pressed }) => [s.buyBtn, pressed && { opacity: 0.85 }]}
                  >
                    <Text style={s.buyBtnText}>Invest / Buy Units →</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </ScrollView>
      ) : (
        /* Portfolio Tab */
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
          {/* Portfolio Summary Card */}
          <View style={s.portSummaryCard}>
            <Text style={s.portSummaryTitle}>💼 My Agricultural Investment Portfolio</Text>

            <View style={s.summaryStatsRow}>
              <View style={s.statCol}>
                <Text style={s.statColLabel}>Total Invested</Text>
                <Text style={s.statColVal}>₹{summary.totalInvested?.toLocaleString()}</Text>
              </View>
              <View style={s.statCol}>
                <Text style={s.statColLabel}>Current Live Value</Text>
                <Text style={[s.statColVal, { color: '#059669' }]}>
                  ₹{summary.totalCurrentValue?.toLocaleString()}
                </Text>
              </View>
              <View style={s.statCol}>
                <Text style={s.statColLabel}>Net Gain / Loss</Text>
                <Text style={[s.statColVal, isOverallProfit ? s.profitText : s.lossText]}>
                  {isOverallProfit ? '+' : ''}₹{summary.unrealizedPnL?.toLocaleString()}
                </Text>
              </View>
            </View>

            {summary.totalRealizedPnL > 0 && (
              <View style={s.realizedBanner}>
                <Text style={s.realizedText}>
                  🎉 Past Realized Profits Cashed Out: +₹{summary.totalRealizedPnL?.toLocaleString()}
                </Text>
              </View>
            )}
          </View>

          <Text style={s.sectionHeader}>Active Commodity Holdings</Text>
          {portfolio.data?.length === 0 ? (
            <View style={s.emptyBox}>
              <Text style={s.emptyEmoji}>🌾</Text>
              <Text style={s.emptyTitle}>No Crop Holdings Yet</Text>
              <Text style={s.emptySubtitle}>
                Select an agricultural staple like Onion or Tomato from the Mandi market to invest and track live value gains.
              </Text>
              <Pressable onPress={() => setActiveTab('market')} style={s.exploreBtn}>
                <Text style={s.exploreBtnText}>View Live Mandi Market</Text>
              </Pressable>
            </View>
          ) : (
            portfolio.data?.map((holding: any) => {
              const isHolding = holding.status === 'HOLDING';
              const livePrice = holding.commodity?.currentPrice || holding.unitPriceAtBuy;
              const liveValue = isHolding ? holding.unitsPurchased * livePrice : holding.currentValue;
              const pnl = isHolding ? liveValue - holding.totalInvestedAmount : holding.realizedProfitLoss || 0;
              const pnlPct = holding.totalInvestedAmount > 0 ? (pnl / holding.totalInvestedAmount) * 100 : 0;
              const isWin = pnl >= 0;

              return (
                <View key={holding.id} style={s.holdingCard}>
                  <View style={s.cropTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.holdingCropName}>{holding.cropName}</Text>
                      <Text style={s.holdingUnits}>
                        {holding.unitsPurchased} {holding.commodity?.unit || 'Units'} @ ₹{holding.unitPriceAtBuy} Buy Price
                      </Text>
                    </View>
                    <View style={[s.statusBadge, isHolding ? s.activeBadge : s.soldBadge]}>
                      <Text style={[s.statusBadgeText, isHolding ? s.activeText : s.soldText]}>
                        {isHolding ? 'HOLDING' : 'SOLD & SETTLED'}
                      </Text>
                    </View>
                  </View>

                  <View style={s.holdingStatsRow}>
                    <View>
                      <Text style={s.hStatLabel}>Current Value</Text>
                      <Text style={s.hStatVal}>₹{liveValue?.toLocaleString()}</Text>
                    </View>
                    <View>
                      <Text style={s.hStatLabel}>Spot Price</Text>
                      <Text style={s.hStatVal}>₹{livePrice}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={s.hStatLabel}>Return / PnL</Text>
                      <Text style={[s.hStatVal, isWin ? s.profitText : s.lossText]}>
                        {isWin ? '+' : ''}₹{pnl?.toFixed(1)} ({isWin ? '+' : ''}{pnlPct.toFixed(1)}%)
                      </Text>
                    </View>
                  </View>

                  {isHolding && (
                    <Pressable
                      onPress={() => handleSellPosition(holding.id, holding.cropName)}
                      style={({ pressed }) => [s.sellBtn, pressed && { opacity: 0.85 }]}
                    >
                      <Text style={s.sellBtnText}>💰 Sell Now @ ₹{livePrice} (Lock in Profit)</Text>
                    </Pressable>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Buy Crop Units Modal */}
      <Modal visible={buyModalVisible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <View style={s.modalTop}>
              <Text style={s.modalTitle}>Invest in {selectedCrop?.cropName}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Close investment form" onPress={() => setBuyModalVisible(false)} style={s.modalClose}>
                <Text style={s.modalCloseText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              <View style={s.modalPriceRow}>
                <View>
                  <Text style={s.mPriceLabel}>Live Spot Price</Text>
                  <Text style={s.mPriceVal}>₹{selectedCrop?.currentPrice} / {selectedCrop?.unit}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={s.mPriceLabel}>24h APMC Trend</Text>
                  <Text style={[s.mPriceTrend, selectedCrop?.changePercent >= 0 ? s.gainText : s.lossText]}>
                    {selectedCrop?.changePercent >= 0 ? '+' : ''}{selectedCrop?.changePercent}%
                  </Text>
                </View>
              </View>

              <Text style={s.formLabel}>Quantity to Purchase ({selectedCrop?.unit}) *</Text>
              <TextInput
                value={unitsToBuy}
                onChangeText={setUnitsToBuy}
                keyboardType="numeric"
                style={s.formInput}
                placeholder="e.g. 5"
              />

              <View style={s.quickQtyRow}>
                {['1', '5', '10', '25', '50'].map((q) => (
                  <Pressable
                    key={q}
                    onPress={() => setUnitsToBuy(q)}
                    style={[s.quickQtyBtn, unitsToBuy === q && s.activeQtyBtn]}
                  >
                    <Text style={[s.quickQtyText, unitsToBuy === q && s.activeQtyText]}>{q} {selectedCrop?.unit?.slice(0, 3)}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={s.totalCostBox}>
                <Text style={s.totalCostLabel}>Total Investment Amount:</Text>
                <Text style={s.totalCostVal}>₹{totalCost.toLocaleString()}</Text>
              </View>

              <Text style={s.guaranteeNote}>
                ⚡ Your units are securely recorded on the platform ledger. When the Mandi price appreciates, click "Sell Now" to liquidate your position and transfer proceeds to your account.
              </Text>
            </ScrollView>

            <Pressable
              onPress={handleConfirmBuy}
              disabled={submitting}
              style={[s.submitBtn, submitting && { opacity: 0.7 }]}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.submitBtnText}>Confirm Investment (₹{totalCost.toLocaleString()})</Text>
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
    color: '#D97706',
    fontSize: font.body,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: font.title,
    fontWeight: '800',
    color: colors.ink,
  },
  bannerCard: {
    backgroundColor: '#78350F',
    borderRadius: radius.l,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  bannerTag: {
    fontSize: font.small,
    color: '#FDE68A',
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
    color: '#FEF3C7',
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
  sectionHeader: {
    fontSize: font.body,
    fontWeight: '800',
    color: colors.ink,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  cropCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.m,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: spacing.xs,
  },
  cropTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cropCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
  },
  cropTitle: {
    fontSize: font.body,
    fontWeight: '800',
    color: colors.ink,
    marginTop: 2,
  },
  changeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  gainBadge: {
    backgroundColor: '#ECFDF5',
  },
  lossBadge: {
    backgroundColor: '#FEF2F2',
  },
  changeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  gainText: {
    color: '#059669',
  },
  lossText: {
    color: '#DC2626',
  },
  priceBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: radius.s,
    padding: spacing.sm,
    marginVertical: spacing.sm,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.muted,
  },
  spotPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.ink,
  },
  unitText: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '600',
  },
  rangeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  minUnitsText: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '600',
  },
  buyBtn: {
    backgroundColor: '#D97706',
    borderRadius: radius.s,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buyBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: font.small,
  },
  portSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.m,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: spacing.xs,
  },
  portSummaryTitle: {
    fontSize: font.body,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCol: {},
  statColLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.muted,
  },
  statColVal: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.ink,
    marginTop: 2,
  },
  profitText: {
    color: '#059669',
  },
  realizedBanner: {
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: radius.s,
    marginTop: spacing.sm,
  },
  realizedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
    textAlign: 'center',
  },
  holdingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.m,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: spacing.xs,
  },
  holdingCropName: {
    fontSize: font.body,
    fontWeight: '800',
    color: colors.ink,
  },
  holdingUnits: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  activeBadge: {
    backgroundColor: '#EFF6FF',
  },
  soldBadge: {
    backgroundColor: '#F1F5F9',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  activeText: {
    color: '#1D4ED8',
  },
  soldText: {
    color: '#64748B',
  },
  holdingStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: radius.s,
    padding: spacing.sm,
    marginVertical: spacing.sm,
  },
  hStatLabel: {
    fontSize: 10,
    color: colors.muted,
    fontWeight: '600',
  },
  hStatVal: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
    marginTop: 2,
  },
  sellBtn: {
    backgroundColor: '#059669',
    borderRadius: radius.s,
    paddingVertical: 10,
    alignItems: 'center',
  },
  sellBtnText: {
    color: '#FFFFFF',
    fontSize: font.small,
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
    backgroundColor: '#D97706',
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
  modalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    padding: spacing.sm,
    borderRadius: radius.s,
    marginBottom: spacing.sm,
  },
  mPriceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#78350F',
  },
  mPriceVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
  },
  mPriceTrend: {
    fontSize: 14,
    fontWeight: '800',
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
    fontWeight: '700',
    color: colors.ink,
  },
  quickQtyRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  quickQtyBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    borderRadius: radius.s,
    alignItems: 'center',
  },
  activeQtyBtn: {
    backgroundColor: '#D97706',
  },
  quickQtyText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.ink,
  },
  activeQtyText: {
    color: '#FFFFFF',
  },
  totalCostBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: spacing.sm,
    borderRadius: radius.s,
    marginVertical: spacing.md,
    alignItems: 'center',
  },
  totalCostLabel: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '600',
  },
  totalCostVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#D97706',
  },
  guaranteeNote: {
    fontSize: 11,
    color: colors.muted,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  submitBtn: {
    backgroundColor: '#D97706',
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
