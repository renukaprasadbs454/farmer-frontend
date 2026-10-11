import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, font, radius, TOUCH } from '../constants/theme';

type Props = { placeholder: string; onSubmit: (q: string) => void };

export function SearchBar({ placeholder, onSubmit }: Props) {
  const [q, setQ] = useState('');
  return (
    <View style={s.wrap}>
      <Text style={{ fontSize: 22 }}>🔍</Text>
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        returnKeyType="search"
        onSubmitEditing={() => onSubmit(q)}
        style={s.input}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#D7E4DC',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    shadowColor: '#0B2A14',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.ink,
    minHeight: 46,
    paddingVertical: 0,
  },
});
