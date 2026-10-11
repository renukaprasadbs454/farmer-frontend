import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionCard } from '../../src/components/ActionCard';
import { LabourCard } from '../../src/components/LabourCard';
import { MachineryCard } from '../../src/components/MachineryCard';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { SearchBar } from '../../src/components/SearchBar';
import { cropLabel } from '../../src/constants/crops';
import { colors, font, radius, shadow, spacing } from '../../src/constants/theme';
import { useLocationAndWeather } from '../../src/hooks/useLocationAndWeather';
import { useT } from '../../src/i18n';
import { labourService } from '../../src/services/labourService';
import { machineryService } from '../../src/services/machineryService';
import { useFarmerStore } from '../../src/store/farmerStore';
import { useServiceStore } from '../../src/store/serviceStore';
import { Labourer, Machinery } from '../../src/types';

export default function Home() {
  const t = useT();
  const router = useRouter();
  const { farmer, farm, crops } = useFarmerStore();
  const { setActiveTab } = useServiceStore();
  const { location, weather, loading: weatherLoading, fetchLiveGPS } = useLocationAndWeather();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('goodMorning') : hour < 17 ? t('goodAfternoon') : t('goodEvening');
  const displayLocation = location?.label || [farm.district, farm.state].filter(Boolean).join(', ') || 'Karnataka, India';

  const [nearbyLabour, setNearbyLabour] = useState<Labourer[]>([]);
  const [nearbyMachinery, setNearbyMachinery] = useState<Machinery[]>([]);

  useEffect(() => {
    labourService.getNearbyLabourers(3).then(setNearbyLabour);
    machineryService.getNearbyMachinery(3).then(setNearbyMachinery);
  }, []);

  const handleSearch = (q: string) => {
    if (q.trim()) {
      router.push({ pathname: '/search', params: { q } } as any);
    }
  };

  const goLabour = () => {
    setActiveTab('labour');
    router.push({ pathname: '/services', params: { tab: 'labour' } });
  };

  const goMachinery = () => {
    setActiveTab('machinery');
    router.push({ pathname: '/services', params: { tab: 'machinery' } });
  };

  return (
    <ScreenContainer tab>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={s.greet}>{greeting}, {farmer.name ? farmer.name.split(' ')[0] : 'Farmer'} 👋</Text>
          <Pressable onPress={fetchLiveGPS} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Text style={s.place}>📍 {displayLocation}</Text>
            <Text style={{ fontSize: 12, color: colors.primary, marginLeft: 6, fontWeight: '700' }}>[GPS Live]</Text>
          </Pressable>
        </View>
        <Pressable
          style={{ width: 44, height: 44, borderRadius: radius.full, backgroundColor: colors.surfaceVariant, alignItems: 'center', justifyContent: 'center' }}
          onPress={() => router.push('/notifications' as any)}
        >
          <Text style={{ fontSize: 20 }}>🔔</Text>
        </Pressable>
      </View>
      
      <SearchBar placeholder={t('searchPlaceholder')} onSubmit={handleSearch} />

      {/* Live Weather & Rain Prediction Window */}
      <Pressable style={s.weatherCard} onPress={() => router.push('/weather')}>
        {weatherLoading && !weather ? (
          <View style={{ flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="small" color="#FFF" />
            <Text style={{ color: '#FFF', fontSize: 12, marginTop: 6 }}>Loading live weather & rain report...</Text>
          </View>
        ) : weather ? (
          <>
            <View style={s.weatherLeft}>
              <Text style={{ fontSize: 32 }}>{weather.emoji}</Text>
              <Text style={s.weatherTemp}>{weather.temp}°C</Text>
              <Text style={s.weatherDesc}>{weather.condition}</Text>
              <View style={s.rainBadge}>
                <Text style={s.rainBadgeText}>🌧️ {weather.rainProbabilityToday}% Rain Today</Text>
              </View>
            </View>
            <View style={s.weatherRight}>
              <Text style={s.weatherHourlyHeader}>Hourly Forecast & Rain %</Text>
              <View style={s.hourlyRow}>
                {(weather.hourly || []).slice(0, 3).map((item, idx) => (
                  <View key={idx} style={s.weatherItem}>
                    <Text style={s.weatherTime}>{item.time}</Text>
                    <Text style={{ fontSize: 16 }}>{item.emoji}</Text>
                    <Text style={s.weatherVal}>{item.temp}°</Text>
                    <Text style={s.rainProbSub}>{item.rainProb}%</Text>
                  </View>
                ))}
              </View>
              <Text style={s.tapForDetails}>Tap for 7-day rain prediction →</Text>
            </View>
          </>
        ) : null}
      </Pressable>

      <View style={s.grid}>
        <ActionCard emoji="👨‍🌾" label={t('findLabour')} onPress={goLabour} />
        <ActionCard emoji="🚜" label={t('findMachinery')} onPress={goMachinery} />
        <ActionCard
          emoji="🛒"
          label={t('buyProducts')}
          onPress={() => router.push({ pathname: '/(tabs)/market', params: { mode: 'buy' } } as any)}
          tone="yellow"
        />
        <ActionCard
          emoji="🌾"
          label={t('sellCrops')}
          onPress={() => router.push({ pathname: '/(tabs)/market', params: { mode: 'sell' } } as any)}
          tone="yellow"
        />
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>{t('myFarm')}</Text>
        <Text style={s.cardLine}>
          {farm.cultivatedLand || 0} / {farm.totalLand || 0} {farm.landUnit || 'acres'} · {crops.length ? crops.map(cropLabel).join(', ') : 'No crops listed'}
        </Text>
      </View>

      {/* Nearby Labour */}
      {nearbyLabour.length > 0 && (
        <>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>{t('nearbyLabour')}</Text>
            <Pressable accessibilityRole="button" onPress={goLabour}>
              <Text style={s.seeAll}>{t('seeAll')} →</Text>
            </Pressable>
          </View>
          {nearbyLabour.map((l) => (
            <View key={l.id} style={{ marginBottom: 10 }}>
              <LabourCard
                labourer={l}
                onPress={() => router.push(`/services/labour/${l.id}`)}
                compact
              />
            </View>
          ))}
        </>
      )}

      {/* Nearby Machinery */}
      {nearbyMachinery.length > 0 && (
        <>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>{t('nearbyMachinery')}</Text>
            <Pressable accessibilityRole="button" onPress={goMachinery}>
              <Text style={s.seeAll}>{t('seeAll')} →</Text>
            </Pressable>
          </View>
          {nearbyMachinery.map((m) => (
            <View key={m.id} style={{ marginBottom: 10 }}>
              <MachineryCard
                machinery={m}
                onPress={() => router.push(`/services/machinery/${m.id}`)}
                compact
              />
            </View>
          ))}
        </>
      )}
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  greet: { fontSize: font.title, fontWeight: '800', color: colors.ink },
  place: { fontSize: font.body, color: colors.muted, fontWeight: '600' },
  weatherCard: { flexDirection: 'row', backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.md, ...shadow.card },
  weatherLeft: { flex: 1, borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.2)', paddingRight: spacing.sm },
  weatherTemp: { fontSize: 26, fontWeight: '800', color: '#FFF', marginVertical: 2 },
  weatherDesc: { fontSize: font.small, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  rainBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.xs, marginTop: 4, alignSelf: 'flex-start' },
  rainBadgeText: { fontSize: 10, color: '#FFF', fontWeight: '800' },
  weatherRight: { flex: 1.5, paddingLeft: spacing.md, justifyContent: 'space-between' },
  weatherHourlyHeader: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '700' },
  hourlyRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  weatherItem: { alignItems: 'center' },
  weatherTime: { fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  weatherVal: { fontSize: 12, color: '#FFF', fontWeight: '800' },
  rainProbSub: { fontSize: 9, color: '#BBDEFB', fontWeight: '700' },
  tapForDetails: { fontSize: 10, color: '#E8F5E9', fontWeight: '700', textDecorationLine: 'underline', marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: spacing.lg },
  card: { marginTop: spacing.lg, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, ...shadow.card },
  cardTitle: { fontSize: font.body, fontWeight: '800', color: colors.primaryDark },
  cardLine: { fontSize: font.body, color: colors.ink, marginTop: 6, lineHeight: 26 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.sm },
  sectionTitle: { fontSize: font.body, fontWeight: '800', color: colors.ink },
  seeAll: { fontSize: font.small, fontWeight: '600', color: colors.primary },
});
