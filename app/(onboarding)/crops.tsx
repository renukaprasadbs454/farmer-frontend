import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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

  const toggle = (id: string) =>
    setCrops(crops.includes(id) ? crops.filter((c) => c !== id) : [...crops, id]);

  const finish = () =>
    complete().catch((err: any) =>
      setError(err.message || 'Could not save profile. Please try again.')
    );

  return (
    <OnboardingShell
      step={4}
      title="Your Soil & Crops"
      subtitle={error ?? 'Tell us about your soil and what you grow.'}
      onBack={() => router.back()}
      onNext={finish}
      nextLabel={t('finish')}
      nextDisabled={crops.length === 0}
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

      {crops.length > 0 && (
        <View style={s.cropSummary}>
          <Text style={s.cropSummaryTitle}>✅ Selected crops ({crops.length})</Text>
          <Text style={s.cropSummaryList}>
            {crops.map((id) => CROPS.find((c) => c.id === id)?.label).filter(Boolean).join(' • ')}
          </Text>
        </View>
      )}
    </OnboardingShell>
  );
}

function SoilCard({ emoji, label, desc, selected, onPress }: { emoji: string; label: string; desc: string; selected: boolean; onPress: () => void }) {
  return (
    <View
      style={[sc.card, selected && sc.cardSelected]}
    >
      <Text style={sc.emoji} onPress={onPress}>{emoji}</Text>
      <Text style={[sc.label, selected && sc.labelSelected]} onPress={onPress}>{label}</Text>
      <Text style={sc.desc} numberOfLines={2} onPress={onPress}>{desc}</Text>
      {selected && <View style={sc.badge}><Text style={sc.badgeText}>✓</Text></View>}
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
    position: 'absolute', top: 8, right: 8,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});

const s = StyleSheet.create({
  soilGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: spacing.md },
  soilTestRow: { marginBottom: spacing.md },
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
