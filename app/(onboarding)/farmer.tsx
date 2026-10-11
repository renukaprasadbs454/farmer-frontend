import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { Chip } from '../../src/components/Chip';
import { Input } from '../../src/components/Input';
import { OnboardingShell } from '../../src/components/OnboardingShell';
import { colors, font, radius, spacing } from '../../src/constants/theme';
import { locationService } from '../../src/services/locationService';
import { useFarmerStore } from '../../src/store/farmerStore';
import { Gender } from '../../src/types';

const GENDERS: { id: Gender; label: string; emoji: string }[] = [
  { id: 'male', label: 'Male', emoji: '👨' },
  { id: 'female', label: 'Female', emoji: '👩' },
  { id: 'other', label: 'Other', emoji: '🧑' },
];

export default function FarmerDetails() {
  const router = useRouter();
  const { farmer, setFarmer } = useFarmerStore();
  const [age, setAge] = useState(farmer.age ? String(farmer.age) : '');
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  const captureLocation = async () => {
    setLocLoading(true);
    setLocError(null);
    try {
      const loc = await locationService.getCurrentLocation();
      setFarmer({
        gpsLat: loc.latitude,
        gpsLng: loc.longitude,
        gpsLabel: loc.label || `${loc.district}, ${loc.state}`,
      });
    } catch (e) {
      setLocError((e as Error).message || 'Could not get location');
    } finally {
      setLocLoading(false);
    }
  };

  const next = () => {
    setFarmer({ age: age ? Number(age) : undefined });
    router.push('/farm');
  };

  const hasLocation = !!(farmer.gpsLat && farmer.gpsLng);

  return (
    <OnboardingShell step={1} title="Tell us about you" onNext={next} nextDisabled={!farmer.name.trim()}>
      <Input label="Full name" value={farmer.name} onChangeText={(name) => setFarmer({ name })} placeholder="Enter your full name" />
      <Input label="Age" keyboardType="number-pad" maxLength={3} value={age} onChangeText={setAge} placeholder="Your age" />

      <Text style={s.label}>Gender</Text>
      <View style={s.chips}>
        {GENDERS.map((g) => (
          <Chip key={g.id} emoji={g.emoji} label={g.label} selected={farmer.gender === g.id} onPress={() => setFarmer({ gender: g.id })} />
        ))}
      </View>

      {/* GPS Location capture */}
      <Text style={s.label}>Your Location</Text>
      <Text style={s.hint}>We use your GPS location to show nearby services, markets and weather for your area.</Text>

      {hasLocation ? (
        <View style={s.locSuccess}>
          <View style={s.locSuccessRow}>
            <Text style={s.locPin}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.locLabel}>{farmer.gpsLabel}</Text>
              <Text style={s.locCoords}>{farmer.gpsLat?.toFixed(4)}°N, {farmer.gpsLng?.toFixed(4)}°E</Text>
            </View>
            <Text style={s.locCheck}>✓</Text>
          </View>
          <Button title="Update Location" variant="outline" onPress={captureLocation} loading={locLoading} style={{ marginTop: 10 }} />
        </View>
      ) : (
        <View>
          <Button
            title={locLoading ? 'Getting location...' : '📍  Allow Location Access'}
            onPress={captureLocation}
            loading={locLoading}
          />
          {Platform.OS === 'web' && (
            <Text style={s.webNote}>Tap the button and allow location access in your browser popup.</Text>
          )}
        </View>
      )}

      {locError ? (
        <View style={s.errorBox}>
          <Text style={s.errorText}>⚠️ {locError}</Text>
          <Text style={s.errorSub}>You can still continue — location can be updated later.</Text>
        </View>
      ) : null}
    </OnboardingShell>
  );
}

const s = StyleSheet.create({
  label: { fontSize: font.label, fontWeight: '600', color: colors.ink, marginBottom: 6, marginTop: 4 },
  hint: { fontSize: font.small, color: colors.muted, marginBottom: spacing.sm, lineHeight: 22 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: spacing.lg },
  locSuccess: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  locSuccessRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  locPin: { fontSize: 22 },
  locLabel: { fontSize: font.body, fontWeight: '700', color: colors.primary },
  locCoords: { fontSize: 13, color: colors.muted, marginTop: 2 },
  locCheck: { fontSize: 22, color: colors.primary, fontWeight: '700' },
  errorBox: {
    backgroundColor: '#FFF0F0',
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  errorText: { fontSize: font.small, color: colors.danger, fontWeight: '600' },
  errorSub: { fontSize: 13, color: colors.muted, marginTop: 4 },
  webNote: { fontSize: 13, color: colors.muted, marginTop: 8, textAlign: 'center' },
});
