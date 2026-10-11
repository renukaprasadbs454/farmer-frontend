import { StyleSheet, Text, View } from 'react-native';
import { colors, font, spacing } from '../constants/theme';
import { Button } from './Button';

type Props = { emoji: string; title: string; message?: string; actionLabel?: string; onAction?: () => void };

export function EmptyState({ emoji, title, message, actionLabel, onAction }: Props) {
  return (
    <View style={s.wrap}>
      <Text style={s.emoji}>{emoji}</Text>
      <Text style={s.title}>{title}</Text>
      {message ? <Text style={s.msg}>{message}</Text> : null}
      {actionLabel && onAction ? <Button title={actionLabel} onPress={onAction} style={{ marginTop: spacing.md }} /> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: spacing.xl, paddingHorizontal: spacing.md },
  emoji: { fontSize: 64 },
  title: { fontSize: font.title, fontWeight: '800', color: colors.ink, marginTop: spacing.md, textAlign: 'center' },
  msg: { fontSize: font.body, color: colors.muted, marginTop: 8, textAlign: 'center', lineHeight: 26 },
});
