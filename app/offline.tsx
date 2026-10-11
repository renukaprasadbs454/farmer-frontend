import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../src/components/ScreenContainer';
import { colors, font, radius, shadow, spacing } from '../src/constants/theme';

export default function OfflineScreen() {
  const router = useRouter();

  const handleRetry = () => {
    // Retry navigation to main screen
    router.replace('/(tabs)/home');
  };

  return (
    <ScreenContainer>
      <View style={s.container}>
        <Text style={{ fontSize: 72 }}>📶❌</Text>
        <Text style={s.title}>No Internet Connection</Text>
        <Text style={s.subtitle}>
          It looks like you are offline or have weak mobile signal in your farm area. Please check your cellular data or Wi-Fi connection.
        </Text>

        <View style={s.tipBox}>
          <Text style={s.tipHeader}>💡 Offline Tips for Farmers:</Text>
          <Text style={s.tipItem}>• Saved bookings and crop listings remain cached locally.</Text>
          <Text style={s.tipItem}>• Emergency helpline is available via standard cellular call.</Text>
        </View>

        <Pressable style={s.retryBtn} onPress={handleRetry}>
          <Text style={s.retryText}>🔄 Try Reconnecting</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, marginTop: 40 },
  title: { fontSize: font.title, fontWeight: '800', color: colors.ink, marginTop: spacing.md, textAlign: 'center' },
  subtitle: { fontSize: font.body, color: colors.muted, textAlign: 'center', marginTop: spacing.xs, lineHeight: 22 },
  tipBox: { backgroundColor: colors.surfaceVariant, padding: spacing.md, borderRadius: radius.md, width: '100%', marginTop: spacing.lg },
  tipHeader: { fontSize: font.body, fontWeight: '800', color: colors.primaryDark, marginBottom: 6 },
  tipItem: { fontSize: font.small, color: colors.ink, marginVertical: 2, lineHeight: 18 },
  retryBtn: { backgroundColor: colors.primary, width: '100%', paddingVertical: 14, borderRadius: radius.md, alignItems: 'center', marginTop: spacing.xl, ...shadow.card },
  retryText: { color: '#FFF', fontWeight: '800', fontSize: font.body },
});
