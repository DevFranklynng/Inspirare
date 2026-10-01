import { useEffect } from "react";
import { Bell, CheckCheck, Inbox } from "lucide-react";
import { useNotificationStore } from "../stores/notificationStore";
import { useAuth } from "../context/AuthContext";
import NotificationList from "../components/notifications/NotificationList";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";

/**
 * The full notification inbox - the same rows as the bell's dropdown, without
 * the 8-item cap and with dismissal available.
 *
 * Reads from the store rather than fetching on mount, so arriving here from
 * the bell does not re-request what the dropdown already has.
 */
export default function Notifications() {
  const { isInstructor } = useAuth();

  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const status = useNotificationStore((s) => s.status);
  const error = useNotificationStore((s) => s.error);
  const loadNotifications = useNotificationStore((s) => s.loadNotifications);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const markRead = useNotificationStore((s) => s.markRead);
  const remove = useNotificationStore((s) => s.remove);

  useEffect(() => {
    // `silent` would suppress the loading state; this page has nothing to show
    // until the list arrives, so the full state machine is what we want.
    loadNotifications({ limit: 100 });
  }, [loadNotifications]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Notifications
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            {isInstructor
              ? "Submissions from your students and changes to your roster."
              : "Updates to your course, assignments, lessons, materials and classes."}
            {unreadCount > 0 && ` ${unreadCount} unread.`}
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="secondary" onClick={markAllRead} className="text-xs">
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl3 bg-white shadow-soft dark:bg-ink-900">
        {status === "loading" && notifications.length === 0 ? (
          <LoadingState label="Loading your notifications…" />
        ) : status === "error" && notifications.length === 0 ? (
          <ErrorState message={error} onRetry={() => loadNotifications({ limit: 100 })} />
        ) : (
          <NotificationList
            notifications={notifications}
            onOpen={markRead}
            onRemove={remove}
            emptyState={
              <div className="p-4">
                <EmptyState
                  icon={Inbox}
                  title="Nothing here yet"
                  description={
                    isInstructor
                      ? "When a student submits an assignment, or students are enrolled in or removed from your course, it will show up here."
                      : "When an assignment, lesson, material or class is added or changed, or a deadline is approaching, it will show up here."
                  }
                />
              </div>
            }
          />
        )}
      </div>

      {notifications.length > 0 && (
        <p className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <Bell className="h-3.5 w-3.5" />
          Showing the {notifications.length} most recent
          {notifications.length === 1 ? " notification" : " notifications"}.
        </p>
      )}
    </div>
  );
}
