import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CropListingCard } from '../../../src/components/CropListingCard';
import { EmptyState } from '../../../src/components/EmptyState';
import { colors, font, radius, shadow, spacing } from '../../../src/constants/theme';
import { useT } from '../../../src/i18n';
import { useCropMarketplaceStore } from '../../../src/store/cropMarketplaceStore';
import { CropListing, CropPurchaseRequest, CropSale } from '../../../src/types';

export default function MySellDashboardScreen() {
  const t = useT();
  const router = useRouter();

  const {
    myListings,
    requests,
    sales,
    fetchMyListings,
    fetchRequests,
    fetchSales,
    pauseListing,
    resumeListing,
    deleteListing,
    acceptRequest,
    rejectRequest,
  } = useCropMarketplaceStore();

  const [activeTab, setActiveTab] = useState<'listings' | 'requests' | 'sales'>('listings');
  const [listingFilter, setListingFilter] = useState<'all' | 'active' | 'paused' | 'sold' | 'draft'>('all');

  useEffect(() => {
    fetchMyListings();
    fetchRequests();
    fetchSales();
  }, []);

  const filteredListings = myListings.filter((l) => {
    if (listingFilter === 'all') return true;
    return l.status === listingFilter;
  });

  const pendingRequests = requests.filter((r) => r.status === 'pending');

  const handleAcceptRequest = (req: CropPurchaseRequest) => {
    Alert.alert(
      t('acceptConfirmTitle'),
      `${t('acceptConfirmMsg')}\n\nQuantity: ${req.requestedQuantity} ${req.unit}\nOffer Price: ₹${req.offerPrice}/${req.unit}\nTotal: ₹${req.totalEstimatedAmount.toLocaleString('en-IN')}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: t('acceptRequest'),
          onPress: async () => {
            try {
              await acceptRequest(req.id);
              Alert.alert('Request Accepted! 🎉', 'Quantity has been deducted and sale order generated.');
            } catch (e) {
              Alert.alert('Error', (e as Error).message);
            }
          },
        },
      ],
    );
  };

  const handleRejectRequest = (req: CropPurchaseRequest) => {
    Alert.alert(
      'Reject Request?',
      'Are you sure you want to reject this buyer offer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            await rejectRequest(req.id);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← {t('back')}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t('sellCropsTitle')}</Text>
        <Pressable
          style={styles.addBtn}
          onPress={() => router.push('/market/sell/create' as any)}
        >
          <Text style={styles.addBtnText}>+ List</Text>
        </Pressable>
      </View>

      {/* Primary Dashboard Tabs */}
      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tab, activeTab === 'listings' && styles.tabActive]}
          onPress={() => setActiveTab('listings')}
        >
          <Text style={[styles.tabText, activeTab === 'listings' && styles.tabTextActive]}>
            🌾 {t('myListings')} ({myListings.length})
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === 'requests' && styles.tabActive]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.tabTextActive]}>
            🔔 {t('requests')} ({pendingRequests.length})
          </Text>
          {pendingRequests.length > 0 && <View style={styles.badgeDot} />}
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === 'sales' && styles.tabActive]}
          onPress={() => setActiveTab('sales')}
        >
          <Text style={[styles.tabText, activeTab === 'sales' && styles.tabTextActive]}>
            💰 {t('mySales')} ({sales.length})
          </Text>
        </Pressable>
      </View>

      {/* CONTENT TAB 1: MY LISTINGS */}
      {activeTab === 'listings' && (
        <View style={{ flex: 1 }}>
          {/* Subfilter Pills */}
          <View style={styles.filterPillRow}>
            {(['all', 'active', 'paused', 'sold', 'draft'] as const).map((st) => (
              <Pressable
                key={st}
                style={[styles.pill, listingFilter === st && styles.pillActive]}
                onPress={() => setListingFilter(st)}
              >
                <Text style={[styles.pillText, listingFilter === st && styles.pillTextActive]}>
                  {st.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>

          {filteredListings.length === 0 ? (
            <EmptyState
              emoji="🌾"
              title={t('noCropListings')}
              message={t('noCropListingsMsg')}
              actionLabel={`+ ${t('listYourCrop')}`}
              onAction={() => router.push('/market/sell/create' as any)}
            />
          ) : (
            <FlatList
              data={filteredListings}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: spacing.m }}
              renderItem={({ item }) => (
                <View>
                  <CropListingCard
                    listing={item}
                    onPress={() =>
                      router.push({
                        pathname: '/market/crops/[id]',
                        params: { id: item.id },
                      } as any)
                    }
                  />

                  {/* Management Bar */}
                  <View style={styles.manageRow}>
                    {item.status === 'active' ? (
                      <Pressable
                        style={styles.actionBtn}
                        onPress={() => pauseListing(item.id)}
                      >
                        <Text style={styles.actionBtnText}>⏸ {t('pauseListing')}</Text>
                      </Pressable>
                    ) : item.status === 'paused' ? (
                      <Pressable
                        style={styles.actionBtn}
                        onPress={() => resumeListing(item.id)}
                      >
                        <Text style={styles.actionBtnText}>▶ {t('resumeListing')}</Text>
                      </Pressable>
                    ) : null}

                    <Pressable
                      style={[styles.actionBtn, styles.deleteBtn]}
                      onPress={() =>
                        Alert.alert('Delete Listing?', 'Are you sure?', [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Delete', style: 'destructive', onPress: () => deleteListing(item.id) },
                        ])
                      }
                    >
                      <Text style={styles.deleteBtnText}>🗑 {t('deleteListing')}</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      )}

      {/* CONTENT TAB 2: BUYER REQUESTS */}
      {activeTab === 'requests' && (
        <View style={{ flex: 1 }}>
          {requests.length === 0 ? (
            <EmptyState
              emoji="🔔"
              title={t('noRequests')}
              message={t('noRequestsMsg')}
            />
          ) : (
            <FlatList
              data={requests}
              keyExtractor={(r) => r.id}
              contentContainerStyle={{ padding: spacing.m }}
              renderItem={({ item: r }) => (
                <View style={styles.requestCard}>
                  <View style={styles.reqHeader}>
                    <View>
                      <Text style={styles.reqCropName}>{r.cropName}</Text>
                      <Text style={styles.reqBuyerName}>👤 {r.buyer.name} ({r.buyer.type})</Text>
                    </View>
                    <View style={[styles.reqStatusBadge, r.status === 'accepted' && styles.reqStatusAccepted]}>
                      <Text style={styles.reqStatusText}>{r.status.toUpperCase()}</Text>
                    </View>
                  </View>

                  <View style={styles.reqDivider} />

                  <View style={styles.reqDetailRow}>
                    <Text style={styles.reqDetailLabel}>Quantity Wanted:</Text>
                    <Text style={styles.reqDetailValue}>{r.requestedQuantity} {r.unit}</Text>
                  </View>

                  <View style={styles.reqDetailRow}>
                    <Text style={styles.reqDetailLabel}>Offer Price:</Text>
                    <Text style={styles.reqDetailValue}>₹{r.offerPrice} / {r.unit}</Text>
                  </View>

                  <View style={styles.reqDetailRow}>
                    <Text style={styles.reqDetailLabel}>Total Est. Amount:</Text>
                    <Text style={styles.reqTotalValue}>₹{r.totalEstimatedAmount.toLocaleString('en-IN')}</Text>
                  </View>

                  {r.message ? (
                    <Text style={styles.reqMessageText}>"{r.message}"</Text>
                  ) : null}

                  {r.status === 'pending' && (
                    <View style={styles.reqActionRow}>
                      <Pressable
                        style={[styles.decisionBtn, styles.acceptBtn]}
                        onPress={() => handleAcceptRequest(r)}
                      >
                        <Text style={styles.acceptBtnText}>✓ {t('acceptRequest')}</Text>
                      </Pressable>

                      <Pressable
                        style={[styles.decisionBtn, styles.rejectBtn]}
                        onPress={() => handleRejectRequest(r)}
                      >
                        <Text style={styles.rejectBtnText}>✕ {t('rejectRequest')}</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              )}
            />
          )}
        </View>
      )}

      {/* CONTENT TAB 3: MY SALES */}
      {activeTab === 'sales' && (
        <View style={{ flex: 1 }}>
          {sales.length === 0 ? (
            <EmptyState
              emoji="💰"
              title={t('noSales')}
              message={t('noSalesMsg')}
            />
          ) : (
            <FlatList
              data={sales}
              keyExtractor={(s) => s.id}
              contentContainerStyle={{ padding: spacing.m }}
              renderItem={({ item: sale }) => (
                <View style={styles.saleCard}>
                  <View style={styles.saleHeader}>
                    <Text style={styles.saleIdText}>Order {sale.id}</Text>
                    <View style={styles.saleStatusBadge}>
                      <Text style={styles.saleStatusText}>{sale.status.toUpperCase()}</Text>
                    </View>
                  </View>

                  <Text style={styles.saleCropTitle}>{sale.cropName}</Text>
                  <Text style={styles.saleBuyerText}>Buyer: {sale.buyer.name}</Text>

                  <View style={styles.reqDivider} />

                  <View style={styles.reqDetailRow}>
                    <Text style={styles.reqDetailLabel}>Sold Quantity:</Text>
                    <Text style={styles.reqDetailValue}>{sale.quantity} {sale.unit}</Text>
                  </View>

                  <View style={styles.reqDetailRow}>
                    <Text style={styles.reqDetailLabel}>Agreed Price:</Text>
                    <Text style={styles.reqDetailValue}>₹{sale.agreedPrice} / {sale.unit}</Text>
                  </View>

                  <View style={styles.reqDetailRow}>
                    <Text style={styles.reqDetailLabel}>Total Order Value:</Text>
                    <Text style={styles.saleTotalText}>₹{sale.totalAmount.toLocaleString('en-IN')}</Text>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      )}
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
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderRadius: radius.s,
  },
  addBtnText: {
    fontFamily: font.bold,
    fontSize: 13,
    color: colors.surface,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.m,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    position: 'relative',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontFamily: font.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  tabTextActive: {
    fontFamily: font.bold,
    color: colors.primary,
  },
  badgeDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.error,
  },
  filterPillRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    gap: spacing.xs,
  },
  pill: {
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: radius.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  pillText: {
    fontFamily: font.medium,
    fontSize: 11,
    color: colors.textSecondary,
  },
  pillTextActive: {
    fontFamily: font.bold,
    color: colors.primary,
  },
  manageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.s,
    marginTop: -spacing.s,
    marginBottom: spacing.m,
  },
  actionBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderRadius: radius.s,
  },
  actionBtnText: {
    fontFamily: font.medium,
    fontSize: 12,
    color: colors.textPrimary,
  },
  deleteBtn: {
    borderColor: '#FFCDD2',
    backgroundColor: '#FFEBEE',
  },
  deleteBtnText: {
    fontFamily: font.medium,
    fontSize: 12,
    color: colors.error,
  },
  requestCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    padding: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  reqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reqCropName: {
    fontFamily: font.bold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  reqBuyerName: {
    fontFamily: font.medium,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  reqStatusBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  reqStatusAccepted: {
    backgroundColor: '#E8F5E9',
  },
  reqStatusText: {
    fontFamily: font.bold,
    fontSize: 10,
    color: colors.textPrimary,
  },
  reqDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.s,
  },
  reqDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  reqDetailLabel: {
    fontFamily: font.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  reqDetailValue: {
    fontFamily: font.medium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  reqTotalValue: {
    fontFamily: font.bold,
    fontSize: 15,
    color: colors.primary,
  },
  reqMessageText: {
    fontFamily: font.regular,
    fontStyle: 'italic',
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  reqActionRow: {
    flexDirection: 'row',
    gap: spacing.s,
    marginTop: spacing.m,
  },
  decisionBtn: {
    flex: 1,
    paddingVertical: spacing.s,
    borderRadius: radius.s,
    alignItems: 'center',
  },
  acceptBtn: {
    backgroundColor: colors.primary,
  },
  acceptBtnText: {
    fontFamily: font.bold,
    fontSize: 14,
    color: colors.surface,
  },
  rejectBtn: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  rejectBtnText: {
    fontFamily: font.bold,
    fontSize: 14,
    color: colors.error,
  },
  saleCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    padding: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  saleIdText: {
    fontFamily: font.bold,
    fontSize: 12,
    color: colors.textMuted,
  },
  saleStatusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  saleStatusText: {
    fontFamily: font.bold,
    fontSize: 10,
    color: '#2E7D32',
  },
  saleCropTitle: {
    fontFamily: font.bold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  saleBuyerText: {
    fontFamily: font.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  saleTotalText: {
    fontFamily: font.bold,
    fontSize: 16,
    color: colors.primary,
  },
});
