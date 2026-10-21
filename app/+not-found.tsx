import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../src/components/ScreenContainer';
import { colors, font, radius, spacing } from '../src/constants/theme';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <View style={s.wrap}>
        <Text style={s.code}>404</Text>
        <Text style={s.title}>Page not found</Text>
        <Text style={s.subtitle}>This Farmer Mate screen is not available or the link has expired.</Text>
        <Pressable style={s.button} onPress={() => router.replace('/(tabs)/home' as any)} accessibilityRole="button">
          <Text style={s.buttonText}>Return to Home</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  code: { color: colors.primary, fontSize: 56, fontWeight: '900' },
  title: { color: colors.ink, fontSize: font.title, fontWeight: '900', marginTop: spacing.s },
  subtitle: { color: colors.muted, fontSize: font.body, lineHeight: 22, marginTop: spacing.s, textAlign: 'center' },
  button: { backgroundColor: colors.primary, borderRadius: radius.md, marginTop: spacing.xl, minHeight: 48, paddingHorizontal: spacing.xl, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: colors.surface, fontSize: font.button, fontWeight: '900' },
});
