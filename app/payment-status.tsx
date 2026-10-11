import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../src/components/ScreenContainer';
import { colors, font, radius, shadow, spacing } from '../src/constants/theme';

export default function PaymentStatusScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ status?: string; id?: string; mode?: string; amount?: string }>();

  const status = params.status || 'success';
  const bookingId = params.id || 'FM-BOOK-8931';
  const mode = params.mode || 'Cash on Delivery (COD)';
  const amount = params.amount || '₹2,500';

  const isSuccess = status === 'success';

  return (
    <ScreenContainer>
      <View style={s.container}>
        <Text style={{ fontSize: 72 }}>{isSuccess ? '✅' : '❌'}</Text>
        <Text style={[s.title, { color: isSuccess ? colors.primaryDark : '#D32F2F' }]}>
          {isSuccess ? 'Booking & Cash Agreement Confirmed!' : 'Payment Transaction Failed'}
        </Text>
        <Text style={s.subtitle}>
          {isSuccess
            ? 'Your booking request is active. Pay directly to the provider upon completion of work on your farm.'
            : 'We were unable to process your transaction. Please try again or switch to Cash on Delivery.'}
        </Text>

        <View style={s.receiptCard}>
          <Text style={s.receiptTitle}>RECEIPT / TRANSACTION SUMMARY</Text>
          <View style={s.row}>
            <Text style={s.label}>Booking Reference:</Text>
            <Text style={s.val}>{bookingId}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.label}>Payment Method:</Text>
            <Text style={s.val}>{mode}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.label}>Estimated Total:</Text>
            <Text style={[s.val, { fontWeight: '900', color: colors.primaryDark }]}>{amount}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.label}>Status:</Text>
            <Text style={[s.val, { color: isSuccess ? colors.primary : '#D32F2F', fontWeight: '800' }]}>
              {isSuccess ? 'CONFIRMED (COD)' : 'FAILED'}
            </Text>
          </View>
        </View>

        <Pressable style={s.primaryBtn} onPress={() => router.replace('/(tabs)/orders')}>
          <Text style={s.primaryBtnText}>📋 View My Orders</Text>
        </Pressable>

        <Pressable style={s.secondaryBtn} onPress={() => router.replace('/(tabs)/home')}>
          <Text style={s.secondaryBtnText}>🏠 Return to Home</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  title: { fontSize: font.title, fontWeight: '800', marginTop: spacing.md, textAlign: 'center' },
  subtitle: { fontSize: font.body, color: colors.muted, textAlign: 'center', marginTop: spacing.xs, lineHeight: 22 },
  receiptCard: { backgroundColor: colors.card, width: '100%', borderRadius: radius.md, padding: spacing.md, marginTop: spacing.lg, ...shadow.card },
  receiptTitle: { fontSize: 11, fontWeight: '800', color: colors.muted, letterSpacing: 0.5, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6 },
  label: { fontSize: font.small, color: colors.muted },
  val: { fontSize: font.small, fontWeight: '700', color: colors.ink },
  primaryBtn: { backgroundColor: colors.primary, width: '100%', paddingVertical: 14, borderRadius: radius.md, alignItems: 'center', marginTop: spacing.xl, ...shadow.card },
  primaryBtnText: { color: '#FFF', fontWeight: '800', fontSize: font.body },
  secondaryBtn: { backgroundColor: colors.surfaceVariant, width: '100%', paddingVertical: 14, borderRadius: radius.md, alignItems: 'center', marginTop: spacing.sm },
  secondaryBtnText: { color: colors.primaryDark, fontWeight: '700', fontSize: font.body },
});
