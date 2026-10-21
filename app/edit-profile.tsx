import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chip } from '../src/components/Chip';
import { CROPS } from '../src/constants/crops';
import { colors, font, radius, shadow, spacing } from '../src/constants/theme';
import { useT } from '../src/i18n';
import { locationService } from '../src/services/locationService';
import { updateFarmerProfileApi } from '../src/services/api';
import { useFarmerStore } from '../src/store/farmerStore';
import { useLocationStore } from '../src/store/locationStore';
import { LandUnit } from '../src/types';
import { KARNATAKA_DISTRICTS } from '../src/utils/locationUtils';

export default function EditProfileScreen() {
  const t = useT();
  const router = useRouter();

  const { farmer, farm, crops, setFarmer, setFarm, setCrops } = useFarmerStore();
  const { setLocation } = useLocationStore();

  const [name, setName] = useState<string>(farmer.name || '');
  const [mobile, setMobile] = useState<string>(farmer.mobile || '');
  const [email, setEmail] = useState<string>(farmer.email || '');
  const [village, setVillage] = useState<string>(farm.village || '');
  const [taluk, setTaluk] = useState<string>(farm.taluk || '');
  const [district, setDistrict] = useState<string>(farm.district || '');
  const [stateName, setStateName] = useState<string>(farm.state || '');
  const [pincode, setPincode] = useState<string>(farm.pincode || '');
  const [totalLand, setTotalLand] = useState<string>(farm.totalLand ? String(farm.totalLand) : '');
  const [cultivatedLand, setCultivatedLand] = useState<string>(farm.cultivatedLand ? String(farm.cultivatedLand) : '');
  const [landUnit, setLandUnit] = useState<LandUnit>(farm.landUnit || 'acres');
  const [selectedCrops, setSelectedCrops] = useState<string[]>(crops || []);

  const [saving, setSaving] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [locationFetched, setLocationFetched] = useState(false);

  const toggleCrop = (id: string) => {
    if (selectedCrops.includes(id)) {
      setSelectedCrops(selectedCrops.filter((c) => c !== id));
    } else {
      setSelectedCrops([...selectedCrops, id]);
    }
  };

  /** Fetch GPS location and auto-fill all address fields */
  const handleFetchLocation = async () => {
    setFetchingLocation(true);
    setLocationFetched(false);
    try {
      // Step 1: Get the GPS location (snapped to nearest known place)
      const loc = await locationService.getCurrentLocation();

      // Step 2: Reverse geocode to get full address details
      if (loc.latitude == null || loc.longitude == null) {
        throw new Error('Location permission was granted, but GPS coordinates were not available.');
      }

      const address = await locationService.reverseGeocode({
        latitude: loc.latitude,
        longitude: loc.longitude,
      });

      // Step 3: Auto-fill all address fields
      setVillage(address.village);
      setTaluk(address.taluk);
      setDistrict(address.district);
      setStateName(address.state);
      setPincode(address.pincode);

      // Step 4: Update the location store as well
      setLocation({
        label: address.label,
        district: address.district,
        state: address.state,
        latitude: address.latitude,
        longitude: address.longitude,
      });

      setLocationFetched(true);
    } catch (err: any) {
      Alert.alert(
        'Location Error',
        err?.message || 'Could not fetch your location. Please fill the fields manually.',
      );
    } finally {
      setFetchingLocation(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your name.');
      return;
    }

    setSaving(true);
    try {
      setFarmer({ name, email, mobile });
      setFarm({
        village,
        taluk,
        district,
        pincode,
        state: stateName,
        totalLand: Number(totalLand) || 0,
        cultivatedLand: Number(cultivatedLand) || 0,
        landUnit,
      });
      setCrops(selectedCrops);

      try {
        await updateFarmerProfileApi({
          fullName: name,
          state: stateName,
          district,
          taluk,
          village,
          pincode,
          totalLandArea: Number(totalLand) || 0,
          cultivatedLandArea: Number(cultivatedLand) || 0,
          landUnit,
          primaryCrops: selectedCrops,
        });
      } catch (apiErr) {
        console.warn('Backend sync warning:', apiErr);
      }

      Alert.alert('Profile Saved 🎉', 'Your farmer profile and land information have been updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← {t('back')}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>✏️ Edit Farmer Profile</Text>
        <Pressable onPress={handleSave} disabled={saving}>
          <Text style={styles.saveHeaderBtn}>{saving ? 'Saving...' : 'Save'}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Personal Details Card */}
        <Text style={styles.sectionTitle}>👤 Personal Details</Text>
        <View style={styles.card}>
          <Text style={styles.inputLabel}>Farmer Name *</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your Full Name" />

          <Text style={styles.inputLabel}>Mobile Number *</Text>
          <TextInput
            style={styles.input}
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
            placeholder="10-digit mobile number"
          />

          <Text style={styles.inputLabel}>Email Address (Optional)</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="farmer@example.com" />
        </View>

        {/* Farm & Location Card */}
        <Text style={styles.sectionTitle}>📍 Farm & Location Details</Text>
        <View style={styles.card}>
          {/* ── Fetch Location Button ── */}
          <Pressable
            style={[styles.fetchLocationBtn, fetchingLocation && styles.fetchLocationBtnDisabled]}
            onPress={handleFetchLocation}
            disabled={fetchingLocation}
          >
            {fetchingLocation ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.fetchLocationIcon}>📍</Text>
            )}
            <Text style={styles.fetchLocationText}>
              {fetchingLocation
                ? 'Fetching Location…'
                : locationFetched
                  ? '✅ Location Fetched — Tap to Refresh'
                  : 'Fetch My Location (Auto-Fill Address)'}
            </Text>
          </Pressable>
          {locationFetched && (
            <View style={styles.fetchSuccessBanner}>
              <Text style={styles.fetchSuccessText}>
                ✅ Address details auto-filled from your current location
              </Text>
            </View>
          )}

          <Text style={styles.inputLabel}>Village / Farm Name</Text>
          <TextInput style={styles.input} value={village} onChangeText={setVillage} placeholder="e.g. Hulivana" />

          <Text style={styles.inputLabel}>District *</Text>
          <View style={styles.chipRow}>
            {Object.keys(KARNATAKA_DISTRICTS).map((d) => (
              <Pressable
                key={d}
                style={[styles.chip, district === d && styles.chipActive]}
                onPress={() => {
                  setDistrict(d);
                  setTaluk(KARNATAKA_DISTRICTS[d][0] || 'Mandya');
                }}
              >
                <Text style={[styles.chipText, district === d && styles.chipTextActive]}>{d}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.inputLabel}>Taluk</Text>
          <TextInput style={styles.input} value={taluk} onChangeText={setTaluk} placeholder="Taluk" />

          <Text style={styles.inputLabel}>State</Text>
          <TextInput style={[styles.input, styles.disabledInput]} value={stateName} editable={false} />

          <Text style={styles.inputLabel}>Pincode</Text>
          <TextInput style={styles.input} value={pincode} onChangeText={setPincode} keyboardType="numeric" placeholder="571401" />
        </View>

        {/* Land Details Card */}
        <Text style={styles.sectionTitle}>🌾 Land & Cultivation</Text>
        <View style={styles.card}>
          <Text style={styles.inputLabel}>Land Measurement Unit</Text>
          <View style={styles.chipRow}>
            {(['acres', 'guntas', 'hectares'] as LandUnit[]).map((u) => (
              <Pressable
                key={u}
                style={[styles.chip, landUnit === u && styles.chipActive]}
                onPress={() => setLandUnit(u)}
              >
                <Text style={[styles.chipText, landUnit === u && styles.chipTextActive]}>{u}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.inputLabel}>Total Land Area ({landUnit})</Text>
          <TextInput style={styles.input} value={totalLand} onChangeText={setTotalLand} keyboardType="numeric" />

          <Text style={styles.inputLabel}>Cultivated Land Area ({landUnit})</Text>
          <TextInput style={styles.input} value={cultivatedLand} onChangeText={setCultivatedLand} keyboardType="numeric" />
        </View>

        {/* Crop Preferences Card */}
        <Text style={styles.sectionTitle}>🌱 Crops Grown (Feed Market Recommendations)</Text>
        <View style={styles.card}>
          <View style={styles.chipRow}>
            {CROPS.map((c) => (
              <Pressable
                key={c.id}
                style={[styles.chip, selectedCrops.includes(c.id) && styles.chipActive]}
                onPress={() => toggleCrop(c.id)}
              >
                <Text style={styles.chipEmoji}>{c.emoji}</Text>
                <Text style={[styles.chipText, selectedCrops.includes(c.id) && styles.chipTextActive]}>
                  {c.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Profile Changes</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.m,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: spacing.xs },
  backText: { fontFamily: font.medium, color: colors.primary, fontSize: 14 },
  headerTitle: { fontFamily: font.bold, fontSize: 16, color: colors.textPrimary },
  saveHeaderBtn: { fontFamily: font.bold, color: colors.primary, fontSize: 15 },
  content: { padding: spacing.m },
  sectionTitle: { fontFamily: font.bold, fontSize: 16, color: colors.textPrimary, marginTop: spacing.m, marginBottom: spacing.s },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    padding: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  inputLabel: { fontFamily: font.bold, fontSize: 13, color: colors.textPrimary, marginTop: spacing.s, marginBottom: 4 },
  input: {
    backgroundColor: colors.background,
    borderRadius: radius.s,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.m,
    height: 44,
    fontFamily: font.regular,
    fontSize: 14,
    color: colors.textPrimary,
  },
  disabledInput: { backgroundColor: colors.surfaceVariant, color: colors.textMuted },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s, marginVertical: 4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: radius.s,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  chipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  chipEmoji: { fontSize: 16 },
  chipText: { fontFamily: font.medium, fontSize: 13, color: colors.textSecondary },
  chipTextActive: { fontFamily: font.bold, color: colors.primary },

  /* ── Fetch Location Button ── */
  fetchLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: spacing.m,
    borderRadius: radius.m,
    gap: 8,
    marginBottom: spacing.s,
  },
  fetchLocationBtnDisabled: {
    opacity: 0.7,
  },
  fetchLocationIcon: {
    fontSize: 18,
  },
  fetchLocationText: {
    fontFamily: font.bold,
    fontSize: 14,
    color: '#fff',
  },
  fetchSuccessBanner: {
    backgroundColor: '#E8F5E9',
    borderRadius: radius.s,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    marginBottom: spacing.s,
    borderWidth: 1,
    borderColor: '#81C784',
  },
  fetchSuccessText: {
    fontFamily: font.medium,
    fontSize: 12,
    color: '#2E7D32',
    textAlign: 'center',
  },

  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.s,
    paddingVertical: spacing.m,
    alignItems: 'center',
    marginTop: spacing.l,
    marginBottom: spacing.xl,
  },
  saveBtnText: { fontFamily: font.bold, fontSize: 16, color: colors.surface },
});
