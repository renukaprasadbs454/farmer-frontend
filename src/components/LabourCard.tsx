import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, shadow, spacing } from '../constants/theme';
import { useT } from '../i18n';
import { labourCategoryLabel } from '../constants/serviceCategories';
import { Labourer } from '../types';

type Props = {
  labourer: Labourer;
  onPress: () => void;
  onSave?: () => void;
  isSaved?: boolean;
  compact?: boolean;
};

const SKILL_ICONS: Record<string, string> = {
  harvesting: '🌾',
  planting: '🌱',
  irrigation: '💧',
  weeding: '🌿',
  spraying: '🛡️',
  loading: '📦',
  general: '👨‍🌾',
};

export function LabourCard({ labourer, onPress, onSave, isSaved, compact }: Props) {
  const t = useT();
  const serviceIcon = SKILL_ICONS[labourer.primarySkill] || '👨‍🌾';
  const availLabel =
    labourer.availability === 'available_today'
      ? t('availableToday')
      : labourer.availability === 'available_tomorrow'
        ? t('availableTomorrow')
        : t('unavailable');
  const availColor =
    labourer.availability === 'available_today'
      ? colors.primary
      : labourer.availability === 'available_tomorrow'
        ? '#D4870E'
        : colors.muted;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [s.card, compact && s.compact, pressed && { opacity: 0.92 }]}
    >
      <View style={s.row}>
        <View style={s.avatar}>
          <Text style={{ fontSize: 26 }}>{serviceIcon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.name} numberOfLines={1}>{labourer.name}</Text>
          <View style={s.confidentialBadge}>
            <Text style={s.confidentialText}>🛡️ Verified Service · Assigned on Booking</Text>
          </View>
        </View>
        {onSave && (
          <Pressable accessibilityRole="button" onPress={onSave} hitSlop={12} style={s.heart}>
            <Text style={{ fontSize: 22 }}>{isSaved ? '❤️' : '🤍'}</Text>
          </Pressable>
        )}
      </View>

      {!compact && (
        <>
          <View style={s.meta}>
            <Text style={s.metaText}>⭐ {labourer.rating.toFixed(1)}  ·  {labourer.completedJobs} {t('jobs')}</Text>
            <Text style={s.metaText}>📍 {labourer.distance} {t('kmAway')}</Text>
          </View>

          <View style={s.footer}>
            <View>
              <Text style={s.price}>₹{labourer.dailyRate} <Text style={s.priceUnit}>{t('perDay')} / worker</Text></Text>
              <Text style={[s.avail, { color: availColor }]}>{availLabel}</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={onPress} style={s.cta}>
              <Text style={s.ctaText}>{t('bookService')}</Text>
            </Pressable>
          </View>
        </>
      )}

      {compact && (
        <View style={s.compactMeta}>
          <Text style={s.price}>₹{labourer.dailyRate}{t('perDay')}</Text>
          <Text style={s.metaText}>📍 {labourer.distance} {t('kmAway')}</Text>
        </View>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.card,
  },
  compact: { padding: spacing.sm + 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 22, color: '#fff', fontWeight: '800' },
  name: { fontSize: font.body, fontWeight: '700', color: colors.ink },
  confidentialBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 3,
  },
  confidentialText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0F613B',
  },
  skill: { fontSize: font.small, color: colors.muted, marginTop: 2 },
  heart: { padding: 4 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm + 2 },
  metaText: { fontSize: font.small, color: colors.muted },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: spacing.sm + 2 },
  price: { fontSize: font.body, fontWeight: '800', color: colors.primaryDark },
  priceUnit: { fontSize: 11, fontWeight: '600', color: colors.muted },
  avail: { fontSize: font.small, fontWeight: '600', marginTop: 2 },
  cta: {
    backgroundColor: colors.primarySoft, borderRadius: radius.md,
    paddingHorizontal: 18, paddingVertical: 10,
  },
  ctaText: { fontSize: font.small, fontWeight: '700', color: colors.primaryDark },
  compactMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs + 2 },
});
