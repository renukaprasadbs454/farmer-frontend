import { Redirect } from 'expo-router';
import { Text, View } from 'react-native';
import { colors, font } from '../src/constants/theme';
import { useHydrated } from '../src/hooks/useHydrated';
import { useAuthStore } from '../src/store/authStore';
import { useFarmerStore } from '../src/store/farmerStore';

// Splash + router: decides where the farmer lands.
export default function Index() {
  const hydrated = useHydrated();
  const token = useAuthStore((s) => s.token);
  const sessionChecked = useAuthStore((s) => s.sessionChecked);
  const onboarded = useFarmerStore((s) => s.onboarded);
  if (!hydrated || !sessionChecked) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 72 }}>🌾</Text>
        <Text style={{ fontSize: font.hero, fontWeight: '800', color: '#fff', marginTop: 12 }}>Farmer Mate</Text>
      </View>
    );
  }
  if (!token) return <Redirect href="/welcome" />;
  if (!onboarded) return <Redirect href="/farmer" />;
  return <Redirect href="/home" />;
}
