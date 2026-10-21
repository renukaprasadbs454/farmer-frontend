import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { ActionCard } from '../../src/components/ActionCard';
import { LabourCard } from '../../src/components/LabourCard';
import { MachineryCard } from '../../src/components/MachineryCard';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { SearchBar } from '../../src/components/SearchBar';
import { cropLabel } from '../../src/constants/crops';
import { colors, font, MAX_WIDTH, radius, spacing } from '../../src/constants/theme';
import { useLocationAndWeather } from '../../src/hooks/useLocationAndWeather';
import { useT } from '../../src/i18n';
import { labourService } from '../../src/services/labourService';
import { machineryService } from '../../src/services/machineryService';
import { useBookingStore } from '../../src/store/bookingStore';
import { useFarmerStore } from '../../src/store/farmerStore';
import { useNotificationStore } from '../../src/store/notificationStore';
import { useProductOrderStore } from '../../src/store/productOrderStore';
import { useServiceStore } from '../../src/store/serviceStore';
import { Labourer, Machinery } from '../../src/types';

type NearbyItem =
  | { type: 'labour'; item: Labourer }
  | { type: 'machinery'; item: Machinery };

type RecentOrder = {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  onPress: () => void;
  createdAt: string;
};

export default function Home() {
  const t = useT();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { farmer, farm, crops } = useFarmerStore();
  const { setActiveTab } = useServiceStore();
  const {
    location,
    weather,
    loading: weatherLoading,
    locationError,
    weatherError,
    fetchLiveGPS,
  } = useLocationAndWeather();
  const { bookings, fetchBookings } = useBookingStore();
  const { orders: productOrders, fetchOrders: fetchProductOrders } = useProductOrderStore();
  const { unreadCount } = useNotificationStore();

  const [nearbyLabour, setNearbyLabour] = useState<Labourer[]>([]);
  const [nearbyMachinery, setNearbyMachinery] = useState<Machinery[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(true);
  const [nearbyError, setNearbyError] = useState<string | null>(null);
  const [showHourly, setShowHourly] = useState(false);

  const farmerFirstName = farmer.name ? farmer.name.trim().split(' ')[0] : t('farmerFallback');
  const greeting = getGreeting(t);
  const displayLocation =
    location?.label || [farm.district || farm.taluk, farm.state].filter(Boolean).join(', ') || 'Location not added';
  const totalOrdersCount = (bookings?.length || 0) + (productOrders?.length || 0);
  const contentStyle = width > MAX_WIDTH + spacing.lg * 2 ? s.webContent : undefined;

  useEffect(() => {
    let mounted = true;

    async function loadHomeData() {
      setNearbyLoading(true);
      setNearbyError(null);
      try {
        const [labour, machinery] = await Promise.all([
          labourService.getNearbyLabourers(3),
          machineryService.getNearbyMachinery(3),
        ]);

        if (mounted) {
          setNearbyLabour(labour);
          setNearbyMachinery(machinery);
        }
      } catch (err) {
        if (mounted) {
          setNearbyError((err as Error)?.message || 'Could not load nearby services.');
        }
      } finally {
        if (mounted) {
          setNearbyLoading(false);
        }
      }
    }

    loadHomeData();
    fetchBookings();
    fetchProductOrders();

    return () => {
      mounted = false;
    };
  }, [fetchBookings, fetchProductOrders]);

  const nearbyItems = useMemo<NearbyItem[]>(
    () => [
      ...nearbyLabour.map((item) => ({ type: 'labour' as const, item })),
      ...nearbyMachinery.map((item) => ({ type: 'machinery' as const, item })),
    ],
    [nearbyLabour, nearbyMachinery],
  );

  const recentOrders = useMemo<RecentOrder[]>(() => {
    const serviceOrders: RecentOrder[] = bookings.map((booking) => ({
      id: `service-${booking.id}`,
      title: booking.labourerName || booking.machineryName || t('serviceBooking'),
      subtitle: `${t('serviceBooking')} · ${formatDate(booking.createdAt || booking.date)}`,
      status: t(booking.status as any) || booking.status,
      createdAt: booking.createdAt || booking.date,
      onPress: () => router.push(`/orders/${booking.id}` as any),
    }));

    const shopOrders: RecentOrder[] = productOrders.map((order) => ({
      id: `product-${order.id}`,
      title: order.items?.[0]?.productName || t('productOrder'),
      subtitle: `${t('productOrder')} · ${formatDate(order.orderDate)}`,
      status: order.status.replace(/_/g, ' '),
      createdAt: order.orderDate,
      onPress: () => router.push(`/market/order/${order.id}` as any),
    }));

    return [...serviceOrders, ...shopOrders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  }, [bookings, productOrders, router, t]);

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
    <ScreenContainer tab style={contentStyle}>
      <View style={s.header}>
        <View style={s.headerText}>
          <Text style={s.greeting} numberOfLines={1}>
            {greeting}, {farmerFirstName}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('changeLocation')}
            onPress={() => router.push('/edit-profile' as any)}
            style={({ pressed }) => [s.locationButton, pressed && s.pressed]}
          >
            <Text style={s.locationIcon}>📍</Text>
            <Text style={s.locationText} numberOfLines={1}>
              {displayLocation}
            </Text>
            <Text style={s.changeText}>{t('changeLocation')}</Text>
          </Pressable>
        </View>

        <View style={s.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('updateGps')}
            style={({ pressed }) => [s.iconButton, pressed && s.pressed]}
            onPress={fetchLiveGPS}
          >
            <Text style={s.iconButtonText}>⌖</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('viewOrders')}
            style={({ pressed }) => [s.iconButton, pressed && s.pressed]}
            onPress={() => router.push('/(tabs)/orders' as any)}
          >
            <Text style={s.iconButtonText}>□</Text>
            {totalOrdersCount > 0 && (
              <View style={s.badge}>
                <Text style={s.badgeText}>{totalOrdersCount > 9 ? '9+' : totalOrdersCount}</Text>
              </View>
            )}
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            style={({ pressed }) => [s.iconButton, pressed && s.pressed]}
            onPress={() => router.push('/notifications' as any)}
          >
            <Text style={s.iconButtonText}>◉</Text>
            {unreadCount > 0 && <View style={s.unreadDot} />}
          </Pressable>
        </View>
      </View>

      <View style={s.searchWrap}>
        <SearchBar placeholder={t('searchPlaceholder')} onSubmit={handleSearch} />
      </View>

      <WeatherSummary
        loading={weatherLoading}
        error={weatherError || locationError}
        weather={weather}
        showHourly={showHourly}
        onToggleHourly={() => setShowHourly((value) => !value)}
        onRetry={fetchLiveGPS}
        onOpenDetails={() => router.push('/weather')}
        t={t}
      />

      <View style={s.grid}>
        <ActionCard emoji="👨‍🌾" label={t('findLabour')} subtitle={t('workersFarmCrews')} tag={t('instant')} onPress={goLabour} />
        <ActionCard emoji="🚜" label={t('findMachinery')} subtitle={t('tractorsHarvesters')} tag={t('fleet')} onPress={goMachinery} />
        <ActionCard
          emoji="🛒"
          label={t('buyProducts')}
          subtitle={t('seedsFertilizersTools')}
          tag={t('store')}
          onPress={() => router.push({ pathname: '/(tabs)/market', params: { mode: 'products' } } as any)}
        />
        <ActionCard
          emoji="🌾"
          label={t('buyCropsDirect')}
          subtitle={t('directFromFarmers')}
          tag={t('directFarm')}
          onPress={() => router.push({ pathname: '/(tabs)/market', params: { mode: 'buy-crops' } } as any)}
        />
        <ActionCard
          emoji="₹"
          label={t('sellCrops')}
          subtitle={t('listHarvestMandi')}
          tag={t('bestPrice')}
          onPress={() => router.push({ pathname: '/(tabs)/market', params: { mode: 'sell-crops' } } as any)}
          tone="yellow"
          fullWidth
        />
      </View>

      {/* Agri Finance & Storage */}
      <View style={s.sectionBlock}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>💰 Agri Finance & Storage</Text>
        </View>
        <View style={s.grid}>
          <ActionCard
            emoji="🏦"
            label="Kisan Loans"
            subtitle="Crops & Land Credit"
            tag="KCC / Low EMI"
            onPress={() => router.push('/loans' as any)}
          />
          <ActionCard
            emoji="🛡️"
            label="Crop Insurance"
            subtitle="PMFBY & Weather Shield"
            tag="Subsidized"
            onPress={() => router.push('/insurance' as any)}
          />
          <ActionCard
            emoji="📈"
            label="Crop Invest"
            subtitle="Commodity Spot Market"
            tag="Trade Live"
            tone="yellow"
            onPress={() => router.push('/invest' as any)}
          />
          <ActionCard
            emoji="🏬"
            label="Warehouse Space"
            subtitle="Rent Cold Storage & Godown"
            tag="Daily/Monthly"
            tone="yellow"
            onPress={() => router.push('/warehouse' as any)}
          />
        </View>
      </View>

      <View style={s.card}>
        <View style={s.sectionHeader}>
          <Text style={s.cardTitle}>{t('farmOverview')}</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/myfarm')}>
            <Text style={s.linkText}>{t('details')} ›</Text>
          </Pressable>
        </View>
        <View style={s.farmStatsRow}>
          <View style={s.statBadge}>
            <Text style={s.statValue} numberOfLines={1}>
              {farm.cultivatedLand || 0} / {farm.totalLand || 0} {farm.landUnit || 'acres'}
            </Text>
            <Text style={s.statLabel}>{t('cultivatedLand')}</Text>
          </View>
          <View style={[s.statBadge, s.cropStat]}>
            <Text style={s.statValue} numberOfLines={1}>
              {crops.length ? crops.map(cropLabel).join(', ') : t('noCropsAdded')}
            </Text>
            <Text style={s.statLabel}>{t('activeCrops')}</Text>
          </View>
        </View>
      </View>

      {recentOrders.length > 0 && (
        <View style={s.sectionBlock}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>{t('recentOrders')}</Text>
            <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/orders' as any)}>
              <Text style={s.linkText}>{t('seeAll')} ›</Text>
            </Pressable>
          </View>
          <FlatList
            data={recentOrders}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => <RecentOrderRow item={item} />}
            ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          />
        </View>
      )}

      <View style={s.sectionBlock}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>{t('nearbyServices')}</Text>
          <Pressable accessibilityRole="button" onPress={goLabour}>
            <Text style={s.linkText}>{t('seeAll')} ›</Text>
          </Pressable>
        </View>
        {nearbyLoading ? (
          <InlineState label={t('loading')} loading />
        ) : nearbyError ? (
          <InlineState label={t('nearbyServicesError')} detail={nearbyError} />
        ) : nearbyItems.length === 0 ? (
          <InlineState label={t('noNearbyServices')} />
        ) : (
          <FlatList
            data={nearbyItems}
            keyExtractor={(entry) => `${entry.type}-${entry.item.id}`}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={s.nearbyItem}>
                {item.type === 'labour' ? (
                  <LabourCard labourer={item.item} onPress={() => router.push(`/services/labour/${item.item.id}`)} compact />
                ) : (
                  <MachineryCard machinery={item.item} onPress={() => router.push(`/services/machinery/${item.item.id}`)} compact />
                )}
              </View>
            )}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

