import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../constants/theme';

type Props = {
  emoji: string;
  label: string;
  subtitle?: string;
  tag?: string;
  onPress: () => void;
  tone?: 'green' | 'yellow';
  fullWidth?: boolean;
};

export function ActionCard({ emoji, label, subtitle, tag, onPress, tone = 'green', fullWidth }: Props) {
  const isYellow = tone === 'yellow';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        s.card,
        fullWidth && s.fullWidth,
        isYellow && s.yellowTone,
        pressed && { opacity: 0.92, transform: [{ scale: 0.98 }] },
      ]}
    >
      <View style={s.topRow}>
        <View style={[s.iconBox, isYellow && s.yellowIconBox]}>
          <Text style={{ fontSize: 26 }}>{emoji}</Text>
        </View>
        {tag && (
          <View style={[s.tagBadge, isYellow && s.yellowTagBadge]}>
            <Text style={[s.tagText, isYellow && s.yellowTagText]} numberOfLines={1}>
              {tag}
            </Text>
          </View>
        )}
      </View>

      <View style={s.bottomRow}>
        <View style={s.textCol}>
          <Text style={s.label} numberOfLines={1}>
            {label}
          </Text>
          {subtitle && (
            <Text style={s.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          )}
        </View>
        <View style={s.arrowCircle}>
          <Text style={s.arrowText}>›</Text>
        </View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 124,
    borderRadius: radius.md,
    padding: 14,
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    shadowColor: '#0B2A14',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  fullWidth: {
    flexBasis: '100%',
    minHeight: 108,
  },
  yellowTone: {
    borderColor: '#E8E0C2',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    backgroundColor: colors.primarySoft,
    borderColor: colors.border,
  },
  yellowIconBox: {
    backgroundColor: '#F7F2DF',
    borderColor: '#E8E0C2',
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    maxWidth: 94,
  },
  yellowTagBadge: {
    backgroundColor: '#F7F2DF',
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  yellowTagText: {
    color: '#806000',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  textCol: {
    flex: 1,
    paddingRight: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
  },
  subtitle: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '600',
    marginTop: 3,
    lineHeight: 16,
  },
  arrowCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    backgroundColor: colors.primarySoft,
    borderColor: colors.border,
  },
  arrowText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    marginTop: -2,
    marginLeft: 1,
  },
});
