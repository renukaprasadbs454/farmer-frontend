import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '../../src/constants/theme';
import { useT } from '../../src/i18n';

const icon = (emoji: string) => ({ focused }: { focused: boolean }) => (
  <Text style={{ fontSize: 26, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
);

export default function TabsLayout() {
  const t = useT();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 13, fontWeight: '700' },
        tabBarStyle: {
          height: 68,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2EBE5',
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen name="home" options={{ title: t('tabHome'), tabBarIcon: icon('🏠') }} />
      <Tabs.Screen name="market" options={{ title: t('tabMarket'), tabBarIcon: icon('🛒') }} />
      <Tabs.Screen name="services" options={{ title: t('tabServices'), tabBarIcon: icon('🚜') }} />
      <Tabs.Screen name="myfarm" options={{ title: t('tabFarm'), tabBarIcon: icon('🌱') }} />
      <Tabs.Screen name="orders" options={{ href: null }} />
    </Tabs>
  );
}
