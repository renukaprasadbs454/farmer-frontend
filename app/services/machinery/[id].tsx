import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../src/components/Button';
import { Chip } from '../../../src/components/Chip';
import { machineryCategoryLabel } from '../../../src/constants/serviceCategories';
import { colors, font, radius, shadow, spacing } from '../../../src/constants/theme';
import { useT } from '../../../src/i18n';
import { machineryService } from '../../../src/services/machineryService';
import { useServiceStore } from '../../../src/store/serviceStore';
import { Machinery } from '../../../src/types';

export default function MachineryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useT();
  const router = useRouter();
  const [machine, setMachine] = useState<Machinery | null>(null);
  const [loading, setLoading] = useState(true);
  const { savedMachineryIds, toggleSaveMachinery } = useServiceStore();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    machineryService.getMachineryById(id).then((m) => {
      setMachine(m);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      </SafeAreaView>
    );
  }
  if (!machine) {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.center}><Text style={s.errorText}>{t('noMachineryFound')}</Text></View>
      </SafeAreaView>
    );
  }

  const isSaved = savedMachineryIds.includes(machine.id);
  const availLabel =
    machine.availability === 'available_today' ? t('availableToday')
      : machine.availability === 'available_tomorrow' ? t('availableTomorrow')
        : t('unavailable');
  const availColor = machine.availability === 'available_today' ? colors.primary
    : machine.availability === 'available_tomorrow' ? '#D4870E' : colors.muted;

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Back + Save */}
        <View style={s.topRow}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backText}>← {t('back')}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => toggleSaveMachinery(machine.id)}>
            <Text style={{ fontSize: 26 }}>{isSaved ? '❤️' : '🤍'}</Text>
          </Pressable>
        </View>

        {/* Header */}
        <View style={s.profile}>
          <Text style={{ fontSize: 56 }}>🚜</Text>
          <Text style={s.name}>{machine.name}</Text>
          <Text style={s.type}>{machineryCategoryLabel(machine.type)}</Text>
          <View style={s.statsRow}>
            <Text style={s.stat}>⭐ {machine.rating.toFixed(1)}</Text>
            <Text style={s.statSep}>·</Text>
            <Text style={s.stat}>{machine.reviewCount} {t('reviews')}</Text>
          </View>
          <Text style={[s.avail, { color: availColor }]}>{availLabel}</Text>
        </View>

        {/* Confidentiality Dispatch Notice */}
        <View style={s.confidentialBox}>
          <Text style={s.confidentialBoxIcon}>🔒</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.confidentialBoxTitle}>Confidential Equipment & Operator Dispatch</Text>
            <Text style={s.confidentialBoxDesc}>
              Service partner and operator personal details are confidential. Farmer Mate dispatches certified farm machinery and trained operators to your farm location on your scheduled date.
            </Text>
          </View>
        </View>

        {/* Specifications */}
        <Text style={s.section}>{t('specifications')}</Text>
        <View style={s.chipRow}>
          {machine.specifications.map((spec) => (
            <Chip key={spec} label={spec} onPress={() => {}} />
          ))}
        </View>

        {/* Pricing */}
        <Text style={s.section}>{t('pricing')}</Text>
        <View style={s.card}>
          <View style={s.priceRow}>
            <Text style={s.priceLabel}>{t('hourlyRate')}</Text>
            <Text style={s.priceVal}>₹{machine.hourlyRate} {t('perHour')}</Text>
          </View>
          <View style={s.priceRow}>
            <Text style={s.priceLabel}>{t('dailyRate')}</Text>
            <Text style={s.priceVal}>₹{machine.dailyRate} {t('perDay')}</Text>
          </View>
          {machine.perAcreRate && (
            <View style={s.priceRow}>
              <Text style={s.priceLabel}>{t('perAcreRate')}</Text>
              <Text style={s.priceVal}>₹{machine.perAcreRate} {t('perAcre')}</Text>
            </View>
          )}
          <View style={s.priceRow}>
            <Text style={s.priceLabel}>{t('minimumBooking')}</Text>
            <Text style={s.priceVal}>{machine.minimumBookingHours} {t('hours')}</Text>
          </View>
        </View>

        {machine.operatorIncluded && (
          <Text style={s.operator}>✅ {t('operatorIncluded')}</Text>
        )}

        {/* Location */}
        <Text style={s.section}>{t('location')}</Text>
        <Text style={s.body}>📍 {machine.location.label} — {machine.distance} {t('kmAway')}</Text>

        {/* Description */}
        <Text style={s.section}>{t('about')}</Text>
        <Text style={s.body}>{machine.description}</Text>

        {/* Reviews */}
        <Text style={s.section}>{t('reviews')}</Text>
        {machine.reviews.map((r) => (
          <View key={r.id} style={s.reviewCard}>
            <View style={s.reviewTop}>
              <Text style={s.reviewName}>{r.reviewerName}</Text>
              <Text style={s.reviewRating}>⭐ {r.rating}</Text>
            </View>
            <Text style={s.reviewComment}>{r.comment}</Text>
            <Text style={s.reviewDate}>{r.date}</Text>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed CTA */}
      <View style={s.ctaWrap}>
        <Button
          title={t('bookService')}
          onPress={() => router.push(`/services/machinery/booking?id=${machine.id}`)}
        />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: font.body, color: colors.muted },
  scroll: { padding: spacing.lg },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { minHeight: 44, justifyContent: 'center' },
  backText: { fontSize: font.body, color: colors.primary, fontWeight: '600' },
  profile: { alignItems: 'center', marginTop: spacing.md },
  name: { fontSize: font.title, fontWeight: '800', color: colors.ink, marginTop: spacing.sm },
  type: { fontSize: font.body, color: colors.muted, marginTop: 4 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, flexWrap: 'wrap', justifyContent: 'center' },
  stat: { fontSize: font.small, color: colors.ink },
  statSep: { fontSize: font.body, color: colors.muted, marginHorizontal: 8 },
  avail: { fontSize: font.body, fontWeight: '700', marginTop: spacing.sm },
  confidentialBox: {
    flexDirection: 'row',
    backgroundColor: '#EBF4EE',
    borderWidth: 1,
    borderColor: '#C5E2D0',
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    gap: 12,
    alignItems: 'center',
  },
  confidentialBoxIcon: {
    fontSize: 24,
  },
  confidentialBoxTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F613B',
    marginBottom: 2,
  },
  confidentialBoxDesc: {
    fontSize: 11.5,
    color: '#2E4C38',
    lineHeight: 16,
  },
  section: { fontSize: font.body, fontWeight: '800', color: colors.ink, marginTop: spacing.lg, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, ...shadow.card },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  priceLabel: { fontSize: font.body, color: colors.muted },
  priceVal: { fontSize: font.body, fontWeight: '800', color: colors.primaryDark },
  operator: { fontSize: font.body, color: colors.primary, fontWeight: '600', marginTop: spacing.sm },
  body: { fontSize: font.body, color: colors.ink, lineHeight: 26 },
  reviewCard: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: 10, ...shadow.card },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewName: { fontSize: font.body, fontWeight: '700', color: colors.ink },
  reviewRating: { fontSize: font.small, color: colors.muted },
  reviewComment: { fontSize: font.body, color: colors.ink, marginTop: 6, lineHeight: 24 },
  reviewDate: { fontSize: font.small - 1, color: colors.muted, marginTop: 6 },
  ctaWrap: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: spacing.lg, paddingBottom: spacing.xl,
    backgroundColor: colors.bg,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
});
