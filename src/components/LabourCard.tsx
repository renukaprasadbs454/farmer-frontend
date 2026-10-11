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

export function LabourCard({ labourer, onPress, onSave, isSaved, compact }: Props) {
  const t = useT();
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
          <Text style={s.avatarText}>{labourer.name.charAt(0)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.name} numberOfLines={1}>{labourer.name}</Text>
          <Text style={s.skill}>{labourCategoryLabel(labourer.primarySkill)}</Text>
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
              <Text style={s.price}>₹{labourer.dailyRate} {t('perDay')}</Text>
              <Text style={[s.avail, { color: availColor }]}>{availLabel}</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={onPress} style={s.cta}>
              <Text style={s.ctaText}>{t('viewWorker')}</Text>
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
  skill: { fontSize: font.small, color: colors.muted, marginTop: 2 },
  heart: { padding: 4 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm + 2 },
  metaText: { fontSize: font.small, color: colors.muted },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: spacing.sm + 2 },
  price: { fontSize: font.body, fontWeight: '800', color: colors.primaryDark },
  avail: { fontSize: font.small, fontWeight: '600', marginTop: 2 },
  cta: {
    backgroundColor: colors.primarySoft, borderRadius: radius.md,
    paddingHorizontal: 18, paddingVertical: 10,
  },
  ctaText: { fontSize: font.small, fontWeight: '700', color: colors.primaryDark },
  compactMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs + 2 },
});
