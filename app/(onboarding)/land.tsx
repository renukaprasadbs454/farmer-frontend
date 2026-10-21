import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Chip } from '../../src/components/Chip';
import { Input } from '../../src/components/Input';
import { OnboardingShell } from '../../src/components/OnboardingShell';
import { colors, font, radius, spacing, TOUCH } from '../../src/constants/theme';
import { useFarmerStore } from '../../src/store/farmerStore';
import { FarmingVehicle, LandUnit, WaterSource } from '../../src/types';

const UNITS: { id: LandUnit; label: string; desc: string }[] = [
  { id: 'acres', label: 'Acres', desc: '1 acre = 40 guntas' },
  { id: 'guntas', label: 'Guntas', desc: '40 guntas = 1 acre' },
  { id: 'hectares', label: 'Hectares', desc: '1 ha ≈ 2.47 acres' },
];

const WATER_SOURCES: { id: WaterSource; label: string; emoji: string }[] = [
  { id: 'borewell', label: 'Borewell', emoji: '🔩' },
  { id: 'canal', label: 'Canal', emoji: '🌊' },
  { id: 'river', label: 'River', emoji: '🏞️' },
  { id: 'rainfed', label: 'Rain-fed', emoji: '🌧️' },
  { id: 'tank', label: 'Tank / Pond', emoji: '💧' },
  { id: 'drip', label: 'Drip Irrigation', emoji: '💦' },
  { id: 'sprinkler', label: 'Sprinkler', emoji: '🚿' },
  { id: 'well', label: 'Open Well', emoji: '⛏️' },
];

const VEHICLES: { id: FarmingVehicle; label: string; emoji: string }[] = [
  { id: 'tractor', label: 'Tractor', emoji: '🚜' },
  { id: 'power_tiller', label: 'Power Tiller', emoji: '🔧' },
  { id: 'bullock_cart', label: 'Bullock Cart', emoji: '🐂' },
  { id: 'mini_tractor', label: 'Mini Tractor', emoji: '🚛' },
  { id: 'harvester', label: 'Harvester', emoji: '⚙️' },
  { id: 'sprayer_vehicle', label: 'Sprayer Vehicle', emoji: '💨' },
  { id: 'truck', label: 'Truck / Tempo', emoji: '🚚' },
  { id: 'bike', label: 'Bike / 2-Wheeler', emoji: '🏍️' },
];

const ANIMAL_TYPES = [
  { id: 'cow', label: 'Cow', emoji: '🐄' },
  { id: 'buffalo', label: 'Buffalo', emoji: '🐃' },
  { id: 'goat', label: 'Goat', emoji: '🐐' },
  { id: 'sheep', label: 'Sheep', emoji: '🐑' },
  { id: 'pig', label: 'Pig', emoji: '🐷' },
  { id: 'poultry', label: 'Poultry / Chicken', emoji: '🐔' },
  { id: 'fish', label: 'Fish / Aquaculture', emoji: '🐟' },
  { id: 'donkey', label: 'Donkey / Horse', emoji: '🐴' },
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
  container: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing.sm, marginTop: spacing.lg },
  emoji: { fontSize: 26 },
  title: { fontSize: font.subtitle, fontWeight: '700', color: colors.ink },
  sub: { fontSize: 13, color: colors.muted, marginTop: 2 },
});

