import { StyleSheet, Text, View } from 'react-native';
import { colors, font, radius } from '../constants/theme';
import { useT } from '../i18n';
import { BookingStatus } from '../types';

const STATUS_STYLES: Record<BookingStatus, { bg: string; fg: string }> = {
  requested: { bg: '#FFF3CD', fg: '#856404' },
  accepted: { bg: '#D4EDDA', fg: '#155724' },
  rejected: { bg: '#F8D7DA', fg: '#721C24' },
  cancelled: { bg: '#E2E3E5', fg: '#383D41' },
  completed: { bg: colors.primarySoft, fg: colors.primaryDark },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const t = useT();
  const { bg, fg } = STATUS_STYLES[status];
  const label = t(status);
  return (
    <View style={[s.badge, { backgroundColor: bg }]}>
      <Text style={[s.text, { color: fg }]}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  badge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.pill, alignSelf: 'flex-start' },
  text: { fontSize: font.small, fontWeight: '700' },
});
