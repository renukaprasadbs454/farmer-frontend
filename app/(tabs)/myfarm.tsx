import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { Chip } from '../../src/components/Chip';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { CROPS } from '../../src/constants/crops';
import { colors, font, radius, shadow, spacing } from '../../src/constants/theme';
import { LANGUAGES, useLangStore, useT } from '../../src/i18n';
import { useAuthStore } from '../../src/store/authStore';
import { useCropMarketplaceStore } from '../../src/store/cropMarketplaceStore';
import { useFarmerStore } from '../../src/store/farmerStore';
import { useWishlistStore } from '../../src/store/wishlistStore';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.stat}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

export default function MyFarm() {
  const t = useT();
  const router = useRouter();
  const { farmer, farm, crops } = useFarmerStore();
  const { myListings, savedCropIds } = useCropMarketplaceStore();
  const { wishlistIds } = useWishlistStore();
  const { lang, setLang } = useLangStore();
  const logout = useAuthStore((st) => st.logout);
  const unit = farm.landUnit;

  const handleLogout = () => {
    logout();
    router.replace('/welcome');
  };

  return (
    <ScreenContainer tab>
      <View style={s.profile}>
        <View style={s.avatar}>
          <Text style={{ fontSize: 34, color: '#fff', fontWeight: '800' }}>
            {farmer.name ? farmer.name.charAt(0).toUpperCase() : 'F'}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.name}>{farmer.name || 'Farmer'}</Text>
          <Text style={s.sub}>{[farm.village, farm.district].filter(Boolean).join(', ')}</Text>
          <Text style={s.sub}>+91 {farmer.mobile}</Text>
        </View>
      </View>

      <View style={s.grid}>
        <Stat label={`${t('land')} (${unit})`} value={String(farm.totalLand || 0)} />
        <Stat label={`${t('cultivated')} (${unit})`} value={String(farm.cultivatedLand || 0)} />
        <Stat label={t('crops')} value={String(crops.length)} />
        <Stat label={t('myListings')} value={String(myListings.length)} />
      </View>

      {/* Saved / Marketplace Management Quick Links */}
      <Text style={s.section}>🌾 Marketplace Links</Text>
      <View style={s.menuCol}>
        <Pressable style={s.menuRow} onPress={() => router.push('/market/sell' as any)}>
          <Text style={s.menuIcon}>🚜</Text>
          <Text style={s.menuTitle}>{t('myListings')} ({myListings.length})</Text>
          <Text style={s.chevron}>›</Text>
        </Pressable>

        <Pressable style={s.menuRow} onPress={() => router.push('/market/sell/requests' as any)}>
          <Text style={s.menuIcon}>🔔</Text>
          <Text style={s.menuTitle}>{t('buyerRequests')}</Text>
          <Text style={s.chevron}>›</Text>
        </Pressable>

        <Pressable style={s.menuRow} onPress={() => router.push('/market/wishlist' as any)}>
          <Text style={s.menuIcon}>❤️</Text>
          <Text style={s.menuTitle}>Saved Products ({wishlistIds.length})</Text>
          <Text style={s.chevron}>›</Text>
        </Pressable>

        <Pressable style={s.menuRow} onPress={() => router.push('/market/saved-crops' as any)}>
          <Text style={s.menuIcon}>⭐</Text>
          <Text style={s.menuTitle}>{t('savedCrops')} ({savedCropIds.length})</Text>
          <Text style={s.chevron}>›</Text>
        </Pressable>
      </View>

      <Text style={s.section}>{t('crops')}</Text>
      <View style={s.row}>
        {crops.map((id) => {
          const c = CROPS.find((x) => x.id === id);
          return <Chip key={id} emoji={c?.emoji} label={c?.label ?? id} selected onPress={() => {}} />;
        })}
      </View>

      <Text style={s.section}>{t('language')}</Text>
      <View style={s.row}>
        {LANGUAGES.map((l) => (
          <Chip key={l.code} label={l.label} selected={lang === l.code} onPress={() => setLang(l.code)} />
        ))}
      </View>

      <View style={{ marginTop: spacing.xl, marginBottom: spacing.l }}>
        <Button title={t('logout')} variant="outline" onPress={handleLogout} />
      </View>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  profile: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, ...shadow.card },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: font.title, fontWeight: '800', color: colors.ink },
  sub: { fontSize: font.small + 1, color: colors.muted, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: spacing.lg },
  stat: { flexBasis: '48%', flexGrow: 1, backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: spacing.md },
  statValue: { fontSize: 34, fontWeight: '800', color: colors.primaryDark },
  statLabel: { fontSize: font.small, color: colors.ink, marginTop: 2 },
  section: { fontSize: font.body, fontWeight: '800', color: colors.ink, marginTop: spacing.lg, marginBottom: spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  menuCol: { gap: spacing.xs },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.m,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuIcon: { fontSize: 20, marginRight: spacing.m },
  menuTitle: { flex: 1, fontFamily: font.medium, fontSize: 14, color: colors.textPrimary },
  chevron: { fontSize: 20, color: colors.textMuted },
});
