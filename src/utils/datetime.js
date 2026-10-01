// Shared date/time helpers. Everything here relies on the browser's Date
// parsing/formatting so timestamps are always shown in the viewer's local
// timezone — never adjust or re-derive the raw ISO strings the API returns.

function isSameCalendarDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * "Today", "Tomorrow", "Yesterday", or a short date like "Mon, Sep 28"
 * (with year appended when it isn't the current year).
 */
export function formatDateLabel(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (isSameCalendarDay(date, today)) return "Today";
  if (isSameCalendarDay(date, tomorrow)) return "Tomorrow";
  if (isSameCalendarDay(date, yesterday)) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function formatTime(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

/** "Today · 10:00 AM – 11:30 AM" (end omitted if not provided). */
export function formatSessionSummary(startsAt, endsAt) {
  const dateLabel = formatDateLabel(startsAt);
  const startTime = formatTime(startsAt);
  if (!dateLabel || !startTime) return "Unknown date";
  const endTime = endsAt ? formatTime(endsAt) : null;
  return endTime ? `${dateLabel} · ${startTime} – ${endTime}` : `${dateLabel} · ${startTime}`;
}

/**
 * Where a session falls relative to now: "live" (happening now), "today"
 * (later today), "past", or "upcoming". Sessions with no ends_at are
 * assumed to run an hour so they don't linger as "live" indefinitely.
 */
export function getSessionStatus(startsAt, endsAt) {
  const start = new Date(startsAt);
  if (Number.isNaN(start.getTime())) return "upcoming";
  const end = endsAt ? new Date(endsAt) : new Date(start.getTime() + 60 * 60 * 1000);
  const now = new Date();

  if (now > end) return "past";
  if (now >= start && now <= end) return "live";
  if (isSameCalendarDay(start, now)) return "today";
  return "upcoming";
}

/** Due-date label for assignments, with an "Overdue" flag. */
export function formatDueLabel(dateStr) {
  if (!dateStr) return { label: "No due date", overdue: false };
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return { label: "No due date", overdue: false };
  const dateLabel = formatDateLabel(dateStr);
  const time = formatTime(dateStr);
  const overdue = date.getTime() < Date.now();
  return { label: time ? `${dateLabel} · ${time}` : dateLabel, overdue };
}

/** ISO created_at -> a short "added" label, e.g. "Added Sep 20". */
export function formatAddedLabel(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return null;
  return `Added ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

/**
 * Coarse "time ago" for notification rows: "Just now", "5m ago", "3h ago",
 * "2d ago", then an absolute date past a week ("Sep 20").
 *
 * Deliberately coarse. A precise "2 minutes 14 seconds ago" in a list that
 * re-renders on a poll invites the reader to distrust the number the instant
 * it ticks over, and nothing here needs that precision - the absolute date is
 * always available as a tooltip.
 */
export function formatRelativeTime(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return null;

  const seconds = Math.round((Date.now() - date.getTime()) / 1000);

  // A clock skew that puts the timestamp in the future reads better as
  // "Just now" than as a negative age.
  if (seconds < 45) return "Just now";

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

/** The full local timestamp, for a title/tooltip on a relative label. */
export function formatAbsoluteTimestamp(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
