import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../src/components/ScreenContainer';
import { colors, font, radius, shadow, spacing } from '../src/constants/theme';
import { LANGUAGES, useLangStore, useT } from '../src/i18n';
import { Lang } from '../src/types';

export default function LanguageScreen() {
  const t = useT();
  const router = useRouter();
  const { lang: selectedLang, setLang } = useLangStore();

  const handleSelect = (code: Lang) => {
    setLang(code);
  };

  return (
    <ScreenContainer>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Text style={{ fontSize: 18, color: colors.primaryDark }}>←</Text>
        </Pressable>
        <Text style={s.title}>{t('chooseLanguage') || 'App Language'}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={s.subHeader}>Select your preferred language for Farmer Mate:</Text>

        <View style={s.langList}>
          {LANGUAGES.map((l) => {
            const isSelected = selectedLang === l.code;
            return (
              <Pressable
                key={l.code}
                style={[s.langCard, isSelected && s.langCardActive]}
                onPress={() => handleSelect(l.code)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[s.langLabel, isSelected && s.langLabelActive]}>{l.label}</Text>
                  <Text style={s.langCode}>Language Code: {l.code.toUpperCase()}</Text>
                </View>
                {isSelected && <Text style={{ fontSize: 20 }}>✅</Text>}
              </Pressable>
            );
          })}
        </View>

        {/* Translation Explanation Banner */}
        <View style={s.transCard}>
          <Text style={s.transTitle}>🌐 How App Language Works</Text>
          <Text style={s.transBody}>
            • <Text style={s.bold}>Static App UI:</Text> Buttons, menus, and navigation are stored in dictionary files for 100% fast offline access.
          </Text>
          <Text style={s.transBody}>
            • <Text style={s.bold}>Dynamic Crop & Product Details:</Text> Automatically translated on-the-fly using smart language translation providers when connecting online.
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
  subHeader: { fontSize: font.body, color: colors.muted, marginBottom: spacing.md },
  langList: { gap: 12 },
  langCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: spacing.md, borderRadius: radius.md, borderWidth: 2, borderColor: 'transparent', ...shadow.card },
  langCardActive: { borderColor: colors.primary, backgroundColor: '#E8F5E9' },
  langLabel: { fontSize: font.subtitle, fontWeight: '800', color: colors.ink },
  langLabelActive: { color: colors.primaryDark },
  langCode: { fontSize: 11, color: colors.muted, marginTop: 2 },
  transCard: { backgroundColor: colors.surfaceVariant, padding: spacing.md, borderRadius: radius.md, marginTop: spacing.xl },
  transTitle: { fontSize: font.body, fontWeight: '800', color: colors.primaryDark, marginBottom: 6 },
  transBody: { fontSize: font.small, color: colors.ink, marginVertical: 3, lineHeight: 18 },
  bold: { fontWeight: '700' },
});
