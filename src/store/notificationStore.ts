import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AppNotification, NotificationSettings, NotificationType } from '../types';

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  settings: NotificationSettings;

  addNotification: (
    type: NotificationType,
    title: string,
    message: string,
    relatedEntityId?: string,
    targetRoute?: string,
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  toggleSetting: (key: keyof NotificationSettings) => void;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  bookingUpdates: true,
  orderUpdates: true,
  buyerRequests: true,
  cropSales: true,
  marketplaceUpdates: true,
  promotional: false,
};

const INITIAL_NOTIFICATIONS: AppNotification[] = [];

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: INITIAL_NOTIFICATIONS,
      unreadCount: 0,
      settings: DEFAULT_SETTINGS,

      addNotification: (type, title, message, relatedEntityId, targetRoute) => {
        const newNotif: AppNotification = {
          id: `NOTIF-${Date.now()}`,
          type,
          title,
          message,
          createdAt: new Date().toISOString(),
          read: false,
          relatedEntityId,
          targetRoute,
        };

        set((s) => {
          const updated = [newNotif, ...s.notifications];
          return {
            notifications: updated,
            unreadCount: updated.filter((n) => !n.read).length,
          };
        });
      },

      markAsRead: (id) => {
        set((s) => {
          const updated = s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          );
          return {
            notifications: updated,
            unreadCount: updated.filter((n) => !n.read).length,
          };
        });
      },

      markAllAsRead: () => {
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
      },

      toggleSetting: (key) => {
        set((s) => ({
          settings: { ...s.settings, [key]: !s.settings[key] },
        }));
      },
    }),
    {
      name: 'fm-notifications',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        notifications: s.notifications,
        settings: s.settings,
      }),
    },
  ),
);
