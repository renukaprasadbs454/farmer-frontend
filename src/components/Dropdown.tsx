import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, font, radius, spacing, TOUCH } from '../constants/theme';

interface Props {
  label?: string;
  placeholder?: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  disabled?: boolean;
  searchable?: boolean;
}

export function Dropdown({ label, placeholder = 'Select...', value, options, onChange, disabled, searchable = true }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  const handleSelect = (opt: string) => {
    onChange(opt);
    setOpen(false);
    setSearch('');
  };

  return (
    <View style={s.wrapper}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <Pressable
        style={[s.trigger, disabled && s.triggerDisabled]}
        onPress={() => { if (!disabled) setOpen(true); }}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text style={[s.triggerText, !value && s.placeholder]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Text style={s.arrow}>{open ? '▲' : '▼'}</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={s.backdrop} onPress={() => { setOpen(false); setSearch(''); }} />
        <View style={s.sheet}>
          {/* Handle bar */}
          <View style={s.handle} />
          {label ? <Text style={s.sheetTitle}>{label}</Text> : null}

          {searchable && options.length > 6 && (
            <View style={s.searchBox}>
              <Text style={s.searchIcon}>🔍</Text>
              <TextInput
                style={s.searchInput}
                placeholder="Search..."
                placeholderTextColor={colors.muted}
                value={search}
                onChangeText={setSearch}
                autoCapitalize="none"
              />
            </View>
          )}

          <FlatList
            data={filtered}
            keyExtractor={(item) => item}
            style={s.list}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[s.option, item === value && s.optionSelected]}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
              >
                <Text style={[s.optionText, item === value && s.optionTextSelected]}>{item}</Text>
                {item === value && <Text style={s.checkmark}>✓</Text>}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={s.empty}>
                <Text style={s.emptyText}>No results found</Text>
              </View>
            }
          />
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  label: { fontSize: font.label, fontWeight: '600', color: colors.ink, marginBottom: 6 },
  trigger: {
    minHeight: TOUCH,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerDisabled: { backgroundColor: colors.surfaceVariant, opacity: 0.6 },
  triggerText: { fontSize: font.body, color: colors.ink, flex: 1 },
  placeholder: { color: colors.muted },
  arrow: { fontSize: 12, color: colors.muted, marginLeft: 8 },

  // Modal sheet
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.l,
    borderTopRightRadius: radius.l,
    maxHeight: '75%',
    paddingBottom: 32,
  },
  handle: { width: 40, height: 4, backgroundColor: colors.border, alignSelf: 'center', borderRadius: radius.pill, marginTop: 12, marginBottom: 4 },
  sheetTitle: {
    fontSize: font.subtitle,
    fontWeight: '700',
    color: colors.ink,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  // Search
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 12,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, height: 44, fontSize: font.body, color: colors.ink },

  // Options
  list: { maxHeight: 320 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionSelected: { backgroundColor: colors.primarySoft },
  optionText: { flex: 1, fontSize: font.body, color: colors.ink },
  optionTextSelected: { color: colors.primary, fontWeight: '700' },
  checkmark: { fontSize: 18, color: colors.primary, fontWeight: '700' },

  empty: { padding: spacing.lg, alignItems: 'center' },
  emptyText: { color: colors.muted, fontSize: font.body },
});
