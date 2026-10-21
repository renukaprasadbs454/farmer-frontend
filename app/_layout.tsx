import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors, MAX_WIDTH } from '../src/constants/theme';
import { useHydrated } from '../src/hooks/useHydrated';
import { useAuthStore } from '../src/store/authStore';
import { useFarmerStore } from '../src/store/farmerStore';

export default function RootLayout() {
  const hydrated = useHydrated();
  const token = useAuthStore((s) => s.token);
  const sessionChecked = useAuthStore((s) => s.sessionChecked);
  const validateSession = useAuthStore((s) => s.validateSession);
  const onboarded = useFarmerStore((s) => s.onboarded);
  const sessionReady = hydrated && sessionChecked;

  useEffect(() => {
    if (hydrated && !sessionChecked) {
      validateSession();
    }
  }, [hydrated, sessionChecked, validateSession]);

  return (
    <SafeAreaProvider>
      {/* On web the app stays a centred, phone-width column instead of stretching. */}
      <View style={{ flex: 1, alignItems: 'center', backgroundColor: colors.outer }}>
        <View style={{ flex: 1, width: '100%', maxWidth: MAX_WIDTH, backgroundColor: colors.bg }}>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Protected guard={sessionReady && !token}>
              <Stack.Screen name="(auth)" />
            </Stack.Protected>
            <Stack.Protected guard={sessionReady && !!token && !onboarded}>
              <Stack.Screen name="(onboarding)" />
            </Stack.Protected>
            <Stack.Protected guard={sessionReady && !!token && onboarded}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="services/labour/[id]" />
              <Stack.Screen name="services/labour/booking" />
              <Stack.Screen name="services/machinery/[id]" />
              <Stack.Screen name="services/machinery/booking" />
              <Stack.Screen name="orders/[id]" />
              {/* Phase 3 & 4 Market Routes */}
              <Stack.Screen name="market/category/[category]" />
              <Stack.Screen name="market/product/[id]" />
              <Stack.Screen name="market/cart" />
              <Stack.Screen name="market/checkout" />
              <Stack.Screen name="market/order/[id]" />
              <Stack.Screen name="market/wishlist" />
              <Stack.Screen name="market/sell/index" />
              <Stack.Screen name="market/sell/create" />
              <Stack.Screen name="market/sell/requests" />
              <Stack.Screen name="market/crops/[id]" />
              <Stack.Screen name="market/saved-crops" />
              {/* Phase 5 Polish & System Routes */}
              <Stack.Screen name="notifications" />
              <Stack.Screen name="search" />
              <Stack.Screen name="settings" />
              <Stack.Screen name="support" />
              <Stack.Screen name="edit-profile" />
            </Stack.Protected>
          </Stack>


        </View>
      </View>
    </SafeAreaProvider>
  );
}
