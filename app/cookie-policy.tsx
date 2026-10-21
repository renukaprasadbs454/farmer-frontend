import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../src/components/ScreenContainer';
import { colors, font, radius, shadow, spacing } from '../src/constants/theme';

export default function CookiePolicyScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn} accessibilityRole="button" accessibilityLabel="Go back">
          <Text style={s.backText}>{'<'}</Text>
        </Pressable>
        <Text style={s.title}>Cookie & Data Use</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={s.card}>
          <Text style={s.lastUpdated}>Last Updated: October 11, 2026</Text>

          <Text style={s.heading}>Session storage</Text>
          <Text style={s.paragraph}>
            Farmer Mate stores your login session, selected language, profile status, cart and notification preferences on this device so the app can open quickly and keep your farm workflow intact.
          </Text>

          <Text style={s.heading}>Location and address data</Text>
          <Text style={s.paragraph}>
            When you allow location access, the app uses GPS to fetch weather, identify your state, district, taluk, village and pincode, and route service requests to the correct operating zone.
          </Text>

          <Text style={s.heading}>Marketplace data</Text>
          <Text style={s.paragraph}>
            Product orders, crop listings, saved items, service bookings and support messages are sent to the backend only to operate Farmer Mate services, admin approvals and transaction tracking.
          </Text>

          <Text style={s.heading}>Your control</Text>
          <Text style={s.paragraph}>
            You can clear app storage by logging out and can revoke location permissions from your device settings. Some features may ask for location again when needed.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  backBtn: { width: 36, height: 36, borderRadius: radius.full, backgroundColor: colors.surfaceVariant, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 18, color: colors.primaryDark, fontWeight: '800' },
  title: { fontSize: font.title, fontWeight: '800', color: colors.ink, textAlign: 'center' },
  card: { backgroundColor: colors.card, padding: spacing.lg, borderRadius: radius.lg, ...shadow.card },
  lastUpdated: { fontSize: 12, color: colors.muted, fontWeight: '600', marginBottom: 16 },
  heading: { fontSize: font.subtitle, fontWeight: '800', color: colors.primaryDark, marginTop: 16, marginBottom: 6 },
  paragraph: { fontSize: font.body, color: colors.ink, lineHeight: 22, marginBottom: 8 },
});