function WeatherSummary({
  loading,
  error,
  weather,
  showHourly,
  onToggleHourly,
  onRetry,
  onOpenDetails,
  t,
}: {
  loading: boolean;
  error: string | null;
  weather: ReturnType<typeof useLocationAndWeather>['weather'];
  showHourly: boolean;
  onToggleHourly: () => void;
  onRetry: () => void;
  onOpenDetails: () => void;
  t: ReturnType<typeof useT>;
}) {
  return (
    <View style={s.weatherCard}>
      {loading && !weather ? (
        <InlineState label={t('weatherLoading')} loading />
      ) : weather ? (
        <>
          <View style={s.weatherTop}>
            <View style={s.weatherMain}>
              <Text style={s.weatherEmoji}>{weather.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.weatherTemp}>{weather.temp}°C</Text>
                <Text style={s.weatherCondition} numberOfLines={1}>
                  {weather.condition}
                </Text>
              </View>
            </View>
            <View style={s.rainPill}>
              <Text style={s.rainValue}>{weather.rainProbabilityToday}%</Text>
              <Text style={s.rainLabel}>{t('rainToday')}</Text>
            </View>
          </View>

          {showHourly && (
            <FlatList
              horizontal
              data={(weather.hourly || []).slice(0, 6)}
              keyExtractor={(item, index) => `${item.time}-${index}`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.hourlyList}
              renderItem={({ item }) => (
                <View style={s.hourlyItem}>
                  <Text style={s.hourlyTime}>{item.time}</Text>
                  <Text style={s.hourlyEmoji}>{item.emoji}</Text>
                  <Text style={s.hourlyTemp}>{item.temp}°</Text>
                  <Text style={s.hourlyRain}>{item.rainProb}%</Text>
                </View>
              )}
            />
          )}

          <View style={s.weatherActions}>
            <Pressable accessibilityRole="button" onPress={onToggleHourly} style={s.textButton}>
              <Text style={s.textButtonLabel}>{showHourly ? t('hideHourly') : t('showHourly')}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onOpenDetails} style={s.textButton}>
              <Text style={s.textButtonLabel}>{t('viewFullForecast')} ›</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <View style={s.errorRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.errorTitle}>{t('weatherUnavailable')}</Text>
            {!!error && <Text style={s.errorText}>{error}</Text>}
          </View>
          <Pressable accessibilityRole="button" onPress={onRetry} style={s.retryButton}>
            <Text style={s.retryButtonText}>{t('retry')}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function InlineState({ label, detail, loading }: { label: string; detail?: string; loading?: boolean }) {
  return (
    <View style={s.inlineState}>
      {loading && <ActivityIndicator size="small" color={colors.primary} />}
      <View style={{ flex: 1 }}>
        <Text style={s.inlineStateLabel}>{label}</Text>
        {!!detail && <Text style={s.inlineStateDetail}>{detail}</Text>}
      </View>
    </View>
  );
}

function RecentOrderRow({ item }: { item: RecentOrder }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.title}
      onPress={item.onPress}
      style={({ pressed }) => [s.orderRow, pressed && s.pressed]}
    >
      <View style={{ flex: 1 }}>
        <Text style={s.orderTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={s.orderSubtitle} numberOfLines={1}>
          {item.subtitle}
        </Text>
      </View>
      <Text style={s.orderStatus} numberOfLines={1}>
        {item.status}
      </Text>
    </Pressable>
  );
}

function getGreeting(t: ReturnType<typeof useT>) {
  const hour = new Date().getHours();
  if (hour < 12) return t('goodMorning');
  if (hour < 17) return t('goodAfternoon');
  return t('goodEvening');
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const s = StyleSheet.create({
  webContent: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.ink,
  },
  locationButton: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
    paddingRight: spacing.sm,
  },
  locationIcon: {
    fontSize: 14,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: colors.muted,
    fontWeight: '700',
  },
  changeText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: {
    fontSize: 19,
    color: colors.primary,
    fontWeight: '800',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: colors.danger,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.surface,
  },
  unreadDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  searchWrap: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  weatherCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  weatherTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  weatherMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
  },
  weatherEmoji: {
    fontSize: 34,
  },
  weatherTemp: {
    fontSize: 24,
    color: colors.ink,
    fontWeight: '900',
  },
  weatherCondition: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: '700',
  },
  rainPill: {
    minWidth: 86,
    minHeight: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  rainValue: {
    color: colors.primary,
    fontWeight: '900',
    fontSize: 18,
  },
  rainLabel: {
    color: colors.muted,
    fontWeight: '700',
    fontSize: 11,
  },
  hourlyList: {
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  hourlyItem: {
    width: 74,
    borderRadius: radius.sm,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  hourlyTime: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '700',
  },
  hourlyEmoji: {
    fontSize: 20,
    marginVertical: 2,
  },
  hourlyTemp: {
    fontSize: 14,
    color: colors.ink,
    fontWeight: '800',
  },
  hourlyRain: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '800',
  },
  weatherActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  textButton: {
    minHeight: 40,
    justifyContent: 'center',
  },
  textButtonLabel: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  errorTitle: {
    color: colors.ink,
    fontWeight: '800',
    fontSize: 14,
  },
  errorText: {
    color: colors.muted,
    marginTop: 2,
    fontSize: 12,
  },
  retryButton: {
    minHeight: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  retryButtonText: {
    color: colors.primary,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: spacing.md,
  },
  card: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionBlock: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.ink,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.ink,
  },
  linkText: {
    fontSize: font.small,
    fontWeight: '800',
    color: colors.primary,
  },
  farmStatsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statBadge: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 68,
  },
  cropStat: {
    flex: 1.35,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.ink,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '700',
  },
  orderRow: {
    minHeight: 62,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  orderTitle: {
    color: colors.ink,
    fontWeight: '800',
    fontSize: 14,
  },
  orderSubtitle: {
    color: colors.muted,
    fontWeight: '600',
    fontSize: 12,
    marginTop: 2,
  },
  orderStatus: {
    maxWidth: 110,
    color: colors.primary,
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  nearbyItem: {
    marginBottom: spacing.sm,
  },
  inlineState: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inlineStateLabel: {
    color: colors.ink,
    fontWeight: '800',
    fontSize: 14,
  },
  inlineStateDetail: {
    color: colors.muted,
    marginTop: 2,
    fontSize: 12,
  },
  pressed: {
    opacity: 0.78,
  },
});
