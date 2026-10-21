import { Tabs } from 'expo-router';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../../src/constants/theme';
import { useT } from '../../src/i18n';

const icon = (emoji: string) => ({ focused }: { focused: boolean }) => (
  <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
    <Text style={[styles.iconText, !focused && styles.iconTextInactive]}>{emoji}</Text>
  </View>
);

export default function TabsLayout() {
  const t = useT();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '800', marginTop: 1 },
        tabBarStyle: {
          height: 72,
          paddingTop: 6,
          paddingBottom: 8,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          ...Platform.select({
            web: {
              boxShadow: '0 -2px 12px rgba(11,42,20,0.06)',
            },
            default: {
              elevation: 6,
            },
          }),
        },
      }}
    >
      <Tabs.Screen name="home" options={{ title: t('tabHome'), tabBarIcon: icon('🏠') }} />
      <Tabs.Screen name="market" options={{ title: t('tabMarket'), tabBarIcon: icon('🛒') }} />
      <Tabs.Screen name="chat" options={{ title: t('tabChat'), tabBarIcon: icon('💬') }} />
      <Tabs.Screen name="services" options={{ title: t('tabServices'), tabBarIcon: icon('🚜') }} />
      <Tabs.Screen name="myfarm" options={{ title: t('tabFarm'), tabBarIcon: icon('🌱') }} />
      <Tabs.Screen name="orders" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 42,
    height: 30,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: colors.primarySoft,
  },
  iconText: {
    fontSize: 20,
  },
  iconTextInactive: {
    opacity: 0.58,
  },
});
