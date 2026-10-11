import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { Chip } from '../../src/components/Chip';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { colors, font, spacing } from '../../src/constants/theme';
import { LANGUAGES, useLangStore, useT } from '../../src/i18n';

export default function Welcome() {
  const t = useT();
  const router = useRouter();
  const { lang, setLang } = useLangStore();
  return (
    <ScreenContainer>
      <View style={s.hero}>
        <Text style={{ fontSize: 88 }}>🌾</Text>
        <Text style={s.name}>{t('appName')}</Text>
        <Text style={s.tag}>{t('tagline')}</Text>
      </View>
      <Text style={s.label}>{t('chooseLanguage')}</Text>
      <View style={s.row}>
        {LANGUAGES.map((l) => (
          <Chip key={l.code} label={l.label} selected={lang === l.code} onPress={() => setLang(l.code)} />
        ))}
      </View>
      <View style={{ marginTop: spacing.xl }}>
        <Button title={t('getStarted')} onPress={() => router.push('/login')} />
      </View>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  hero: { alignItems: 'center', paddingVertical: spacing.xl },
  name: { fontSize: font.hero, fontWeight: '800', color: colors.primaryDark, marginTop: 8 },
  tag: { fontSize: font.body + 2, color: colors.muted, marginTop: 6, textAlign: 'center' },
  label: { fontSize: font.label, fontWeight: '700', color: colors.ink, marginBottom: spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
