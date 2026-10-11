import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, font, radius } from '../constants/theme';

type Props = { label: string; selected?: boolean; onPress: () => void; emoji?: string };

export function Chip({ label, selected, onPress, emoji }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={[s.chip, selected && s.selected]}
    >
      <Text style={[s.text, selected && { color: '#fff' }]}>{emoji ? `${emoji}  ${label}` : label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  chip: {
    minHeight: 52, paddingHorizontal: 18, borderRadius: radius.pill, borderWidth: 2,
    borderColor: colors.border, backgroundColor: colors.card, justifyContent: 'center',
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { fontSize: font.body, fontWeight: '600', color: colors.ink },
});
