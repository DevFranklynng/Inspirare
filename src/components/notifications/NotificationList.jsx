import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { getNotificationMeta, TONE_CLASSES } from "./notificationMeta";
import { formatRelativeTime, formatAbsoluteTimestamp } from "../../utils/datetime";

/**
 * One notification row.
 *
 * A row with a `link` is a real link, so it is keyboard-reachable and
 * middle-clickable like any other navigation. A row without one (an
 * announcement with no destination, say) is rendered as a plain div instead of
 * a dead link.
 */
function NotificationRow({ notification, onOpen, onRemove, compact = false }) {
  const { icon: Icon, tone, label } = getNotificationMeta(notification.type);
  const isUnread = !notification.read_at;
  const timestamp = formatRelativeTime(notification.created_at);

  const body = (
    <>
      <span
        className={`flex shrink-0 items-center justify-center rounded-full ${
          compact ? "h-8 w-8" : "h-9 w-9"
        } ${TONE_CLASSES[tone]}`}
      >
        <Icon className={compact ? "h-4 w-4" : "h-5 w-5"} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span
            className={`truncate text-sm ${
              isUnread
                ? "font-semibold text-slate-900 dark:text-slate-100"
                : "font-medium text-slate-700 dark:text-slate-300"
            }`}
          >
            {notification.title}
          </span>
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:bg-ink-700 dark:text-slate-400">
            {label}
          </span>
        </span>

        {notification.body && (
          <span
            className={`mt-0.5 block text-xs leading-relaxed text-slate-500 dark:text-slate-400 ${
              compact ? "line-clamp-2" : ""
            }`}
          >
            {notification.body}
          </span>
        )}

        {timestamp && (
          <span
            className="mt-1 block text-[11px] text-slate-400 dark:text-slate-500"
            title={formatAbsoluteTimestamp(notification.created_at) || undefined}
          >
            {timestamp}
          </span>
        )}
      </span>

      {isUnread && (
        <span
          className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500"
          aria-label="Unread"
        />
      )}
    </>
  );

  const rowClass = `flex w-full items-start gap-3 text-left transition-colors ${
    compact ? "px-4 py-3" : "px-4 py-4"
  } ${
    isUnread
      ? "bg-brand-50/40 hover:bg-brand-50/70 dark:bg-brand-500/5 dark:hover:bg-brand-500/10"
      : "hover:bg-slate-50 dark:hover:bg-ink-800/60"
  }`;

  return (
    <div className="group relative flex items-start">
      {notification.link ? (
        <Link
          to={notification.link}
          onClick={() => onOpen?.(notification)}
          className={rowClass}
          aria-label={`${notification.title}${notification.body ? `. ${notification.body}` : ""}`}
        >
          {body}
        </Link>
      ) : (
        <div className={rowClass}>{body}</div>
      )}

      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(notification.id)}
          aria-label={`Dismiss "${notification.title}"`}
          className="absolute right-2 top-2 rounded-lg p-1.5 text-slate-300 opacity-0 transition hover:bg-slate-100 hover:text-red-500 focus:opacity-100 dark:text-ink-500 dark:hover:bg-ink-700"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export default function NotificationList({
  notifications,
  onOpen,
  onRemove,
  compact = false,
  emptyState,
}) {
  if (notifications.length === 0) {
    return emptyState || null;
  }

  return (
    <ul className="divide-y divide-slate-100 dark:divide-ink-700">
      {notifications.map((n) => (
        <li key={n.id}>
          <NotificationRow
            notification={n}
            onOpen={onOpen}
            onRemove={onRemove}
            compact={compact}
          />
        </li>
      ))}
    </ul>
  );
}
