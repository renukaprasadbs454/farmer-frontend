import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Chip } from '../../src/components/Chip';
import { OnboardingShell } from '../../src/components/OnboardingShell';
import { CROPS } from '../../src/constants/crops';
import { useT } from '../../src/i18n';
import { colors, font, radius, spacing } from '../../src/constants/theme';
import { useFarmerStore } from '../../src/store/farmerStore';
import { SoilType } from '../../src/types';

const SOIL_TYPES: { id: SoilType; label: string; emoji: string; desc: string }[] = [
  { id: 'red', label: 'Red Soil', emoji: '🟥', desc: 'Sandy texture, iron rich, good for millets' },
  { id: 'black', label: 'Black / Cotton Soil', emoji: '⬛', desc: 'Heavy clay, holds moisture, ideal for cotton & wheat' },
  { id: 'alluvial', label: 'Alluvial Soil', emoji: '🟫', desc: 'Rich & fertile, ideal for paddy & vegetables' },
  { id: 'laterite', label: 'Laterite Soil', emoji: '🧱', desc: 'Acidic, suited for tea, coffee, cashew' },
  { id: 'sandy', label: 'Sandy Soil', emoji: '🏖️', desc: 'Drains fast, suited for groundnut & root crops' },
  { id: 'loamy', label: 'Loamy Soil', emoji: '🌱', desc: 'Best all-round soil, balanced drainage & moisture' },
  { id: 'clay', label: 'Clay Soil', emoji: '🏺', desc: 'Heavy, retains water, good for paddy' },
  { id: 'mixed', label: 'Mixed / Not Sure', emoji: '🔄', desc: 'Combination or unsure of soil type' },
];

const PH_RANGES = [
  { id: 'acidic', label: 'Acidic (< 6)', emoji: '🔴' },
  { id: 'neutral', label: 'Neutral (6–7)', emoji: '🟢' },
  { id: 'alkaline', label: 'Alkaline (> 7)', emoji: '🔵' },
  { id: 'unknown', label: 'Not tested', emoji: '❓' },
];

function SectionHeader({ emoji, title, subtitle }: { emoji: string; title: string; subtitle?: string }) {
  return (
    <View style={sh.container}>
      <Text style={sh.emoji}>{emoji}</Text>
      <View>
        <Text style={sh.title}>{title}</Text>
        {subtitle ? <Text style={sh.sub}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const sh = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing.sm, marginTop: spacing.md },
  emoji: { fontSize: 26 },
  title: { fontSize: font.subtitle, fontWeight: '700', color: colors.ink },
  sub: { fontSize: 13, color: colors.muted, marginTop: 2 },
});

