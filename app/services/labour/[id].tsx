import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookingStatusBadge } from '../../../src/components/BookingStatusBadge';
import { Button } from '../../../src/components/Button';
import { Chip } from '../../../src/components/Chip';
import { labourCategoryLabel } from '../../../src/constants/serviceCategories';
import { colors, font, radius, shadow, spacing } from '../../../src/constants/theme';
import { useT } from '../../../src/i18n';
import { labourService } from '../../../src/services/labourService';
import { useServiceStore } from '../../../src/store/serviceStore';
import { Labourer } from '../../../src/types';

export default function LabourDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useT();
  const router = useRouter();
  const [labourer, setLabourer] = useState<Labourer | null>(null);
  const [loading, setLoading] = useState(true);
  const { savedLabourIds, toggleSaveLabour } = useServiceStore();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    labourService.getLabourerById(id).then((l) => {
      setLabourer(l);
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
  if (!labourer) {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.center}><Text style={s.errorText}>{t('noLabourFound')}</Text></View>
      </SafeAreaView>
    );
  }

  const isSaved = savedLabourIds.includes(labourer.id);
  const availLabel =
    labourer.availability === 'available_today' ? t('availableToday')
      : labourer.availability === 'available_tomorrow' ? t('availableTomorrow')
        : t('unavailable');
  const availColor = labourer.availability === 'available_today' ? colors.primary
    : labourer.availability === 'available_tomorrow' ? '#D4870E' : colors.muted;

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Back + Save */}
        <View style={s.topRow}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backText}>← {t('back')}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => toggleSaveLabour(labourer.id)}>
            <Text style={{ fontSize: 26 }}>{isSaved ? '❤️' : '🤍'}</Text>
          </Pressable>
        </View>

        {/* Profile */}
        <View style={s.profile}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{labourer.name.charAt(0)}</Text>
          </View>
          <Text style={s.name}>{labourer.name}</Text>
          <Text style={s.skill}>{labourCategoryLabel(labourer.primarySkill)}</Text>
          <View style={s.statsRow}>
            <Text style={s.stat}>⭐ {labourer.rating.toFixed(1)}</Text>
            <Text style={s.statSep}>·</Text>
            <Text style={s.stat}>{labourer.completedJobs} {t('completedJobs')}</Text>
            <Text style={s.statSep}>·</Text>
            <Text style={s.stat}>{labourer.experience} {t('yearsExperience')}</Text>
          </View>
          <Text style={[s.avail, { color: availColor }]}>{availLabel}</Text>
        </View>

        {/* Skills */}
        <Text style={s.section}>{t('skills')}</Text>
        <View style={s.chipRow}>
          <Chip label={labourCategoryLabel(labourer.primarySkill)} selected onPress={() => {}} />
          {labourer.secondarySkills.map((sk) => (
            <Chip key={sk} label={labourCategoryLabel(sk)} onPress={() => {}} />
          ))}
        </View>

        {/* Pricing */}
        <Text style={s.section}>{t('pricing')}</Text>
        <View style={s.card}>
          <View style={s.priceRow}>
            <Text style={s.priceLabel}>{t('hourlyRate')}</Text>
            <Text style={s.priceVal}>₹{labourer.hourlyRate}{t('perHour')}</Text>
          </View>
          <View style={s.priceRow}>
            <Text style={s.priceLabel}>{t('dailyRate')}</Text>
            <Text style={s.priceVal}>₹{labourer.dailyRate}{t('perDay')}</Text>
          </View>
        </View>

        {/* Location */}
        <Text style={s.section}>{t('location')}</Text>
        <Text style={s.body}>📍 {labourer.location.label} — {labourer.distance} {t('kmAway')}</Text>

        {/* About */}
        <Text style={s.section}>{t('about')}</Text>
        <Text style={s.body}>{labourer.about}</Text>

        {/* Reviews */}
        <Text style={s.section}>{t('reviews')}</Text>
        {labourer.reviews.map((r) => (
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
          title={t('requestWorker')}
          onPress={() => router.push(`/services/labour/booking?id=${labourer.id}`)}
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
  avatar: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 36, color: '#fff', fontWeight: '800' },
  name: { fontSize: font.title, fontWeight: '800', color: colors.ink, marginTop: spacing.md },
  skill: { fontSize: font.body, color: colors.muted, marginTop: 4 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, flexWrap: 'wrap', justifyContent: 'center' },
  stat: { fontSize: font.small, color: colors.ink },
  statSep: { fontSize: font.body, color: colors.muted, marginHorizontal: 8 },
  avail: { fontSize: font.body, fontWeight: '700', marginTop: spacing.sm },
  section: { fontSize: font.body, fontWeight: '800', color: colors.ink, marginTop: spacing.lg, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, ...shadow.card },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  priceLabel: { fontSize: font.body, color: colors.muted },
  priceVal: { fontSize: font.body, fontWeight: '800', color: colors.primaryDark },
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
