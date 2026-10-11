import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookingStatusBadge } from '../../src/components/BookingStatusBadge';
import { EmptyState } from '../../src/components/EmptyState';
import { OrderCard } from '../../src/components/OrderCard';
import { colors, font, radius, shadow, spacing } from '../../src/constants/theme';
import { useT } from '../../src/i18n';
import { useBookingStore } from '../../src/store/bookingStore';
import { useCropMarketplaceStore } from '../../src/store/cropMarketplaceStore';
import { useProductOrderStore } from '../../src/store/productOrderStore';
import { ServiceBooking } from '../../src/types';

type TabKey = 'all' | 'labour' | 'machinery' | 'products' | 'crop_sales';

export default function OrdersScreen() {
  const t = useT();
  const router = useRouter();
  const { bookings, loading, fetchBookings } = useBookingStore();
  const { orders: productOrders, fetchOrders: fetchProductOrders } = useProductOrderStore();
  const { sales: cropSales, fetchSales: fetchCropSales } = useCropMarketplaceStore();

  const [tab, setTab] = useState<TabKey>('all');

  useEffect(() => {
    fetchBookings();
    fetchProductOrders();
    fetchCropSales();
  }, []);

  const serviceFiltered =
    tab === 'all'
      ? bookings
      : tab === 'labour' || tab === 'machinery'
      ? bookings.filter((b) => b.type === tab)
      : [];

  const showProducts = tab === 'all' || tab === 'products';
  const showCropSales = tab === 'all' || tab === 'crop_sales';

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'all', label: t('allOrders') },
    { key: 'labour', label: t('labourOrders') },
    { key: 'machinery', label: t('machineryOrders') },
    { key: 'products', label: 'Products' },
    { key: 'crop_sales', label: 'Crop Sales' },
  ];

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <Pressable
          accessibilityRole="button"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))}
          style={s.backBtn}
        >
          <Text style={s.backBtnText}>←</Text>
        </Pressable>
        <Text style={s.title}>{t('myOrders')}</Text>
      </View>

      {/* Tab Pills */}
      <View style={s.tabScrollWrapper}>
        {tabs.map((tb) => (
          <Pressable
            key={tb.key}
            accessibilityRole="button"
            onPress={() => setTab(tb.key)}
            style={[s.pill, tab === tb.key && s.pillActive]}
          >
            <Text style={[s.pillText, tab === tb.key && s.pillTextActive]}>{tb.label}</Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={[1]}
          keyExtractor={() => 'header'}
          renderItem={() => null}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={

            <View>
              {/* Product Orders Section */}
              {showProducts && productOrders.length > 0 && (
                <View style={s.section}>
                  <Text style={s.sectionTitle}>🛒 Product Marketplace Orders</Text>
                  {productOrders.map((pOrder) => (
                    <Pressable
                      key={pOrder.id}
                      style={s.productOrderCard}
                      onPress={() =>
                        router.push({
                          pathname: '/market/order/[id]',
                          params: { id: pOrder.id },
                        } as any)
                      }
                    >
                      <View style={s.orderHeader}>
                        <Text style={s.orderIdText}>Order #{pOrder.id}</Text>
                        <View style={s.statusPill}>
                          <Text style={s.statusPillText}>{pOrder.status.toUpperCase()}</Text>
                        </View>
                      </View>
                      <Text style={s.orderItemsText}>
                        {pOrder.items.map((i) => `${i.productName} (${i.quantity}x)`).join(', ')}
                      </Text>
                      <View style={s.orderFooterRow}>
                        <Text style={s.orderDateText}>Date: {pOrder.orderDate.split('T')[0]}</Text>
                        <Text style={s.orderTotalText}>₹{pOrder.total.toLocaleString('en-IN')}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}

              {/* Crop Sales Orders Section */}
              {showCropSales && cropSales.length > 0 && (
                <View style={s.section}>
                  <Text style={s.sectionTitle}>🌾 Crop Sales Orders</Text>
                  {cropSales.map((sale) => (
                    <Pressable
                      key={sale.id}
                      style={s.cropSaleCard}
                      onPress={() => router.push('/market/sell' as any)}
                    >
                      <View style={s.orderHeader}>
                        <Text style={s.orderIdText}>Sale #{sale.id}</Text>
                        <View style={[s.statusPill, { backgroundColor: '#E8F5E9' }]}>
                          <Text style={[s.statusPillText, { color: '#2E7D32' }]}>
                            {sale.status.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <Text style={s.cropSaleTitle}>{sale.cropName}</Text>
                      <Text style={s.buyerNameText}>Buyer: {sale.buyer.name}</Text>
                      <View style={s.orderFooterRow}>
                        <Text style={s.orderDateText}>
                          Qty: {sale.quantity} {sale.unit} @ ₹{sale.agreedPrice}
                        </Text>
                        <Text style={s.orderTotalText}>₹{sale.totalAmount.toLocaleString('en-IN')}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}

              {/* Service Bookings (Labour & Machinery) Section */}
              {(tab === 'all' || tab === 'labour' || tab === 'machinery') &&
                serviceFiltered.length > 0 && (
                  <View style={s.section}>
                    <Text style={s.sectionTitle}>🚜 Service Bookings</Text>
                    {serviceFiltered.map((item) => (
                      <View key={item.id} style={{ marginBottom: 12 }}>
                        <OrderCard
                          booking={item}
                          onPress={() => router.push(`/orders/${item.id}` as any)}
                        />
                      </View>
                    ))}
                  </View>
                )}

              {/* If Empty across all selections */}
              {serviceFiltered.length === 0 &&
                (!showProducts || productOrders.length === 0) &&
                (!showCropSales || cropSales.length === 0) && (
                  <EmptyState emoji="📋" title={t('noOrders')} message={t('noOrdersMsg')} />
                )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.m,
    paddingTop: spacing.s,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  title: { fontSize: 22, fontFamily: font.bold, color: colors.textPrimary },
  tabScrollWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: spacing.m,
    marginTop: spacing.m,
  },
  pill: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { fontSize: 13, fontFamily: font.medium, color: colors.textPrimary },
  pillTextActive: { color: colors.surface, fontFamily: font.bold },
  list: { padding: spacing.m },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  section: { marginBottom: spacing.l },
  sectionTitle: {
    fontSize: 16,
    fontFamily: font.bold,
    color: colors.textPrimary,
    marginBottom: spacing.s,
  },
  productOrderCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    padding: spacing.m,
    marginBottom: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  cropSaleCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    padding: spacing.m,
    marginBottom: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderIdText: {
    fontFamily: font.bold,
    fontSize: 12,
    color: colors.textMuted,
  },
  statusPill: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  statusPillText: {
    fontFamily: font.bold,
    fontSize: 10,
    color: colors.primary,
  },
  orderItemsText: {
    fontFamily: font.bold,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cropSaleTitle: {
    fontFamily: font.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  buyerNameText: {
    fontFamily: font.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  orderFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  orderDateText: {
    fontFamily: font.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  orderTotalText: {
    fontFamily: font.bold,
    fontSize: 16,
    color: colors.primary,
  },
});
