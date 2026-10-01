import { create } from "zustand";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification
} from "../api/notifications";
import { ApiError } from "../api/client";

/**
 * Notification state for the whole app.
 *
 * The bell and the notifications page both read from here rather than fetching
 * independently, so opening the page does not re-request what the badge
 * already knows.
 *
 * Polling: the app has no realtime transport, so `startPolling` refreshes the
 * unread count on an interval while a user is signed in. Only the count is
 * polled, not the list - pulling every row every minute would be wasteful, and
 * a new notification is visible as soon as the user opens the bell or the
 * page. Each call clears its own interval, so a sign-out mid-session cannot
 * leave a timer running against a dead token.
 */

const POLL_INTERVAL_MS = 60_000;

let pollTimer = null;
let pollInFlight = false;

function unreadCountFrom(items) {
  return items.filter((n) => !n.read_at).length;
}

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  // "idle" until something has loaded, so the bell can stay quiet rather than
  // flashing an empty state on first paint.
  status: "idle", // idle | loading | success | error
  error: null,
  lastCheckedAt: null,

  /** Full list for the inbox page and the bell's dropdown. */
  loadNotifications: async ({ limit = 20, silent = false } = {}) => {
    if (!silent) set({ status: "loading", error: null });
    try {
      const notifications = await fetchNotifications({ limit });
      set({
        notifications,
        unreadCount: unreadCountFrom(notifications),
        status: "success",
        error: null,
        lastCheckedAt: new Date().toISOString()
      });
    } catch (err) {
      // A failed refresh should not blank an inbox the user is already
      // reading, so the previous list is left in place.
      set({
        status: "error",
        error: err instanceof ApiError ? err.message : "We couldn't load your notifications."
      });
    }
  },

  /**
   * Cheap poll used by the interval. Never flips the page into a loading or
   * error state, because it runs with no user interaction to explain it.
   */
  refreshUnreadCount: async () => {
    if (pollInFlight) return;
    pollInFlight = true;
    try {
      const count = await fetchUnreadCount();
      set({ unreadCount: count, lastCheckedAt: new Date().toISOString() });
    } catch {
      // Offline or signed out. The next tick will pick it back up; there is
      // nothing useful to show the user for a background count.
    } finally {
      pollInFlight = false;
    }
  },

  /** Optimistic: flips the row locally, then confirms with the API. */
  markRead: async (id) => {
    const target = get().notifications.find((n) => n.id === id);
    if (!target || target.read_at) return;

    const readAt = new Date().toISOString();
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read_at: readAt } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1)
    }));

    try {
      await markNotificationRead(id);
    } catch {
      // Roll back so the badge cannot drift away from the server.
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read_at: target.read_at } : n
        ),
        unreadCount: unreadCountFrom(state.notifications)
      }));
    }
  },

  markAllRead: async () => {
    const readAt = new Date().toISOString();
    const previous = get().notifications;

    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read_at: n.read_at || readAt })),
      unreadCount: 0
    }));

    try {
      await markAllNotificationsRead();
    } catch {
      set({ notifications: previous, unreadCount: unreadCountFrom(previous) });
    }
  },

  remove: async (id) => {
    const previous = get().notifications;
    const next = previous.filter((n) => n.id !== id);

    set({ notifications: next, unreadCount: unreadCountFrom(next) });

    try {
      await deleteNotification(id);
    } catch {
      set({ notifications: previous, unreadCount: unreadCountFrom(previous) });
    }
  },

  /** Idempotent - calling it twice does not create two intervals. */
  startPolling: () => {
    if (pollTimer) return;
    get().refreshUnreadCount();
    pollTimer = setInterval(() => get().refreshUnreadCount(), POLL_INTERVAL_MS);
  },

  stopPolling: () => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  },

  /** Called on sign-out so the next user never sees the previous one's inbox. */
  reset: () => {
    get().stopPolling();
    set({
      notifications: [],
      unreadCount: 0,
      status: "idle",
      error: null,
      lastCheckedAt: null
    });
  }
}));

export { POLL_INTERVAL_MS };
