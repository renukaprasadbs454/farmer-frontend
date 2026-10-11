import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Dropdown } from '../../src/components/Dropdown';
import { Input } from '../../src/components/Input';
import { OnboardingShell } from '../../src/components/OnboardingShell';
import {
  getDistricts,
  getHoblis,
  getStates,
  getTaluks,
  getVillages,
} from '../../src/constants/indiaRegions';
import { colors, font, spacing } from '../../src/constants/theme';
import { useFarmerStore } from '../../src/store/farmerStore';

export default function FarmDetails() {
  const router = useRouter();
  const { farm, setFarm } = useFarmerStore();

  const states = getStates();
  const districts = farm.state ? getDistricts(farm.state) : [];
  const taluks = farm.district ? getTaluks(farm.state, farm.district) : [];
  const hoblis = farm.taluk ? getHoblis(farm.state, farm.district, farm.taluk) : [];
  const villages = farm.hobli ? getVillages(farm.state, farm.district, farm.taluk, farm.hobli) : [];

  // Reset downstream when upstream changes
  const onStateChange = (val: string) => {
    setFarm({ state: val, district: '', taluk: '', hobli: '', village: '' });
  };
  const onDistrictChange = (val: string) => {
    setFarm({ district: val, taluk: '', hobli: '', village: '' });
  };
  const onTalukChange = (val: string) => {
    setFarm({ taluk: val, hobli: '', village: '' });
  };
  const onHobliChange = (val: string) => {
    setFarm({ hobli: val, village: '' });
  };
  const onVillageChange = (val: string) => {
    setFarm({ village: val });
  };

  const valid = !!farm.state && !!farm.district && !!farm.taluk && !!farm.village;

  return (
    <OnboardingShell
      step={2}
      title="Where is your farm?"
      subtitle="Select your farm location step by step."
      onBack={() => router.back()}
      onNext={() => router.push('/land')}
      nextDisabled={!valid}
    >
      <View style={s.infoBox}>
        <Text style={s.infoIcon}>🗺️</Text>
        <Text style={s.infoText}>Choose from the dropdowns below. Each selection unlocks the next level.</Text>
      </View>

      <Dropdown
        label="State"
        placeholder="Select State"
        value={farm.state}
        options={states}
        onChange={onStateChange}
      />

      <Dropdown
        label="District"
        placeholder={farm.state ? 'Select District' : 'Select State first'}
        value={farm.district}
        options={districts}
        onChange={onDistrictChange}
        disabled={!farm.state}
      />

      <Dropdown
        label="Taluk"
        placeholder={farm.district ? 'Select Taluk' : 'Select District first'}
        value={farm.taluk}
        options={taluks}
        onChange={onTalukChange}
        disabled={!farm.district}
      />

      <Dropdown
        label="Hobli"
        placeholder={farm.taluk ? 'Select Hobli' : 'Select Taluk first'}
        value={farm.hobli}
        options={hoblis}
        onChange={onHobliChange}
        disabled={!farm.taluk}
      />

      <Dropdown
        label="Village"
        placeholder={farm.hobli ? 'Select Village' : 'Select Hobli first'}
        value={farm.village}
        options={villages}
        onChange={onVillageChange}
        disabled={!farm.hobli}
      />

      <Input
        label="PIN Code"
        keyboardType="number-pad"
        maxLength={6}
        value={farm.pincode}
        onChangeText={(pincode) => setFarm({ pincode })}
        placeholder="6-digit PIN code"
      />

      {/* Summary card if all selected */}
      {valid ? (
        <View style={s.summary}>
          <Text style={s.summaryTitle}>📌 Farm Location Summary</Text>
          <Text style={s.summaryRow}>
            <Text style={s.summaryKey}>Village: </Text>
            <Text style={s.summaryVal}>{farm.village}</Text>
          </Text>
          {farm.hobli ? (
            <Text style={s.summaryRow}>
              <Text style={s.summaryKey}>Hobli: </Text>
              <Text style={s.summaryVal}>{farm.hobli}</Text>
            </Text>
          ) : null}
          <Text style={s.summaryRow}>
            <Text style={s.summaryKey}>Taluk: </Text>
            <Text style={s.summaryVal}>{farm.taluk}</Text>
          </Text>
          <Text style={s.summaryRow}>
            <Text style={s.summaryKey}>District: </Text>
            <Text style={s.summaryVal}>{farm.district}</Text>
          </Text>
          <Text style={s.summaryRow}>
            <Text style={s.summaryKey}>State: </Text>
            <Text style={s.summaryVal}>{farm.state}</Text>
          </Text>
        </View>
      ) : null}
    </OnboardingShell>
  );
}

const s = StyleSheet.create({
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4E8',
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.md,
    gap: 10,
  },
  infoIcon: { fontSize: 22 },
  infoText: { flex: 1, fontSize: font.small, color: colors.primary, fontWeight: '500', lineHeight: 20 },

  summary: {
    backgroundColor: colors.primarySoft,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  summaryTitle: { fontSize: font.label, fontWeight: '700', color: colors.primary, marginBottom: 8 },
  summaryRow: { fontSize: font.small, marginBottom: 4 },
  summaryKey: { fontWeight: '600', color: colors.muted },
  summaryVal: { color: colors.ink, fontWeight: '500' },
});
