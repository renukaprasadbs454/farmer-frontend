import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../src/components/ScreenContainer';
import { colors, font, radius, shadow, spacing } from '../src/constants/theme';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Text style={{ fontSize: 18, color: colors.primaryDark }}>←</Text>
        </Pressable>
        <Text style={s.title}>Terms & Conditions</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={s.card}>
          <Text style={s.lastUpdated}>Effective Date: October 3, 2026</Text>

          <Text style={s.heading}>1. Acceptance of Terms</Text>
          <Text style={s.paragraph}>
            By downloading, accessing, or using Farmer Mate, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.
          </Text>

          <Text style={s.heading}>2. Service Usage & Fair Conduct</Text>
          <Text style={s.paragraph}>
            Farmer Mate provides an open marketplace for farm machinery hire, agricultural labor hiring, and crop sales. Users agree to provide truthful details regarding farm size, crop quality, and booking schedules.
          </Text>

          <Text style={s.heading}>3. Payments & Cash on Delivery (COD)</Text>
          <Text style={s.paragraph}>
            - Cash payments agreed between farmers, machinery operators, or labour groups must be settled directly at the time of work completion.
          </Text>
          <Text style={s.paragraph}>
            - Digital payments processed through Farmer Mate are held securely in escrow until service or delivery confirmation.
          </Text>

          <Text style={s.heading}>4. Cancellations & Disputes</Text>
          <Text style={s.paragraph}>
            Bookings may be cancelled free of charge up to 2 hours prior to start time. Repeated unexcused cancellations or fraudulent crop listings may lead to temporary or permanent account suspension.
          </Text>

          <Text style={s.heading}>5. Weather & Advisory Disclaimer</Text>
          <Text style={s.paragraph}>
            Weather predictions and rain advisories are sourced from meteorological satellite data (Open-Meteo). While highly accurate, weather conditions can fluctuate rapidly. Farmer Mate is not liable for weather-related crop damages.
          </Text>

          <Text style={s.heading}>6. Governing Law</Text>
          <Text style={s.paragraph}>
            These terms are governed by the laws of India. Any legal disputes shall be subject to the exclusive jurisdiction of the courts in Bengaluru/Mandya, Karnataka.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  backBtn: { width: 36, height: 36, borderRadius: radius.full, backgroundColor: colors.surfaceVariant, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: font.title, fontWeight: '800', color: colors.ink },
  card: { backgroundColor: colors.card, padding: spacing.lg, borderRadius: radius.lg, ...shadow.card },
  lastUpdated: { fontSize: 12, color: colors.muted, fontWeight: '600', marginBottom: 16 },
  heading: { fontSize: font.subtitle, fontWeight: '800', color: colors.primaryDark, marginTop: 16, marginBottom: 6 },
  paragraph: { fontSize: font.body, color: colors.ink, lineHeight: 22, marginBottom: 8 },
});
