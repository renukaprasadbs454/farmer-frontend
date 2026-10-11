import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../src/components/ScreenContainer';
import { colors, font, radius, shadow, spacing } from '../src/constants/theme';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Text style={{ fontSize: 18, color: colors.primaryDark }}>←</Text>
        </Pressable>
        <Text style={s.title}>About Farmer Mate</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={s.logoBox}>
          <Text style={{ fontSize: 60 }}>🚜🌾</Text>
          <Text style={s.appName}>Farmer Mate</Text>
          <Text style={s.appVersion}>Version 2.4.0 (Build 2026.10)</Text>
          <Text style={s.tagline}>"Empowering Indian Agriculture & Farmers"</Text>
        </View>

        <View style={s.card}>
          <Text style={s.sectionHeader}>🌱 Our Mission</Text>
          <Text style={s.paragraph}>
            Farmer Mate is designed to digitize every step of farming. We enable small and large scale farmers to easily book tractor/JCB machinery, find skilled farm laborers, access live weather & rain forecasts, and sell crops directly to wholesale buyers at top market rates.
          </Text>

          <Text style={s.sectionHeader}>⭐ Key Features</Text>
          <Text style={s.bullet}>• Live Geolocation & Hyperlocal Weather Forecasts</Text>
          <Text style={s.bullet}>• 1-Click Tractor, Rotavator & JCB Machine Rental</Text>
          <Text style={s.bullet}>• Verified Local Farm Worker Groups & Labor Booking</Text>
          <Text style={s.bullet}>• Direct Buyer Crop Marketplace with Negotiable Rates</Text>
          <Text style={s.bullet}>• Multilingual Support (English, Hindi, Kannada & regional languages)</Text>

          <Text style={s.sectionHeader}>🏢 Corporate & Office Information</Text>
          <Text style={s.paragraph}>
            Farmer Mate Agritech Solutions Pvt Ltd{"\n"}
            Mandya Agricultural Innovation Center, Karnataka - 571401{"\n"}
            Website: www.farmermate.com{"\n"}
            Support Hotline: 1800-123-FARM (Toll Free)
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
  logoBox: { alignItems: 'center', marginVertical: spacing.lg },
  appName: { fontSize: 24, fontWeight: '900', color: colors.primaryDark, marginTop: 8 },
  appVersion: { fontSize: 12, color: colors.muted, fontWeight: '600', marginTop: 2 },
  tagline: { fontSize: font.body, fontStyle: 'italic', color: colors.primary, marginTop: 4 },
  card: { backgroundColor: colors.card, padding: spacing.lg, borderRadius: radius.lg, ...shadow.card },
  sectionHeader: { fontSize: font.subtitle, fontWeight: '800', color: colors.primaryDark, marginTop: 14, marginBottom: 6 },
  paragraph: { fontSize: font.body, color: colors.ink, lineHeight: 22 },
  bullet: { fontSize: font.body, color: colors.ink, marginVertical: 3, lineHeight: 20 },
});
