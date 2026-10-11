import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../src/components/ScreenContainer';
import { colors, font, radius, shadow, spacing } from '../src/constants/theme';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Text style={{ fontSize: 18, color: colors.primaryDark }}>←</Text>
        </Pressable>
        <Text style={s.title}>Privacy Policy</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={s.card}>
          <Text style={s.lastUpdated}>Last Updated: October 3, 2026</Text>

          <Text style={s.heading}>1. Introduction</Text>
          <Text style={s.paragraph}>
            Welcome to Farmer Mate ("we", "our", or "us"). We are committed to protecting your privacy and ensuring your agricultural data, personal information, and location details are handled securely and transparently.
          </Text>

          <Text style={s.heading}>2. Information We Collect</Text>
          <Text style={s.paragraph}>
            - <Text style={s.bold}>Location Data:</Text> With your explicit permission, we collect precise live GPS coordinates to deliver local weather reports, rain prediction, nearby farm worker availability, and machinery rentals.
          </Text>
          <Text style={s.paragraph}>
            - <Text style={s.bold}>Profile Information:</Text> Name, phone number, village, taluk, district, state, land acreage, and crop preferences.
          </Text>
          <Text style={s.paragraph}>
            - <Text style={s.bold}>Marketplace & Transaction Data:</Text> Booking records for farm machinery, labour requests, crop sales listings, and payment transaction statuses.
          </Text>

          <Text style={s.heading}>3. How We Use Your Information</Text>
          <Text style={s.paragraph}>
            - To fetch live localized weather and rain prediction warnings.
          </Text>
          <Text style={s.paragraph}>
            - To connect farmers with verified local machinery owners and agricultural laborers.
          </Text>
          <Text style={s.paragraph}>
            - To facilitate direct crop sales between farmers and wholesale buyers.
          </Text>
          <Text style={s.paragraph}>
            - To improve app performance, prevent fraud, and provide customer support.
          </Text>

          <Text style={s.heading}>4. Data Sharing & Security</Text>
          <Text style={s.paragraph}>
            We do not sell your personal data to third parties. Your location and contact details are only shared with service providers (e.g. tractor owners or labour captains) when you explicitly place a service booking or crop order.
          </Text>

          <Text style={s.heading}>5. Your Rights & Data Control</Text>
          <Text style={s.paragraph}>
            You can modify or revoke location permissions at any time from your device settings. You may also request deletion of your account and farm profile by contacting support@farmermate.com.
          </Text>

          <Text style={s.heading}>6. Contact Us</Text>
          <Text style={s.paragraph}>
            If you have questions regarding this Privacy Policy, please email us at privacy@farmermate.com or call our toll-free farmer helpline at 1800-123-FARM.
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
  bold: { fontWeight: '700', color: colors.ink },
});
