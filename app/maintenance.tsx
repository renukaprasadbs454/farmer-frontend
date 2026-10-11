import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../src/components/ScreenContainer';
import { colors, font, radius, shadow, spacing } from '../src/constants/theme';

export default function MaintenanceScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <View style={s.container}>
        <Text style={{ fontSize: 72 }}>🛠️🚜</Text>
        <Text style={s.title}>System Maintenance</Text>
        <Text style={s.subtitle}>
          Farmer Mate platform is currently undergoing scheduled system upgrades to serve you better. We will be back online shortly.
        </Text>

        <View style={s.infoBox}>
          <Text style={s.infoTitle}>⏳ Estimated Completion:</Text>
          <Text style={s.infoText}>30 Minutes · Maintenance Window: 01:00 AM - 02:00 AM IST</Text>
        </View>

        <Pressable style={s.retryBtn} onPress={() => router.replace('/(tabs)/home')}>
          <Text style={s.retryText}>🔄 Refresh Status</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  title: { fontSize: font.title, fontWeight: '800', color: colors.ink, marginTop: spacing.md },
  subtitle: { fontSize: font.body, color: colors.muted, textAlign: 'center', marginTop: spacing.xs, lineHeight: 22 },
  infoBox: { backgroundColor: '#FFF8E1', padding: spacing.md, borderRadius: radius.md, width: '100%', marginTop: spacing.lg, borderWidth: 1, borderColor: '#FFE082' },
  infoTitle: { fontSize: font.body, fontWeight: '800', color: '#F57F17' },
  infoText: { fontSize: font.small, color: '#E65100', marginTop: 4 },
  retryBtn: { backgroundColor: colors.primary, width: '100%', paddingVertical: 14, borderRadius: radius.md, alignItems: 'center', marginTop: spacing.xl, ...shadow.card },
  retryText: { color: '#FFF', fontWeight: '800', fontSize: font.body },
});
