import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, shadow, spacing } from '../../src/constants/theme';
import { useCartStore } from '../../src/store/cartStore';
import { useFarmerStore } from '../../src/store/farmerStore';
import { useProductOrderStore } from '../../src/store/productOrderStore';
import { PaymentMethod, ProductOrder } from '../../src/types';

export default function CheckoutScreen() {
  const router = useRouter();
  const { farmer, farm } = useFarmerStore();
  const { items, getSubtotal, getDiscount, getDeliveryFee, getTotal, clearCart } = useCartStore();
  const { addOrder } = useProductOrderStore();

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();

  const [deliveryName, setDeliveryName] = useState(farmer.name || 'Farmer');
  const [deliveryMobile, setDeliveryMobile] = useState(farmer.mobile || '');
  const [deliveryAddress, setDeliveryAddress] = useState(
    farmer.gpsLabel || [farm.village, farm.taluk, farm.district, farm.state].filter(Boolean).join(', ') || 'Karnataka, India'
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [isPlacing, setIsPlacing] = useState(false);

  const handlePlaceOrder = () => {
    setIsPlacing(true);
    const orderId = `FM-ORD-${Date.now().toString().slice(-6)}`;

    const newOrder: ProductOrder = {
      id: orderId,
      orderDate: new Date().toISOString(),
      items: items.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        brand: i.product.brand,
        image: i.product.images[0] || '🌾',
        packSize: i.variant.packSize,
        unitPrice: i.variant.price,
        quantity: i.quantity,
        subtotal: i.variant.price * i.quantity,
      })),
      subtotal,
      discount,
      deliveryFee,
      total,
      deliveryAddress: {
        name: deliveryName,
        mobile: deliveryMobile,
        village: farm.village || 'Village',
        taluk: farm.taluk || '',
        district: farm.district || '',
        state: farm.state || 'Karnataka',
        pincode: farm.pincode || '',
      },
      paymentMethod,
      status: 'placed',
      estimatedDelivery: '3–4 business days',
      statusTimeline: [
        {
          status: 'placed',
          label: 'Order Placed & Acknowledged',
          date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
          completed: true,
          current: true,
        },
      ],
    };

    addOrder(newOrder);
    clearCart();

    setTimeout(() => {
      setIsPlacing(false);
      router.replace({ pathname: '/market/order/[id]', params: { id: orderId } } as any);
    }, 600);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => (router.canGoBack() ? router.back() : router.push('/market/cart' as any))}
        >
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Order Checkout</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Farm Delivery Address */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>🏡 Delivery Destination</Text>
          <Text style={styles.label}>Recipient Name</Text>
          <TextInput
            style={styles.input}
            value={deliveryName}
            onChangeText={setDeliveryName}
            placeholder="Farmer Full Name"
          />

          <Text style={styles.label}>Contact Phone Number</Text>
          <TextInput
            style={styles.input}
            value={deliveryMobile}
            onChangeText={setDeliveryMobile}
            keyboardType="phone-pad"
            placeholder="Mobile number for delivery coordination"
          />

          <Text style={styles.label}>Farm / Village Address</Text>
          <TextInput
            style={[styles.input, { height: 72 }]}
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            multiline
            placeholder="Village, Taluk, District"
          />
        </View>

        {/* Payment Mode Selection */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>💳 Choose Payment Method</Text>

          <Pressable
            style={[styles.paymentOption, paymentMethod === 'cod' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('cod')}
          >
            <Text style={{ fontSize: 24, marginRight: 10 }}>💵</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.paymentTitle}>Cash on Delivery (COD)</Text>
              <Text style={styles.paymentSub}>Pay driver / agent upon farm delivery inspection</Text>
            </View>
            <View style={[styles.radio, paymentMethod === 'cod' && styles.radioActive]} />
          </Pressable>

          <Pressable
            style={[styles.paymentOption, paymentMethod === 'upi' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('upi')}
          >
            <Text style={{ fontSize: 24, marginRight: 10 }}>📱</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.paymentTitle}>UPI Instant Payment</Text>
              <Text style={styles.paymentSub}>Google Pay, PhonePe, Paytm, BHIM</Text>
            </View>
            <View style={[styles.radio, paymentMethod === 'upi' && styles.radioActive]} />
          </Pressable>
        </View>

        {/* Price Summary */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>📋 Final Payable Amount</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Items Total ({items.length})</Text>
            <Text style={styles.rowVal}>₹{subtotal.toLocaleString('en-IN')}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: '#0F613B' }]}>Special Agri Rebate</Text>
              <Text style={[styles.rowVal, { color: '#0F613B' }]}>-₹{discount.toLocaleString('en-IN')}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Delivery to Farm</Text>
            <Text style={styles.rowVal}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total Amount Payable</Text>
            <Text style={styles.totalVal}>₹{total.toLocaleString('en-IN')}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Confirm Button Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={{ fontSize: 11, color: '#66776C', fontWeight: '600' }}>Amount to pay:</Text>
          <Text style={{ fontSize: 20, fontWeight: '900', color: '#0F613B' }}>₹{total.toLocaleString('en-IN')}</Text>
        </View>
        <Pressable
          style={[styles.confirmBtn, isPlacing && { opacity: 0.6 }]}
          onPress={handlePlaceOrder}
          disabled={isPlacing}
        >
          <Text style={styles.confirmBtnText}>
            {isPlacing ? 'Placing Order...' : 'Confirm & Place Order →'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F9F6' },
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
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111E15' },
  scrollContent: { padding: 16, paddingBottom: 30 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2EBE5',
    marginBottom: 14,
    ...shadow.card,
  },
  cardHeader: { fontSize: 15, fontWeight: '800', color: '#111E15', marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '700', color: '#55655B', marginTop: 8, marginBottom: 4 },
  input: {
    backgroundColor: '#F7FAF8',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D7E5DC',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111E15',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2EBE5',
    backgroundColor: '#FAFCFA',
    marginBottom: 10,
  },
  paymentOptionActive: {
    borderColor: '#0F613B',
    backgroundColor: '#EAF5EC',
  },
  paymentTitle: { fontSize: 14, fontWeight: '800', color: '#111E15' },
  paymentSub: { fontSize: 11, color: '#66776C', marginTop: 2 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#BDCEC3',
  },
  radioActive: {
    borderColor: '#0F613B',
    borderWidth: 6,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  rowLabel: { fontSize: 13, color: '#66776C' },
  rowVal: { fontSize: 13, fontWeight: '700', color: '#111E15' },
  divider: { height: 1, backgroundColor: '#EAEFEA', marginVertical: 8 },
  totalLabel: { fontSize: 15, fontWeight: '800', color: '#111E15' },
  totalVal: { fontSize: 18, fontWeight: '900', color: '#0F613B' },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2EBE5',
    ...shadow.card,
  },
  confirmBtn: {
    backgroundColor: '#0F613B',
    borderRadius: radius.full,
    paddingHorizontal: 24,
    paddingVertical: 14,
    ...shadow.card,
  },
  confirmBtnText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
});
