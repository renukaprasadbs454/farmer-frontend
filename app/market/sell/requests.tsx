import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../../src/components/EmptyState';
import { colors, font, radius, shadow, spacing } from '../../../src/constants/theme';
import { useT } from '../../../src/i18n';
import { useCropMarketplaceStore } from '../../../src/store/cropMarketplaceStore';

export default function BuyerRequestsScreen() {
  const t = useT();
  const router = useRouter();
  const { requests, fetchRequests } = useCropMarketplaceStore();

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← {t('back')}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t('buyerRequests')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {requests.length === 0 ? (
        <EmptyState
          emoji="🔔"
          title={t('noRequests')}
          message={t('noRequestsMsg')}
        />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(r) => r.id}
          contentContainerStyle={{ padding: spacing.m }}
          renderItem={({ item: r }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push('/market/sell' as any)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cropTitle}>{r.cropName}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{r.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.buyerName}>Buyer: {r.buyer.name}</Text>
              <Text style={styles.details}>
                {r.requestedQuantity} {r.unit} @ ₹{r.offerPrice}/{r.unit} = ₹{r.totalEstimatedAmount}
              </Text>
            </Pressable>
          )}
        />
      )}
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    padding: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cropTitle: { fontFamily: font.bold, fontSize: 16, color: colors.textPrimary },
  badge: { backgroundColor: colors.surfaceVariant, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.xs },
  badgeText: { fontFamily: font.bold, fontSize: 10, color: colors.textPrimary },
  buyerName: { fontFamily: font.medium, fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  details: { fontFamily: font.bold, fontSize: 14, color: colors.primary, marginTop: 4 },
});
