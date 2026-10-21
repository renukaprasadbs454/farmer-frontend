import { useRouter } from 'expo-router';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, radius, shadow, spacing } from '../../src/constants/theme';
import { useCartStore } from '../../src/store/cartStore';
import { CartItem } from '../../src/types';

export default function CartScreen() {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getItemCount,
    getSubtotal,
    getDiscount,
    getDeliveryFee,
    getTotal,
  } = useCartStore();

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();
  const itemCount = getItemCount();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => (router.canGoBack() ? router.back() : router.push('/(tabs)/market'))}
        >
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          <Text style={styles.headerSub}>
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in your basket
          </Text>
        </View>
        {items.length > 0 && (
          <Pressable onPress={clearCart} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Clear</Text>
          </Pressable>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Text style={{ fontSize: 44 }}>🛒</Text>
          </View>
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Add certified seeds, organic fertilizers, pesticides, and tools directly to your basket.
          </Text>
          <Pressable
            style={styles.browseBtn}
            onPress={() => router.push('/(tabs)/market')}
          >
            <Text style={styles.browseBtnText}>Explore Agricultural Inputs →</Text>
          </Pressable>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Free Delivery Banner */}
            <View style={styles.deliveryBanner}>
              <Text style={{ fontSize: 18, marginRight: 8 }}>🚚</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerTitle}>
                  {subtotal > 1500
                    ? '🎉 Free Farm Delivery unlocked!'
                    : `Add ₹${Math.max(0, 1500 - subtotal)} more for Free Farm Delivery`}
                </Text>
                <Text style={styles.bannerSub}>
                  Direct dispatch to village pickup point or doorstep
                </Text>
              </View>
            </View>

            {/* Cart Items List */}
            <View style={styles.itemsList}>
              {items.map((item: CartItem, idx: number) => {
                const itemPrice = item.variant?.price || 0;
                const itemMrp = item.variant?.mrp || itemPrice;
                const savings = itemMrp > itemPrice ? (itemMrp - itemPrice) * item.quantity : 0;

                return (
                  <View key={`${item.product.id}-${item.variant.id}-${idx}`} style={styles.cartCard}>
                    {/* Thumbnail */}
                    <View style={styles.itemImageContainer}>
                      <Text style={{ fontSize: 36 }}>{item.product.images[0] || '🌾'}</Text>
                    </View>

                    {/* Details */}
                    <View style={styles.itemDetails}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.itemBrand}>{item.product.brand}</Text>
                        <Pressable
                          onPress={() => removeItem(item.product.id, item.variant.id)}
                          hitSlop={8}
                        >
                          <Text style={styles.removeText}>✕</Text>
                        </Pressable>
                      </View>

                      <Text style={styles.itemName} numberOfLines={2}>
                        {item.product.name}
                      </Text>
                      <Text style={styles.itemPack}>{item.variant.packSize}</Text>

                      <View style={styles.priceRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                          <Text style={styles.itemPrice}>
                            ₹{(itemPrice * item.quantity).toLocaleString('en-IN')}
                          </Text>
                          {savings > 0 && (
                            <Text style={styles.itemMrp}>
                              ₹{(itemMrp * item.quantity).toLocaleString('en-IN')}
                            </Text>
                          )}
                        </View>

                        {/* Quantity Counter */}
                        <View style={styles.quantityControl}>
                          <Pressable
                            style={styles.qtyBtn}
                            onPress={() => updateQuantity(item.product.id, item.variant.id, item.quantity - 1)}
                          >
                            <Text style={styles.qtyBtnText}>-</Text>
                          </Pressable>
                          <Text style={styles.qtyText}>{item.quantity}</Text>
                          <Pressable
                            style={styles.qtyBtn}
                            onPress={() => updateQuantity(item.product.id, item.variant.id, item.quantity + 1)}
                          >
                            <Text style={styles.qtyBtnText}>+</Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Bill Summary Breakdown */}
            <View style={styles.billCard}>
              <Text style={styles.billTitle}>Order Summary</Text>

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Item Subtotal ({itemCount} items)</Text>
                <Text style={styles.billValue}>₹{subtotal.toLocaleString('en-IN')}</Text>
              </View>

              {discount > 0 && (
                <View style={styles.billRow}>
                  <Text style={[styles.billLabel, { color: '#0F613B', fontWeight: '700' }]}>
                    Agricultural Scheme Discount
                  </Text>
                  <Text style={[styles.billValue, { color: '#0F613B', fontWeight: '700' }]}>
                    -₹{discount.toLocaleString('en-IN')}
                  </Text>
                </View>
              )}

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Farm Delivery Charge</Text>
                <Text style={styles.billValue}>
                  {deliveryFee === 0 ? (
                    <Text style={{ color: '#0F613B', fontWeight: '800' }}>FREE</Text>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={[styles.billRow, { marginTop: 4 }]}>
                <Text style={styles.billTotalLabel}>Grand Total</Text>
                <Text style={styles.billTotalValue}>₹{total.toLocaleString('en-IN')}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Fixed Bottom Checkout Bar */}
          <View style={styles.checkoutBar}>
            <View>
              <Text style={styles.totalPrompt}>To Pay:</Text>
              <Text style={styles.totalAmount}>₹{total.toLocaleString('en-IN')}</Text>
            </View>

            <Pressable
              style={styles.checkoutBtn}
              onPress={() => router.push('/market/checkout' as any)}
            >
              <Text style={styles.checkoutBtnText}>Proceed to Checkout →</Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
  backText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111E15',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111E15',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12,
    color: '#66776C',
    fontWeight: '600',
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: '#FBEBEB',
  },
  clearBtnText: {
    fontSize: 12,
    color: '#D32F2F',
    fontWeight: '700',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 24,
  },
  deliveryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7F5EC',
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: '#C6E8D2',
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F613B',
  },
  bannerSub: {
    fontSize: 11,
    color: '#527860',
    marginTop: 2,
  },
  itemsList: {
    gap: 12,
    marginBottom: 16,
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2EBE5',
    ...shadow.card,
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    backgroundColor: '#F0F7F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemBrand: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F613B',
    textTransform: 'uppercase',
  },
  removeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8D9B91',
    paddingHorizontal: 4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111E15',
    marginTop: 2,
  },
  itemPack: {
    fontSize: 11,
    color: '#66776C',
    marginTop: 2,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111E15',
  },
  itemMrp: {
    fontSize: 12,
    color: '#94A399',
    textDecorationLine: 'line-through',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F8F5',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#D7E5DC',
    paddingHorizontal: 4,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F613B',
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111E15',
    minWidth: 20,
    textAlign: 'center',
  },
  billCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2EBE5',
    ...shadow.card,
  },
  billTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111E15',
    marginBottom: 12,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  billLabel: {
    fontSize: 13,
    color: '#66776C',
  },
  billValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111E15',
  },
  divider: {
    height: 1,
    backgroundColor: '#EAEFEA',
    marginVertical: 10,
  },
  billTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111E15',
  },
  billTotalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F613B',
  },
  checkoutBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2EBE5',
    ...shadow.card,
  },
  totalPrompt: {
    fontSize: 11,
    color: '#66776C',
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F613B',
  },
  checkoutBtn: {
    backgroundColor: '#0F613B',
    borderRadius: radius.full,
    paddingHorizontal: 22,
    paddingVertical: 13,
    ...shadow.card,
  },
  checkoutBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EAF3ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111E15',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#66776C',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  browseBtn: {
    backgroundColor: '#0F613B',
    borderRadius: radius.full,
    paddingHorizontal: 24,
    paddingVertical: 14,
    ...shadow.card,
  },
  browseBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
