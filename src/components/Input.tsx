import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, font, radius, spacing, TOUCH } from '../constants/theme';

type Props = TextInputProps & { label?: string; error?: string | null };

export function Input({ label, error, ...rest }: Props) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <TextInput placeholderTextColor={colors.muted} {...rest} style={[s.input, error ? s.inputError : null]} />
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  label: { fontSize: font.label, fontWeight: '600', color: colors.ink, marginBottom: 6 },
  input: {
    minHeight: TOUCH, borderRadius: radius.md, borderWidth: 2, borderColor: colors.border,
    backgroundColor: colors.card, paddingHorizontal: 16, fontSize: font.body, color: colors.ink,
  },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: font.small, marginTop: 6 },
});
