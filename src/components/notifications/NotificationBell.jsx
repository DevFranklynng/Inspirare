import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { useNotificationStore } from "../../stores/notificationStore";
import { useAuth } from "../../context/AuthContext";
import NotificationList from "./NotificationList";
import EmptyState from "../ui/EmptyState";

/**
 * The notification bell: unread count plus a dropdown of recent items.
 *
 * This is the app's first dropdown, so it establishes the pattern for the
 * others: click-outside via a `mousedown` listener on the document, Escape to
 * close, and focus moved into the panel on open so the keyboard is not stranded
 * on the button behind the overlay.
 *
 * Only the unread COUNT is polled (see notificationStore). Opening the panel
 * fetches the rows, so an idle session does not pull the whole inbox every
 * minute.
 */

/**
 * Positioning of the panel, split from the panel's own classes on purpose.
 *
 * On a phone the panel is centred against the VIEWPORT, not against the bell.
 * The bell sits hard against the right edge of the topbar, so a right-anchored
 * panel had its left edge off-screen on narrow viewports and no way to reach
 * the overflow. On sm and up it returns to anchoring to the bell, which is what
 * a dropdown should do next to its trigger.
 *
 * That only works if the bell's wrapper is NOT a containing block on phones,
 * otherwise `left-1/2` resolves against the bell and the panel overflows the
 * right edge. Hence `sm:relative` on the wrapper below, not plain `relative`.
 *
 * `-translate-x-1/2` here and the `transform` inside the slideDown keyframe
 * would otherwise collide: the keyframe's 100% is `transform: none`, and with
 * `both` fill that would win and drop the centring. Hence the wrapper.
 */
const PANEL_POSITION_CLASS =
  "absolute z-50 mt-2 left-1/2 w-[calc(100vw-1.5rem)] -translate-x-1/2 " +
  "sm:left-auto sm:right-0 sm:w-[22rem] sm:max-w-[calc(100vw-2rem)] sm:translate-x-0";

/**
 * The panel's own box. Height is bounded by the viewport rather than a fixed
 * 24rem, so on a short or landscape phone the list scrolls inside the panel
 * instead of running off the bottom of the screen where it cannot be reached.
 * `dvh` rather than `vh` because mobile browser chrome changes `vh` mid-scroll.
 */
const PANEL_BOX_CLASS =
  "flex max-h-[calc(100dvh-4.5rem)] flex-col overflow-hidden rounded-2xl border " +
  "border-slate-100 bg-white shadow-panel outline-none " +
  "animate-slide-down sm:animate-none " +
  "dark:border-ink-700 dark:bg-ink-900";

export default function NotificationBell() {
  const { isAdmin, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const containerRef = useRef(null);
  const panelRef = useRef(null);

  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const notifications = useNotificationStore((s) => s.notifications);
  const status = useNotificationStore((s) => s.status);
  const loadNotifications = useNotificationStore((s) => s.loadNotifications);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);

  const close = useCallback(() => setOpen(false), []);

  // Fetch the rows the first time the panel is opened, and refetch on every
  // subsequent open so it is never a stale cache of the inbox.
  const handleToggle = useCallback(async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      await loadNotifications({ limit: 8, silent: true });
      setHasLoaded(true);
    }
  }, [open, loadNotifications]);

  // Mark a notification read when it is followed from the dropdown.
  const handleOpenItem = useCallback(
    (notification) => {
      markRead(notification.id);
      close();
    },
    [markRead, close]
  );

  // Click outside closes. `mousedown` rather than `click` so the panel closes
  // before the click lands on whatever is underneath it.
  useEffect(() => {
    if (!open) return undefined;

    function onPointerDown(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        close();
      }
    }
    function onKeyDown(event) {
      if (event.key === "Escape") close();
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  // Move focus into the panel when it opens so Escape and Tab work from the
  // first keypress, and hand it back to the button when it closes.
  useEffect(() => {
    if (!open || !panelRef.current) return;
    panelRef.current.focus();
  }, [open]);

  const isLoading = status === "loading" && !hasLoaded;

  // Admins have no bell in their own header and receive no notifications, so
  // the component renders nothing for them rather than an empty panel that can
  // never fill. This is deliberately after every hook: returning early above
  // one would change the hook count between a student's session and an
  // admin's.
  if (!isAuthenticated || isAdmin) return null;

  return (
    <div className="sm:relative" ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={open}
        aria-haspopup="dialog"
        className="relative rounded-full bg-white p-2.5 text-slate-400 shadow-soft hover:text-brand-600 dark:bg-ink-900 dark:text-slate-400 dark:hover:text-brand-300"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white shadow-soft">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={PANEL_POSITION_CLASS}>
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Notifications"
            tabIndex={-1}
            className={PANEL_BOX_CLASS}
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 dark:border-ink-700">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Notifications
              </p>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-500/10"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain max-h-[55dvh] sm:max-h-[24rem]">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400 dark:text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading notifications…
                </div>
              ) : (
                <NotificationList
                  notifications={notifications}
                  onOpen={handleOpenItem}
                  compact
                  emptyState={
                    <div className="p-4">
                      <EmptyState
                        icon={Bell}
                        title="You're all caught up"
                        description="New assignments, lessons, materials and class changes will show up here."
                      />
                    </div>
                  }
                />
              )}
            </div>

            <div className="border-t border-slate-100 px-4 py-2.5 dark:border-ink-700">
              <Link
                to="/notifications"
                onClick={close}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
              >
                View all notifications
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