export default function CropSelection() {
  const t = useT();
  const router = useRouter();
  const { crops, setCrops, farm, setFarm, complete, saving } = useFarmerStore();
  const [error, setError] = useState<string | null>(null);
  const [ph, setPH] = useState(farm.soilPH || '');

  // Custom crops for "Other" option
  const [otherCropInput, setOtherCropInput] = useState('');
  const [customCrops, setCustomCrops] = useState<string[]>(() =>
    crops.filter((c) => !CROPS.some((k) => k.id === c) && c !== 'other')
  );

  const toggle = (id: string) => {
    if (id === 'other') {
      if (crops.includes('other')) {
        // Deselect other: remove 'other' and also remove custom crops from crops
        setCrops(crops.filter((c) => c !== 'other' && !customCrops.includes(c)));
      } else {
        // Select other: add 'other' and any existing customCrops
        setCrops(Array.from(new Set([...crops, 'other', ...customCrops])));
      }
    } else {
      setCrops(crops.includes(id) ? crops.filter((c) => c !== id) : [...crops, id]);
    }
  };

  const handleAddCustomCrop = () => {
    const trimmed = otherCropInput.trim();
    if (!trimmed) return;
    const items = trimmed.split(',').map((s) => s.trim()).filter(Boolean);
    const updatedCustom = Array.from(new Set([...customCrops, ...items]));
    setCustomCrops(updatedCustom);
    setOtherCropInput('');

    // Ensure standard selected crops + 'other' + custom crops are in store
    const standardCrops = crops.filter((c) => CROPS.some((k) => k.id === c));
    setCrops(Array.from(new Set([...standardCrops, 'other', ...updatedCustom])));
  };

  const handleRemoveCustomCrop = (name: string) => {
    const updatedCustom = customCrops.filter((c) => c !== name);
    setCustomCrops(updatedCustom);
    const standardCrops = crops.filter((c) => CROPS.some((k) => k.id === c));
    setCrops(
      Array.from(
        new Set([
          ...standardCrops,
          ...(crops.includes('other') ? ['other'] : []),
          ...updatedCustom,
        ])
      )
    );
  };

  const selectedCropsDisplayList = useMemo(() => {
    const list: string[] = [];
    crops.forEach((id) => {
      if (id === 'other') {
        if (customCrops.length === 0) list.push('Other');
      } else {
        const standard = CROPS.find((c) => c.id === id);
        if (standard) {
          list.push(standard.label);
        } else {
          list.push(id);
        }
      }
    });
    return Array.from(new Set(list));
  }, [crops, customCrops]);

  const finish = () => {
    let finalCrops = [...crops];
    const pendingInput = otherCropInput.trim();
    if (crops.includes('other') && pendingInput) {
      const items = pendingInput.split(',').map((s) => s.trim()).filter(Boolean);
      finalCrops = Array.from(new Set([...finalCrops, ...items]));
      setCrops(finalCrops);
    }
    complete().catch((err: any) =>
      setError(err.message || 'Could not save profile. Please try again.')
    );
  };

  return (
    <OnboardingShell
      step={4}
      title="Your Soil & Crops"
      subtitle={error ?? 'Tell us about your soil and what you grow.'}
      onBack={() => router.back()}
      onNext={finish}
      nextLabel={t('finish')}
      nextDisabled={selectedCropsDisplayList.length === 0}
      loading={saving}
    >
      {/* ─── Soil Type ─── */}
      <SectionHeader emoji="🌍" title="What is your soil type?" subtitle="Tap to select" />
      <View style={s.soilGrid}>
        {SOIL_TYPES.map((soil) => (
          <SoilCard
            key={soil.id}
            emoji={soil.emoji}
            label={soil.label}
            desc={soil.desc}
            selected={farm.soilType === soil.id}
            onPress={() => setFarm({ soilType: soil.id })}
          />
        ))}
      </View>

      {/* ─── Soil pH ─── */}
      <SectionHeader emoji="🧪" title="Soil pH Level" subtitle="If you've tested your soil" />
      <View style={s.chips}>
        {PH_RANGES.map((p) => (
          <Chip
            key={p.id}
            emoji={p.emoji}
            label={p.label}
            selected={ph === p.id}
            onPress={() => {
              setPH(p.id);
              setFarm({ soilPH: p.id });
            }}
          />
        ))}
      </View>

      {/* Soil test */}
      <View style={s.soilTestRow}>
        <Chip
          emoji={farm.hasSoilTest ? '✅' : '🔬'}
          label={farm.hasSoilTest ? 'Soil test done' : 'Had soil test done?'}
          selected={farm.hasSoilTest}
          onPress={() => setFarm({ hasSoilTest: !farm.hasSoilTest })}
        />
      </View>

      {/* ─── Crops ─── */}
      <SectionHeader emoji="🌾" title="What crops do you grow?" subtitle="Select all that apply" />
      <View style={s.chips}>
        {CROPS.map((c) => (
          <Chip
            key={c.id}
            emoji={c.emoji}
            label={c.label}
            selected={crops.includes(c.id)}
            onPress={() => toggle(c.id)}
          />
        ))}
      </View>

      {/* ─── Custom Crops Input when "Other" is selected ─── */}
      {crops.includes('other') && (
        <View style={s.otherCard}>
          <View style={s.otherHeader}>
            <Text style={s.otherTitle}>➕ What other crops do you grow?</Text>
            <Text style={s.otherHint}>Type crop name and tap Add (e.g. Groundnut, Turmeric, Ginger)</Text>
          </View>

          <View style={s.otherInputRow}>
            <TextInput
              style={s.otherInput}
              placeholder="Enter crop name..."
              placeholderTextColor={colors.muted}
              value={otherCropInput}
              onChangeText={setOtherCropInput}
              onSubmitEditing={handleAddCustomCrop}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[s.otherAddBtn, !otherCropInput.trim() && s.otherAddBtnDisabled]}
              onPress={handleAddCustomCrop}
              disabled={!otherCropInput.trim()}
            >
              <Text style={s.otherAddBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {/* Render added custom crops */}
          {customCrops.length > 0 && (
            <View style={s.customTagsRow}>
              {customCrops.map((cropName) => (
                <View key={cropName} style={s.customTag}>
                  <Text style={s.customTagText}>🌱 {cropName}</Text>
                  <TouchableOpacity
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    onPress={() => handleRemoveCustomCrop(cropName)}
                  >
                    <Text style={s.customTagRemove}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {selectedCropsDisplayList.length > 0 && (
        <View style={s.cropSummary}>
          <Text style={s.cropSummaryTitle}>
            ✅ Selected crops ({selectedCropsDisplayList.length})
          </Text>
          <Text style={s.cropSummaryList}>
            {selectedCropsDisplayList.join(' • ')}
          </Text>
        </View>
      )}
    </OnboardingShell>
  );
}

function SoilCard({
  emoji,
  label,
  desc,
  selected,
  onPress,
}: {
  emoji: string;
  label: string;
  desc: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <View style={[sc.card, selected && sc.cardSelected]}>
      <Text style={sc.emoji} onPress={onPress}>
        {emoji}
      </Text>
      <Text style={[sc.label, selected && sc.labelSelected]} onPress={onPress}>
        {label}
      </Text>
      <Text style={sc.desc} numberOfLines={2} onPress={onPress}>
        {desc}
      </Text>
      {selected && (
        <View style={sc.badge}>
          <Text style={sc.badgeText}>✓</Text>
        </View>
      )}
    </View>
  );
}

const sc = StyleSheet.create({
  card: {
    width: '48%',
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 14,
    marginBottom: 10,
    position: 'relative',
  },
  cardSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  emoji: { fontSize: 26, marginBottom: 6 },
  label: { fontSize: font.label, fontWeight: '700', color: colors.ink, marginBottom: 4 },
  labelSelected: { color: colors.primary },
  desc: { fontSize: 12, color: colors.muted, lineHeight: 17 },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});

const s = StyleSheet.create({
  soilGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: spacing.md },
  soilTestRow: { marginBottom: spacing.md },
  otherCard: {
    backgroundColor: '#fff',
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  otherHeader: {
    marginBottom: 2,
  },
  otherTitle: {
    fontSize: font.body,
    fontWeight: '700',
    color: colors.primary,
  },
  otherHint: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  otherInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  otherInput: {
    flex: 1,
    minHeight: 46,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    fontSize: font.body,
    color: colors.ink,
    backgroundColor: colors.card,
  },
  otherAddBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    minHeight: 46,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otherAddBtnDisabled: {
    backgroundColor: colors.disabled,
  },
  otherAddBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: font.body,
  },
  customTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  customTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primarySoft,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  customTagText: {
    fontSize: font.small,
    fontWeight: '600',
    color: colors.ink,
  },
  customTagRemove: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.muted,
    marginLeft: 2,
  },
  cropSummary: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginTop: spacing.sm,
  },
  cropSummaryTitle: { fontSize: font.label, fontWeight: '700', color: colors.primary, marginBottom: 6 },
  cropSummaryList: { fontSize: font.small, color: colors.ink, lineHeight: 22 },
});
