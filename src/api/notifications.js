import { request } from "./client";

// The reader's own notification inbox. There is no id parameter anywhere in
// this module - every row the user can reach is scoped to them by the API, so
// the client never has to reason about whose notification it is acting on.

/**
 * Notifications newest first.
 * @param {{ limit?: number, unreadOnly?: boolean }} options
 */
export async function fetchNotifications({ limit = 20, unreadOnly = false } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (unreadOnly) params.set("unread_only", "true");

  const data = await request(`/notifications?${params.toString()}`);
  return data.notifications || [];
}

/** Unread badge count. Kept separate from the list so the poll is cheap. */
export async function fetchUnreadCount() {
  const data = await request("/notifications/unread-count");
  return data.count || 0;
}

export async function markNotificationRead(id) {
  const data = await request(`/notifications/${id}/read`, { method: "POST" });
  return data.notification;
}

export async function markAllNotificationsRead() {
  await request("/notifications/read-all", { method: "POST" });
}

export async function deleteNotification(id) {
  await request(`/notifications/${id}`, { method: "DELETE" });
}
