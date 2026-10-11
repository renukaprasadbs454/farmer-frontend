import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../src/components/EmptyState';
import { colors, font, radius, shadow, spacing } from '../src/constants/theme';
import { useT } from '../src/i18n';
import { useNotificationStore } from '../src/store/notificationStore';
import { AppNotification } from '../src/types';

export default function NotificationsScreen() {
  const t = useT();
  const router = useRouter();

  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotificationStore();

  const handleNotificationPress = (item: AppNotification) => {
    markAsRead(item.id);
    if (item.targetRoute) {
      router.push(item.targetRoute as any);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← {t('back')}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>🔔 Notifications</Text>

        <Pressable onPress={markAllAsRead}>
          <Text style={styles.markAllText}>Read All</Text>
        </Pressable>
      </View>

      {notifications.length === 0 ? (
        <EmptyState
          emoji="🔔"
          title="No Notifications"
          message="Important updates about your bookings, product orders, and crop buyer requests will appear here."
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(n) => n.id}
          contentContainerStyle={{ padding: spacing.m }}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.card, !item.read && styles.unreadCard]}
              onPress={() => handleNotificationPress(item)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.title}
                </Text>
                {!item.read && <View style={styles.unreadDot} />}
              </View>

              <Text style={styles.message}>{item.message}</Text>

              <Text style={styles.timeText}>
                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
  markAllText: { fontFamily: font.bold, color: colors.primary, fontSize: 13 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    padding: spacing.m,
    marginBottom: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  unreadCard: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: font.bold,
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    marginLeft: spacing.xs,
  },
  message: {
    fontFamily: font.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginVertical: 4,
    lineHeight: 18,
  },
  timeText: {
    fontFamily: font.regular,
    fontSize: 11,
    color: colors.textMuted,
    alignSelf: 'flex-end',
  },
});
