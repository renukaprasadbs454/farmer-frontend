import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { radius, shadow, spacing } from '../../../src/constants/theme';
import { useProductOrderStore } from '../../../src/store/productOrderStore';
import { ProductOrder } from '../../../src/types';

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getOrderById } = useProductOrderStore();
  const [order, setOrder] = useState<ProductOrder | null>(null);

  useEffect(() => {
    if (id) {
      const found = getOrderById(id);
      if (found) setOrder(found);
    }
  }, [id]);

  if (!order) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ fontSize: 44, marginBottom: 12 }}>📦</Text>
        <Text style={{ fontSize: 18, fontWeight: '800', color: '#111E15' }}>Order Details Not Found</Text>
        <Pressable
          style={styles.backBtnAction}
          onPress={() => router.push('/(tabs)/orders')}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>← Go to Orders List</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => (router.canGoBack() ? router.back() : router.push('/(tabs)/orders'))}
        >
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Order #{order.id}</Text>
          <Text style={styles.headerSub}>
            Placed on {new Date(order.orderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>{order.status.toUpperCase()}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Success Banner */}
        <View style={styles.banner}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>🎉</Text>
          <Text style={styles.bannerTitle}>Order Confirmed & Scheduled</Text>
          <Text style={styles.bannerSub}>
            Estimated farm delivery in {order.estimatedDelivery}
          </Text>
        </View>

        {/* Ordered Items */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Items in this Order ({order.items.length})</Text>
          {order.items.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <View style={styles.itemEmoji}>
                <Text style={{ fontSize: 26 }}>{item.image || '🌾'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.brandName}>{item.brand}</Text>
                <Text style={styles.itemName}>{item.productName}</Text>
                <Text style={styles.itemVariant}>
                  {item.packSize} &bull; Qty: {item.quantity}
                </Text>
              </View>
              <Text style={styles.itemTotal}>₹{item.subtotal.toLocaleString('en-IN')}</Text>
            </View>
          ))}
        </View>

        {/* Delivery Address */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>📍 Delivery Destination</Text>
          <Text style={styles.addressName}>{order.deliveryAddress.name}</Text>
          <Text style={styles.addressLine}>
            {order.deliveryAddress.village}, {order.deliveryAddress.taluk}, {order.deliveryAddress.district}
          </Text>
          <Text style={styles.addressLine}>
            {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
          </Text>
          <Text style={styles.addressPhone}>📞 {order.deliveryAddress.mobile}</Text>
        </View>

        {/* Billing Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>🧾 Payment Breakdown</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Subtotal</Text>
            <Text style={styles.billVal}>₹{order.subtotal.toLocaleString('en-IN')}</Text>
          </View>
          {order.discount > 0 && (
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: '#0F613B' }]}>Discount</Text>
              <Text style={[styles.billVal, { color: '#0F613B' }]}>-₹{order.discount.toLocaleString('en-IN')}</Text>
            </View>
          )}
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Charges</Text>
            <Text style={styles.billVal}>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.billRow}>
            <Text style={styles.billTotalLabel}>Total ({order.paymentMethod.toUpperCase()})</Text>
            <Text style={styles.billTotalVal}>₹{order.total.toLocaleString('en-IN')}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footerBar}>
        <Pressable
          style={styles.continueBtn}
          onPress={() => router.push('/(tabs)/market')}
        >
          <Text style={styles.continueBtnText}>Continue Shopping in Market →</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F9F6' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2EBE5',
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F6F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { fontSize: 22, fontWeight: '700', color: '#111E15' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#111E15' },
  headerSub: { fontSize: 11, color: '#66776C', fontWeight: '500' },
  statusBadge: {
    backgroundColor: '#E7F5EC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: { fontSize: 11, fontWeight: '800', color: '#0F613B' },
  scrollContent: { padding: 16, paddingBottom: 30 },
  banner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#CDE5D6',
    ...shadow.card,
  },
  bannerTitle: { fontSize: 18, fontWeight: '800', color: '#0F613B', textAlign: 'center' },
  bannerSub: { fontSize: 13, color: '#526E5C', marginTop: 4, textAlign: 'center' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2EBE5',
    marginBottom: 14,
    ...shadow.card,
  },
  cardHeading: { fontSize: 15, fontWeight: '800', color: '#111E15', marginBottom: 12 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F1',
  },
  itemEmoji: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F0F6F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { fontSize: 11, fontWeight: '700', color: '#0F613B', textTransform: 'uppercase' },
  itemName: { fontSize: 13, fontWeight: '700', color: '#111E15' },
  itemVariant: { fontSize: 11, color: '#66776C', marginTop: 2 },
  itemTotal: { fontSize: 14, fontWeight: '800', color: '#111E15' },
  addressName: { fontSize: 14, fontWeight: '800', color: '#111E15', marginBottom: 4 },
  addressLine: { fontSize: 13, color: '#4A5B50', lineHeight: 20 },
  addressPhone: { fontSize: 13, color: '#0F613B', fontWeight: '700', marginTop: 6 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  billLabel: { fontSize: 13, color: '#66776C' },
  billVal: { fontSize: 13, fontWeight: '700', color: '#111E15' },
  divider: { height: 1, backgroundColor: '#EAEFEA', marginVertical: 8 },
  billTotalLabel: { fontSize: 15, fontWeight: '800', color: '#111E15' },
  billTotalVal: { fontSize: 18, fontWeight: '900', color: '#0F613B' },
  footerBar: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2EBE5',
  },
  continueBtn: {
    backgroundColor: '#0F613B',
    borderRadius: radius.full,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  continueBtnText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
  backBtnAction: {
    marginTop: 16,
    backgroundColor: '#0F613B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
});
