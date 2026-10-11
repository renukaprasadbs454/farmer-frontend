import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../src/components/ScreenContainer';
import { colors, font, radius, shadow, spacing } from '../src/constants/theme';
import { useLocationAndWeather } from '../src/hooks/useLocationAndWeather';
import { useT } from '../src/i18n';

export default function WeatherScreen() {
  const t = useT();
  const router = useRouter();
  const { location, weather, loading, fetchLiveGPS, permissionGranted } = useLocationAndWeather();

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Text style={{ fontSize: 18, color: colors.primaryDark }}>←</Text>
        </Pressable>
        <Text style={s.title}>{t('weatherAndRain') || 'Weather & Rain Forecast'}</Text>
        <Pressable onPress={fetchLiveGPS} style={s.refreshBtn}>
          <Text style={{ fontSize: 16 }}>📍</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Live Location Card */}
        <View style={s.locationCard}>
          <View style={{ flex: 1 }}>
            <Text style={s.locLabel}>CURRENT LOCATION</Text>
            <Text style={s.locValue}>📍 {location?.label || 'Karnataka, India'}</Text>
            <Text style={s.coords}>
              Lat: {location?.latitude?.toFixed(4)}, Lng: {location?.longitude?.toFixed(4)}
            </Text>
          </View>
          <Pressable style={s.gpsBtn} onPress={fetchLiveGPS}>
            <Text style={s.gpsBtnText}>
              {permissionGranted ? '🔄 Update GPS' : '🎯 Enable Live GPS'}
            </Text>
          </Pressable>
        </View>

        {loading && !weather ? (
          <View style={s.loaderBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ marginTop: 12, color: colors.muted }}>Fetching live satellite weather report...</Text>
          </View>
        ) : weather ? (
          <>
            {/* Main Weather Card */}
            <View style={s.mainWeatherCard}>
              <View style={s.weatherHeader}>
                <View>
                  <Text style={s.weatherTemp}>{weather.temp}°C</Text>
                  <Text style={s.weatherCond}>{weather.condition}</Text>
                </View>
                <Text style={{ fontSize: 56 }}>{weather.emoji}</Text>
              </View>

              <View style={s.statsGrid}>
                <View style={s.statItem}>
                  <Text style={s.statEmoji}>🌧️</Text>
                  <Text style={s.statVal}>{weather.rainProbabilityToday}%</Text>

                  <Text style={s.statLab}>Rain Chance</Text>
                </View>
                <View style={s.statItem}>
                  <Text style={s.statEmoji}>💧</Text>
                  <Text style={s.statVal}>{weather.humidity}%</Text>
                  <Text style={s.statLab}>Humidity</Text>
                </View>
                <View style={s.statItem}>
                  <Text style={s.statEmoji}>💨</Text>
                  <Text style={s.statVal}>{weather.windSpeed} km/h</Text>
                  <Text style={s.statLab}>Wind Speed</Text>
                </View>
              </View>
            </View>

            {/* Farm Advisory Banner */}
            <View style={s.advisoryCard}>
              <Text style={s.advisoryTitle}>📢 Farmer Advisory</Text>
              <Text style={s.advisoryText}>{weather.advisory}</Text>
            </View>

            {/* Hourly Rain Forecast */}
            <Text style={s.sectionTitle}>⏱️ Hourly Rain & Temperature</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {weather.hourly.map((h, i) => (
                  <View key={i} style={s.hourlyCard}>
                    <Text style={s.hourlyTime}>{h.time}</Text>
                    <Text style={{ fontSize: 24, marginVertical: 4 }}>{h.emoji}</Text>
                    <Text style={s.hourlyTemp}>{h.temp}°C</Text>
                    <View style={s.rainBadge}>
                      <Text style={s.rainText}>🌧️ {h.rainProb}%</Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* 7-Day Rain Prediction & Outlook */}
            <Text style={s.sectionTitle}>📅 7-Day Weather & Rain Prediction</Text>
            <View style={s.dailyList}>
              {weather.daily.map((d, i) => (
                <View key={i} style={s.dailyRow}>
                  <Text style={s.dailyDay}>{d.day}</Text>
                  <Text style={{ fontSize: 22 }}>{d.emoji}</Text>
                  <Text style={s.dailyCond}>{d.condition}</Text>
                  <View style={s.dailyRainBox}>
                    <Text style={s.dailyRainText}>💧 {d.rainProb}% Rain</Text>
                  </View>
                  <Text style={s.dailyTemp}>
                    {d.maxTemp}° / <Text style={{ color: colors.muted }}>{d.minTemp}°</Text>
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  backBtn: { width: 36, height: 36, borderRadius: radius.full, backgroundColor: colors.surfaceVariant, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: font.title, fontWeight: '800', color: colors.ink },
  refreshBtn: { width: 36, height: 36, borderRadius: radius.full, backgroundColor: colors.surfaceVariant, alignItems: 'center', justifyContent: 'center' },
  locationCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#E8F5E9', padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.md },
  locLabel: { fontSize: 10, fontWeight: '800', color: colors.primaryDark, letterSpacing: 0.5 },
  locValue: { fontSize: font.body, fontWeight: '700', color: colors.ink, marginTop: 2 },
  coords: { fontSize: 11, color: colors.muted, marginTop: 2 },
  gpsBtn: { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.sm },
  gpsBtnText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  loaderBox: { padding: 40, alignItems: 'center' },
  mainWeatherCard: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg, color: '#FFF', ...shadow.card },
  weatherHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  weatherTemp: { fontSize: 44, fontWeight: '900', color: '#FFF' },
  weatherCond: { fontSize: font.subtitle, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md },
  statItem: { alignItems: 'center' },
  statEmoji: { fontSize: 18 },
  statVal: { fontSize: font.body, fontWeight: '800', color: '#FFF', marginTop: 2 },
  statLab: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  advisoryCard: { backgroundColor: '#FFF3E0', padding: spacing.md, borderRadius: radius.md, marginTop: spacing.md, borderWidth: 1, borderColor: '#FFE0B2' },
  advisoryTitle: { fontSize: font.body, fontWeight: '800', color: '#E65100' },
  advisoryText: { fontSize: font.body, color: '#BF360C', marginTop: 4, lineHeight: 20 },
  sectionTitle: { fontSize: font.subtitle, fontWeight: '800', color: colors.ink, marginTop: spacing.lg, marginBottom: spacing.xs },
  hourlyCard: { backgroundColor: colors.card, padding: spacing.md, borderRadius: radius.md, alignItems: 'center', width: 85, ...shadow.card },
  hourlyTime: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  hourlyTemp: { fontSize: font.body, fontWeight: '800', color: colors.ink },
  rainBadge: { backgroundColor: '#E3F2FD', paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.xs, marginTop: 4 },
  rainText: { fontSize: 10, color: '#1565C0', fontWeight: '700' },
  dailyList: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.sm, marginTop: spacing.xs, ...shadow.card },
  dailyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  dailyDay: { width: 70, fontSize: font.body, fontWeight: '700', color: colors.ink },
  dailyCond: { flex: 1, fontSize: font.small, color: colors.muted, marginLeft: 8 },
  dailyRainBox: { backgroundColor: '#E3F2FD', paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.xs, marginRight: 8 },
  dailyRainText: { fontSize: 11, color: '#1976D2', fontWeight: '700' },
  dailyTemp: { fontSize: font.body, fontWeight: '700', color: colors.ink },
});
