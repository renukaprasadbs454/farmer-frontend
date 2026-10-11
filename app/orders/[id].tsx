import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookingStatusBadge } from '../../src/components/BookingStatusBadge';
import { Button } from '../../src/components/Button';
import { colors, font, radius, shadow, spacing } from '../../src/constants/theme';
import { useT } from '../../src/i18n';
import { useBookingStore } from '../../src/store/bookingStore';
import { ServiceBooking } from '../../src/types';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useT();
  const router = useRouter();
  const bookings = useBookingStore((s) => s.bookings);
  const cancelBooking = useBookingStore((s) => s.cancelBooking);

  const [booking, setBooking] = useState<ServiceBooking | undefined>(undefined);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (id) {
      const found = bookings.find((b) => b.id === id);
      setBooking(found);
    }
  }, [id, bookings]);

  if (!booking) {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      </SafeAreaView>
    );
  }

  const isLabour = booking.type === 'labour';
  const canCancel = booking.status === 'requested' || booking.status === 'accepted';

  const handleCancel = async () => {
    setCancelling(true);
    await cancelBooking(booking.id);
    setCancelling(false);
    setCancelModal(false);
  };

  const handleContact = () => {
    if (Platform.OS === 'web') {
      alert('Contact feature coming soon.');
    } else {
      Alert.alert(t('contact'), 'Contact feature coming soon.');
    }
  };

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>← {t('back')}</Text>
        </Pressable>

        {/* Header */}
        <View style={s.header}>
          <Text style={{ fontSize: 44 }}>{isLabour ? '👨‍🌾' : '🚜'}</Text>
          <Text style={s.title}>
            {isLabour ? booking.labourerName : booking.machineryName}
          </Text>
          <BookingStatusBadge status={booking.status} />
        </View>

        {/* OTP Display for Trust & Verification */}
        {booking.status === 'accepted' && (
          <View style={s.otpCard}>
            <Text style={s.otpTitle}>Share OTP with Provider</Text>
            <Text style={s.otpValue}>
              {booking.id.replace(/\D/g, '').substring(0, 4) || String(Math.abs(booking.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 1000) % 9000 + 1000))}
            </Text>
            <Text style={s.otpDesc}>
              The provider will need this OTP to start the job. Do not share it until they arrive at your farm.
            </Text>
          </View>
        )}

        {/* Details Card */}
        <View style={s.card}>
          <DetailRow label={t('bookingId')} value={booking.id} />
          {isLabour && booking.workType && <DetailRow label={t('workType')} value={booking.workType} />}
          {!isLabour && booking.serviceDescription && <DetailRow label={t('serviceType')} value={booking.serviceDescription} />}
          <DetailRow label={t('date')} value={booking.date} />
          <DetailRow label={t('startTime')} value={booking.startTime} />
          <DetailRow label={t('duration')} value={`${booking.duration} ${t('hours')}`} />
          {isLabour && booking.numberOfWorkers && (
            <DetailRow label={t('numberOfWorkers')} value={String(booking.numberOfWorkers)} />
          )}
          {!isLabour && booking.areaOfWork && (
            <DetailRow label={t('areaOfWork')} value={`${booking.areaOfWork} ${t('acres')}`} />
          )}
          <DetailRow label={t('farmLocation')} value={booking.farmLocation} />
          <DetailRow label={t('pricingType')} value={booking.pricingType} />
          {booking.additionalInstructions ? (
            <DetailRow label={t('additionalInstructions')} value={booking.additionalInstructions} />
          ) : null}
        </View>

        {/* Cost */}
        <View style={s.costCard}>
          <Text style={s.costLabel}>{t('estimatedCost')}</Text>
          <Text style={s.costVal}>₹{booking.estimatedTotal.toLocaleString('en-IN')}</Text>
        </View>

        {/* Actions */}
        <View style={s.actions}>
          <Button title={t('contact')} variant="outline" onPress={handleContact} style={{ flex: 1 }} />
          {canCancel && (
            <Button title={t('cancelBooking')} variant="outline" onPress={() => setCancelModal(true)} style={{ flex: 1, borderColor: colors.danger }} />
          )}
        </View>
      </ScrollView>

      {/* Cancel Modal */}
      <Modal visible={cancelModal} transparent animationType="fade" statusBarTranslucent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>{t('cancelConfirmTitle')}</Text>
            <Text style={s.modalMsg}>{t('cancelConfirmMsg')}</Text>
            <View style={s.modalActions}>
              <Button title={t('keepBooking')} variant="outline" onPress={() => setCancelModal(false)} style={{ flex: 1 }} />
              <Button title={t('cancelBooking')} onPress={handleCancel} loading={cancelling} style={{ flex: 1, backgroundColor: colors.danger }} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={dr.row}>
      <Text style={dr.label}>{label}</Text>
      <Text style={dr.value}>{value}</Text>
    </View>
  );
}

const dr = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { fontSize: font.small + 1, color: colors.muted, flex: 1 },
  value: { fontSize: font.small + 1, fontWeight: '600', color: colors.ink, flex: 1, textAlign: 'right' },
});

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing.lg },
  backBtn: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  backText: { fontSize: font.body, color: colors.primary, fontWeight: '600' },
  header: { alignItems: 'center', marginTop: spacing.md, gap: spacing.sm },
  title: { fontSize: font.title, fontWeight: '800', color: colors.ink },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.lg, ...shadow.card },
  costCard: {
    backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.md,
    marginTop: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  costLabel: { fontSize: font.body, fontWeight: '700', color: colors.primaryDark },
  costVal: { fontSize: font.title, fontWeight: '800', color: colors.primaryDark },
  actions: { flexDirection: 'row', gap: 12, marginTop: spacing.lg },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  modalContent: { backgroundColor: colors.bg, borderRadius: radius.lg, padding: spacing.lg, width: '100%', maxWidth: 400 },
  modalTitle: { fontSize: font.title, fontWeight: '800', color: colors.ink },
  modalMsg: { fontSize: font.body, color: colors.muted, marginTop: 8 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: spacing.lg },
  otpCard: { backgroundColor: colors.accent, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.lg, alignItems: 'center', ...shadow.card },
  otpTitle: { fontSize: font.body, fontWeight: '800', color: colors.accentInk },
  otpValue: { fontSize: 48, fontWeight: '800', color: colors.accentInk, letterSpacing: 8, marginVertical: spacing.sm },
  otpDesc: { fontSize: font.small, color: colors.accentInk, textAlign: 'center', opacity: 0.9 },
});
