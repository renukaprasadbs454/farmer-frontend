import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, shadow, spacing } from '../constants/theme';
import { useT } from '../i18n';
import { ServiceBooking } from '../types';
import { BookingStatusBadge } from './BookingStatusBadge';

type Props = {
  booking: ServiceBooking;
  onPress: () => void;
};

export function OrderCard({ booking, onPress }: Props) {
  const t = useT();
  const isLabour = booking.type === 'labour';
  const title = isLabour ? booking.labourerName : booking.machineryName;
  const subtitle = isLabour
    ? `${booking.workType ?? ''} · ${booking.numberOfWorkers ?? 1} ${t('workers')} · ${booking.duration}h`
    : `${booking.serviceDescription ?? ''} · ${booking.areaOfWork ?? '-'} ${t('acres')}`;
  const emoji = isLabour ? '👨‍🌾' : '🚜';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [s.card, pressed && { opacity: 0.92 }]}
    >
      <View style={s.row}>
        <Text style={{ fontSize: 28 }}>{emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.title} numberOfLines={1}>{title}</Text>
          <Text style={s.subtitle} numberOfLines={1}>{subtitle}</Text>
        </View>
        <Text style={s.price}>₹{booking.estimatedTotal.toLocaleString('en-IN')}</Text>
      </View>
      <View style={s.bottom}>
        <Text style={s.date}>{booking.date}</Text>
        <BookingStatusBadge status={booking.status} />
      </View>
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
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: font.body, fontWeight: '700', color: colors.ink },
  subtitle: { fontSize: font.small, color: colors.muted, marginTop: 2 },
  price: { fontSize: font.body, fontWeight: '800', color: colors.primaryDark },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm + 2 },
  date: { fontSize: font.small, color: colors.muted },
});
