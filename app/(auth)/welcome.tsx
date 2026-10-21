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
    <ScreenContainer centered>
      <View style={s.hero}>
        <Text style={s.logo}>🌾</Text>
        <Text style={s.name}>{t('appName')}</Text>
        <Text style={s.tag}>{t('tagline')}</Text>
      </View>

      <View style={s.languageBlock}>
        <Text style={s.label}>{t('chooseLanguage')}</Text>
        <View style={s.row}>
          {LANGUAGES.map((l) => (
            <Chip key={l.code} label={l.label} selected={lang === l.code} onPress={() => setLang(l.code)} />
          ))}
        </View>
      </View>

      <View style={s.buttonWrap}>
        <Button title={t('getStarted')} onPress={() => router.push('/login')} />
      </View>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  logo: {
    fontSize: 68,
  },
  name: {
    fontSize: font.hero,
    fontWeight: '800',
    color: colors.primaryDark,
    marginTop: spacing.s,
    textAlign: 'center',
  },
  tag: {
    fontSize: font.body,
    color: colors.muted,
    marginTop: 6,
    textAlign: 'center',
  },
  label: {
    fontSize: font.label,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  languageBlock: {
    alignItems: 'center',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  buttonWrap: {
    marginTop: spacing.xl,
    width: '100%',
  },
});
