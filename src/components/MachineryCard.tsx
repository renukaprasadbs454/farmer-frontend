import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, shadow, spacing } from '../constants/theme';
import { useT } from '../i18n';
import { machineryCategoryLabel } from '../constants/serviceCategories';
import { Machinery } from '../types';

const MACHINE_EMOJI: Record<string, string> = {
  tractor: '🚜',
  jcb: '🏗️',
  rotavator: '⚙️',
  harvester: '🌾',
  sprayer: '💨',
  cultivator: '🔩',
  water_tanker: '🚰',
  transport: '🚛',
  other: '🔧',
};

type Props = {
  machinery: Machinery;
  onPress: () => void;
  onSave?: () => void;
  isSaved?: boolean;
  compact?: boolean;
};

export function MachineryCard({ machinery, onPress, onSave, isSaved, compact }: Props) {
  const t = useT();
  const emoji = MACHINE_EMOJI[machinery.type] ?? '🔧';
  const availLabel =
    machinery.availability === 'available_today'
      ? t('availableToday')
      : machinery.availability === 'available_tomorrow'
        ? t('availableTomorrow')
        : t('unavailable');
  const availColor =
    machinery.availability === 'available_today'
      ? colors.primary
      : machinery.availability === 'available_tomorrow'
        ? '#D4870E'
        : colors.muted;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [s.card, compact && s.compact, pressed && { opacity: 0.92 }]}
    >
      <View style={s.row}>
        <View style={s.iconWrap}>
          <Text style={{ fontSize: 32 }}>{emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.name} numberOfLines={1}>{machinery.name}</Text>
          <Text style={s.type}>{machineryCategoryLabel(machinery.type)}</Text>
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
            <Text style={s.metaText}>⭐ {machinery.rating.toFixed(1)}  ·  {machinery.reviewCount} {t('reviews')}</Text>
            <Text style={s.metaText}>📍 {machinery.distance} {t('kmAway')}</Text>
          </View>

          <View style={s.priceRow}>
            <Text style={s.price}>₹{machinery.hourlyRate} {t('perHour')}</Text>
            <Text style={s.priceSep}>·</Text>
            <Text style={s.price}>₹{machinery.dailyRate} {t('perDay')}</Text>
          </View>

          {machinery.operatorIncluded && (
            <Text style={s.operator}>✅ {t('operatorIncluded')}</Text>
          )}

          <View style={s.footer}>
            <Text style={[s.avail, { color: availColor }]}>{availLabel}</Text>
            <Pressable accessibilityRole="button" onPress={onPress} style={s.cta}>
              <Text style={s.ctaText}>{t('viewMachine')}</Text>
            </Pressable>
          </View>
        </>
      )}

      {compact && (
        <View style={s.compactMeta}>
          <Text style={s.price}>₹{machinery.hourlyRate}{t('perHour')}</Text>
          <Text style={s.metaText}>📍 {machinery.distance} {t('kmAway')}</Text>
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
  iconWrap: {
    width: 52, height: 52, borderRadius: 14, backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  name: { fontSize: font.body, fontWeight: '700', color: colors.ink },
  type: { fontSize: font.small, color: colors.muted, marginTop: 2 },
  heart: { padding: 4 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm + 2 },
  metaText: { fontSize: font.small, color: colors.muted },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.sm },
  price: { fontSize: font.body, fontWeight: '800', color: colors.primaryDark },
  priceSep: { fontSize: font.body, color: colors.muted },
  operator: { fontSize: font.small, color: colors.primary, fontWeight: '600', marginTop: 4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm + 2 },
  avail: { fontSize: font.small, fontWeight: '600' },
  cta: {
    backgroundColor: colors.primarySoft, borderRadius: radius.md,
    paddingHorizontal: 18, paddingVertical: 10,
  },
  ctaText: { fontSize: font.small, fontWeight: '700', color: colors.primaryDark },
  compactMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs + 2 },
});
