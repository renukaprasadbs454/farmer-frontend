import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, shadow } from '../constants/theme';

type Props = { emoji: string; label: string; onPress: () => void; tone?: 'green' | 'yellow' };

export function ActionCard({ emoji, label, onPress, tone = 'green' }: Props) {
  const isGreen = tone === 'green';
  const bg = isGreen ? '#0D5832' : '#F9A826';
  const fg = isGreen ? '#FFFFFF' : '#2A1C00';
  const iconBg = isGreen ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        s.card,
        { backgroundColor: bg },
        pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
      ]}
    >
      <View style={[s.iconBox, { backgroundColor: iconBg }]}>
        <Text style={{ fontSize: 34 }}>{emoji}</Text>
      </View>
      <Text style={[s.label, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 122,
    borderRadius: 18,
    padding: 16,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...shadow.card,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginTop: 8,
  },
});
