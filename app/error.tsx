import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../src/components/ScreenContainer';
import { colors, font, radius, shadow, spacing } from '../src/constants/theme';

export default function ErrorScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <View style={s.container}>
        <Text style={{ fontSize: 64 }}>⚠️</Text>
        <Text style={s.title}>Something Went Wrong</Text>
        <Text style={s.subtitle}>
          The application encountered an unexpected error. Don't worry, your farm data and active bookings are completely safe.
        </Text>

        <Pressable style={s.primaryBtn} onPress={() => router.replace('/(tabs)/home')}>
          <Text style={s.primaryBtnText}>🏠 Return to Home Screen</Text>
        </Pressable>

        <Pressable style={s.secondaryBtn} onPress={() => router.push('/support' as any)}>
          <Text style={s.secondaryBtnText}>💬 Report to Customer Support</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, marginTop: 40 },
  title: { fontSize: font.title, fontWeight: '800', color: colors.ink, marginTop: spacing.md },
  subtitle: { fontSize: font.body, color: colors.muted, textAlign: 'center', marginTop: spacing.xs, lineHeight: 22 },
  primaryBtn: { backgroundColor: colors.primary, width: '100%', paddingVertical: 14, borderRadius: radius.md, alignItems: 'center', marginTop: spacing.xl, ...shadow.card },
  primaryBtnText: { color: '#FFF', fontWeight: '800', fontSize: font.body },
  secondaryBtn: { backgroundColor: colors.surfaceVariant, width: '100%', paddingVertical: 14, borderRadius: radius.md, alignItems: 'center', marginTop: spacing.sm },
  secondaryBtnText: { color: colors.primaryDark, fontWeight: '700', fontSize: font.body },
});
