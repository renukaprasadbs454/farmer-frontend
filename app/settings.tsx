import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chip } from '../src/components/Chip';
import { colors, font, radius, shadow, spacing } from '../src/constants/theme';
import { LANGUAGES, useLangStore, useT } from '../src/i18n';
import { useNotificationStore } from '../src/store/notificationStore';
import { NotificationSettings } from '../src/types';

export default function SettingsScreen() {
  const t = useT();
  const router = useRouter();
  const { lang, setLang } = useLangStore();
  const { settings, toggleSetting } = useNotificationStore();

  const toggleLabels: { key: keyof NotificationSettings; title: string; sub: string }[] = [
    { key: 'bookingUpdates', title: 'Booking Updates', sub: 'Labour and machinery status notifications' },
    { key: 'orderUpdates', title: 'Product Order Updates', sub: 'Shipping, dispatch, and delivery updates' },
    { key: 'buyerRequests', title: 'Buyer Requests', sub: 'Instant alerts when buyers offer to purchase your crop' },
    { key: 'cropSales', title: 'Crop Sales', sub: 'Order confirmations and completion alerts' },
    { key: 'marketplaceUpdates', title: 'Marketplace News', sub: 'Price trends and seasonal demand updates' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← {t('back')}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>⚙️ {t('settings')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Language Section */}
        <Text style={styles.sectionTitle}>🌐 App Language & Translation</Text>
        <View style={styles.card}>
          <View style={styles.chipRow}>
            {LANGUAGES.map((l) => (
              <Chip
                key={l.code}
                label={l.label}
                selected={lang === l.code}
                onPress={() => setLang(l.code)}
              />
            ))}
          </View>
          <Pressable style={styles.menuItem} onPress={() => router.push('/language' as any)}>
            <Text style={styles.menuText}>🌐 Language Settings & Auto-Translate Details</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </View>

        {/* Notifications Settings */}
        <Text style={styles.sectionTitle}>🔔 Notification Preferences</Text>
        <View style={styles.card}>
          {toggleLabels.map((item) => {
            const isEnabled = settings[item.key];
            return (
              <Pressable
                key={item.key}
                style={styles.toggleRow}
                onPress={() => toggleSetting(item.key)}
              >
                <View style={{ flex: 1, marginRight: spacing.s }}>
                  <Text style={styles.toggleTitle}>{item.title}</Text>
                  <Text style={styles.toggleSub}>{item.sub}</Text>
                </View>
                <Text style={styles.toggleStatus}>{isEnabled ? '🟢 ON' : '⚪ OFF'}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Legal & App Information */}
        <Text style={styles.sectionTitle}>📄 Legal & Policy Documents</Text>
        <View style={styles.card}>
          <Pressable style={styles.menuItem} onPress={() => router.push('/privacy-policy' as any)}>
            <Text style={styles.menuText}>🔒 Privacy Policy</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
          <View style={styles.divider} />

          <Pressable style={styles.menuItem} onPress={() => router.push('/terms' as any)}>
            <Text style={styles.menuText}>📜 Terms & Conditions</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
          <View style={styles.divider} />

          <Pressable style={styles.menuItem} onPress={() => router.push('/cookie-policy' as any)}>
            <Text style={styles.menuText}>Cookie & Data Use</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
          <View style={styles.divider} />

          <Pressable style={styles.menuItem} onPress={() => router.push('/about' as any)}>
            <Text style={styles.menuText}>ℹ️ About Farmer Mate</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </View>

        {/* App Utility & Diagnostics */}
        <Text style={styles.sectionTitle}>🛠️ System & Diagnostic Views</Text>
        <View style={styles.card}>
          <Pressable style={styles.menuItem} onPress={() => router.push('/weather' as any)}>
            <Text style={styles.menuText}>🌦️ Weather & Rain Forecast Center</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
          <View style={styles.divider} />

          <Pressable style={styles.menuItem} onPress={() => router.push('/support' as any)}>
            <Text style={styles.menuText}>🎧 Help & Support / FAQs</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
          <View style={styles.divider} />

          <Pressable style={styles.menuItem} onPress={() => router.push('/payment-status' as any)}>
            <Text style={styles.menuText}>💵 Cash & Payment Status View</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
          <View style={styles.divider} />

          <Pressable style={styles.menuItem} onPress={() => router.push('/offline' as any)}>
            <Text style={styles.menuText}>📶 Network Offline State Screen</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
          <View style={styles.divider} />

          <Pressable style={styles.menuItem} onPress={() => router.push('/error' as any)}>
            <Text style={styles.menuText}>⚠️ Crash & Error Recovery Screen</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
          <View style={styles.divider} />

          <Pressable style={styles.menuItem} onPress={() => router.push('/maintenance' as any)}>
            <Text style={styles.menuText}>🚧 System Maintenance Screen</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </View>

        <Text style={styles.versionText}>Farmer Mate Version 2.5.0 (Build 2026)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.m,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: spacing.xs },
  backText: { fontFamily: font.medium, color: colors.primary, fontSize: 14 },
  headerTitle: { fontFamily: font.bold, fontSize: 16, color: colors.textPrimary },
  content: { padding: spacing.m },
  sectionTitle: { fontFamily: font.bold, fontSize: 16, color: colors.textPrimary, marginTop: spacing.m, marginBottom: spacing.s },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    padding: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s, marginBottom: 8 },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  toggleTitle: { fontFamily: font.bold, fontSize: 14, color: colors.textPrimary },
  toggleSub: { fontFamily: font.regular, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  toggleStatus: { fontFamily: font.bold, fontSize: 13, color: colors.primary },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.s },
  menuText: { fontFamily: font.medium, fontSize: 14, color: colors.textPrimary },
  chevron: { fontSize: 18, color: colors.textMuted },
  divider: { height: 1, backgroundColor: colors.border },
  versionText: { fontFamily: font.regular, fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
});