function AnimalRow({ id, label, emoji, count, onAdd, onRemove }: { id: string; label: string; emoji: string; count: number; onAdd: () => void; onRemove: () => void }) {
  return (
    <View style={ar.row}>
      <Text style={ar.icon}>{emoji}</Text>
      <Text style={ar.label}>{label}</Text>
      <View style={ar.counter}>
        <TouchableOpacity style={[ar.btn, count === 0 && ar.btnDisabled]} onPress={onRemove} disabled={count === 0}>
          <Text style={ar.btnText}>−</Text>
        </TouchableOpacity>
        <Text style={ar.count}>{count}</Text>
        <TouchableOpacity style={ar.btn} onPress={onAdd}>
          <Text style={ar.btnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const ar = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  icon: { fontSize: 22, width: 34 },
  label: { flex: 1, fontSize: font.body, color: colors.ink, fontWeight: '500' },
  counter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  btn: { width: 36, height: 36, borderRadius: radius.full, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { backgroundColor: colors.disabled },
  btnText: { color: '#fff', fontSize: 20, fontWeight: '700', lineHeight: 24 },
  count: { fontSize: font.body, fontWeight: '700', color: colors.ink, minWidth: 28, textAlign: 'center' },
});

export default function Land() {
  const router = useRouter();
  const { farm, setFarm } = useFarmerStore();
  const [total, setTotal] = useState(farm.totalLand ? String(farm.totalLand) : '');
  const [cultivated, setCultivated] = useState(farm.cultivatedLand ? String(farm.cultivatedLand) : '');
  const [boreDepth, setBoreDepth] = useState(farm.borewellDepthFeet ? String(farm.borewellDepthFeet) : '');
  const [waterAvailability, setWaterAvailability] = useState<'Year-round' | 'Seasonal' | 'Insufficient' | undefined>(
    farm.borewellWaterAvailability || 'Year-round'
  );

  const t = Number(total);
  const c = Number(cultivated);
  const tooMuch = c > t && t > 0;

  const toggleWater = (ws: WaterSource) => {
    const cur = farm.waterSources || [];
    const updated = cur.includes(ws) ? cur.filter((w) => w !== ws) : [...cur, ws];
    setFarm({ waterSources: updated });
    // If borewell toggled on, also set hasBorewell
    if (ws === 'borewell') {
      setFarm({ hasBorewell: updated.includes('borewell') });
    }
  };

  const toggleVehicle = (v: FarmingVehicle) => {
    const cur = farm.vehicles || [];
    setFarm({ vehicles: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] });
  };

  const getAnimalCount = (id: string) => {
    return farm.animals?.find((a) => a.type === id)?.count || 0;
  };

  const updateAnimal = (id: string, delta: number) => {
    const cur = farm.animals || [];
    const existing = cur.find((a) => a.type === id);
    const newCount = Math.max(0, (existing?.count || 0) + delta);
    let updated;
    if (newCount === 0) {
      updated = cur.filter((a) => a.type !== id);
    } else if (existing) {
      updated = cur.map((a) => (a.type === id ? { ...a, count: newCount } : a));
    } else {
      updated = [...cur, { type: id, count: newCount }];
    }
    setFarm({ animals: updated });
  };

  const next = () => {
    setFarm({
      totalLand: t,
      cultivatedLand: c,
      borewellDepthFeet: boreDepth ? Number(boreDepth) : undefined,
      borewellWaterAvailability: (farm.waterSources || []).includes('borewell') ? waterAvailability : undefined,
    });
    router.push('/crops');
  };

  const valid = t > 0 && !tooMuch;

  return (
    <OnboardingShell
      step={3}
      title="Tell us about your farm"
      subtitle="Help us understand your farming setup."
      onBack={() => router.back()}
      onNext={next}
      nextDisabled={!valid}
    >
      {/* ─── Land ─── */}
      <SectionHeader emoji="🌾" title="How much land do you have?" />

      <Text style={s.label}>Unit of Measurement</Text>
      <View style={s.chips}>
        {UNITS.map((u) => (
          <Chip key={u.id} label={u.label} selected={farm.landUnit === u.id} onPress={() => setFarm({ landUnit: u.id })} />
        ))}
      </View>

      <Input
        label={`Total land (${farm.landUnit})`}
        keyboardType="decimal-pad"
        value={total}
        onChangeText={setTotal}
        placeholder="e.g. 5"
      />
      <Input
        label={`Cultivation area (${farm.landUnit})`}
        keyboardType="decimal-pad"
        value={cultivated}
        onChangeText={setCultivated}
        placeholder="e.g. 4"
        error={tooMuch ? 'Cultivation area cannot exceed total land.' : null}
      />

      {/* ─── Water Source ─── */}
      <SectionHeader emoji="💧" title="Source of Water" subtitle="Select all that apply" />
      <View style={s.chips}>
        {WATER_SOURCES.map((ws) => (
          <Chip
            key={ws.id}
            emoji={ws.emoji}
            label={ws.label}
            selected={(farm.waterSources || []).includes(ws.id)}
            onPress={() => toggleWater(ws.id)}
          />
        ))}
      </View>

      {/* Borewell details */}
      {(farm.waterSources || []).includes('borewell') && (
        <View style={s.boreBox}>
          <Text style={s.boreTitle}>🔩 Borewell Details</Text>
          <Input
            label="Borewell depth (feet)"
            keyboardType="number-pad"
            value={boreDepth}
            onChangeText={setBoreDepth}
            placeholder="e.g. 400"
          />
          <Text style={s.label}>Water availability from borewell?</Text>
          <View style={s.chips}>
            {(['Year-round', 'Seasonal', 'Insufficient'] as const).map((opt) => (
              <Chip
                key={opt}
                label={opt}
                selected={waterAvailability === opt}
                onPress={() => setWaterAvailability(opt)}
              />
            ))}
          </View>
        </View>
      )}

      {/* ─── Animals ─── */}
      <SectionHeader emoji="🐄" title="Animals & Livestock" subtitle="Set count to 0 if you don't have them" />
      <View style={s.animalsCard}>
        {ANIMAL_TYPES.map((a) => (
          <AnimalRow
            key={a.id}
            id={a.id}
            label={a.label}
            emoji={a.emoji}
            count={getAnimalCount(a.id)}
            onAdd={() => updateAnimal(a.id, 1)}
            onRemove={() => updateAnimal(a.id, -1)}
          />
        ))}
      </View>

      {/* ─── Vehicles ─── */}
      <SectionHeader emoji="🚜" title="Farming Vehicles & Equipment" subtitle="Which do you use or own?" />
      <View style={s.chips}>
        {VEHICLES.map((v) => (
          <Chip
            key={v.id}
            emoji={v.emoji}
            label={v.label}
            selected={(farm.vehicles || []).includes(v.id)}
            onPress={() => toggleVehicle(v.id)}
          />
        ))}
      </View>
    </OnboardingShell>
  );
}

const s = StyleSheet.create({
  label: { fontSize: font.label, fontWeight: '600', color: colors.ink, marginBottom: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: spacing.md },
  boreBox: {
    backgroundColor: '#F0F8F0',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  boreTitle: { fontSize: font.label, fontWeight: '700', color: colors.primary, marginBottom: spacing.sm },
  animalsCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
});
