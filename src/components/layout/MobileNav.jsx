import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutGrid, LogOut, Moon, Sun, X } from "lucide-react";
import Avatar from "../ui/Avatar";
import { isItemActive } from "./navConfig";

// Phone navigation (below md). Replaces the old hamburger drawer.
//
// Layout: up to four tabs (items flagged `primary` in navConfig) plus a fifth
// "More" tab that opens a bottom sheet with everything else, the theme switch
// and log out. Nothing reachable from the desktop rail is lost.
//
// The signature detail is the raised bubble. The tab that is current has no
// icon of its own; instead one circular bubble floats above the bar and
// glides to it, while a matching circular bite is masked out of the bar's top
// edge (.mobile-nav-surface in index.css). Bubble and bite share one easing
// curve and one position expression so they travel together.

const BAR_PAD = 12; // px of inner horizontal padding on the bar
const SLOT_COUNT_MAX = 5;

// Centre of slot `i` out of `n`, as a CSS length valid for both `left` and the
// mask position. Slots are equal-width inside the padded bar.
function slotCenter(i, n) {
  const fraction = (i + 0.5) / n;
  return `calc(${BAR_PAD}px + (100% - ${BAR_PAD * 2}px) * ${fraction})`;
}

export default function MobileNav({ items, profile, mode, onToggleTheme, onLogout }) {
  const { pathname } = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const moreButtonRef = useRef(null);

  const primary = items.filter((item) => item.primary).slice(0, SLOT_COUNT_MAX - 1);
  const overflow = items.filter((item) => !primary.includes(item));

  const tabs = [
    ...primary.map((item) => ({ ...item, kind: "link" })),
    { kind: "more", label: "More", icon: LayoutGrid },
  ];
  const moreIndex = tabs.length - 1;

  // Which tab is current. While the sheet is open "More" takes the bubble, so
  // the bar shows where the sheet lives. A route that is in the overflow
  // (e.g. /materials) also lights "More". A route in neither (e.g.
  // /notifications) leaves the bar flat, with no bubble.
  const routeIndex = primary.findIndex((item) => isItemActive(item, pathname));
  const overflowActive = overflow.some((item) => isItemActive(item, pathname));
  let activeIndex = routeIndex;
  if (activeIndex === -1 && overflowActive) activeIndex = moreIndex;
  if (sheetOpen) activeIndex = moreIndex;

  const hasActive = activeIndex !== -1;
  // With no active tab the bite (and bubble) slide off the bar's left end, so a
  // route outside the nav leaves a flat, unbroken bar rather than an empty hole.
  const notchX = hasActive ? slotCenter(activeIndex, tabs.length) : "-80px";
  const ActiveIcon = hasActive ? tabs[activeIndex].icon : null;
  const activeKey = hasActive ? tabs[activeIndex].to || "more" : "none";

  // Navigating (from a tab or from the sheet) closes the sheet.
  useEffect(() => {
    setSheetOpen(false);
  }, [pathname]);

  // Sheet behaviour: Escape closes, the page behind does not scroll, and focus
  // goes back to the tab that opened it.
  useEffect(() => {
    if (!sheetOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event) {
      if (event.key === "Escape") setSheetOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    const trigger = moreButtonRef.current;
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus({ preventScroll: true });
    };
  }, [sheetOpen]);

  return (
    <>
      <nav
        aria-label="Primary"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
      >
        <div className="mobile-nav-shadow pointer-events-auto relative mx-auto h-[4.5rem] max-w-md">
          {/* Bar surface with the circular bite */}
          <div
            aria-hidden
            className="mobile-nav-surface absolute inset-0 rounded-[1.75rem] border border-slate-100 bg-white dark:border-ink-700 dark:bg-ink-900"
            style={{ "--notch-x": notchX }}
          />

          {/* Raised bubble: a brand ring (thicker underneath, so it reads as a
              crescent sitting in the bite) around a white disc. */}
          <div
            aria-hidden
            className="mobile-nav-bubble pointer-events-none absolute top-[2px] z-10 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600 dark:bg-brand-500"
            style={{ left: notchX, opacity: hasActive ? 1 : 0 }}
          >
            <div className="absolute inset-x-1 bottom-[6px] top-[2px] grid place-items-center rounded-full bg-white dark:bg-ink-800">
              {ActiveIcon && (
                <ActiveIcon
                  key={activeKey}
                  className="h-6 w-6 animate-nav-pop text-brand-600 dark:text-brand-300"
                  strokeWidth={2.1}
                  fill="currentColor"
                  fillOpacity={0.16}
                />
              )}
            </div>
          </div>

          {/* Tabs */}
          <ul className="absolute inset-0 flex" style={{ paddingInline: BAR_PAD }}>
            {tabs.map((tab, index) => {
              const isActive = index === activeIndex;
              const Icon = tab.icon;
              const label = tab.mobileLabel || tab.label;

              const content = (
                <>
                  <Icon
                    className={`h-[22px] w-[22px] transition-all duration-300 ${
                      isActive
                        ? "scale-50 opacity-0"
                        : "text-slate-500 group-active:scale-90 dark:text-slate-400"
                    }`}
                    strokeWidth={1.9}
                  />
                  <span
                    className={`mt-[7px] whitespace-nowrap text-[10.5px] leading-none tracking-tight transition-colors max-[359px]:text-[9.5px] ${
                      isActive
                        ? "font-bold text-slate-900 dark:text-white"
                        : "font-medium text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {label}
                  </span>
                </>
              );

              const tabClass =
                "group flex h-full w-full flex-col items-center pt-[14px] outline-none focus-visible:rounded-2xl focus-visible:ring-2 focus-visible:ring-brand-400";

              return (
                <li key={tab.to || "more"} className="min-w-0 flex-1">
                  {tab.kind === "more" ? (
                    <button
                      ref={moreButtonRef}
                      type="button"
                      onClick={() => setSheetOpen((open) => !open)}
                      aria-haspopup="dialog"
                      aria-expanded={sheetOpen}
                      className={tabClass}
                    >
                      {content}
                    </button>
                  ) : (
                    <Link
                      to={tab.to}
                      aria-current={isActive ? "page" : undefined}
                      className={tabClass}
                    >
                      {content}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* "More" sheet. Rendered outside <nav>: the nav's drop-shadow filter
          would otherwise become the containing block for this fixed layer. */}
      {sheetOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="More"
        >
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close menu"
            onClick={() => setSheetOpen(false)}
            className="absolute inset-0 animate-fade-in bg-ink-950/50 backdrop-blur-[2px]"
          />

          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-md animate-sheet-up rounded-t-[2rem] bg-white px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3 shadow-panel dark:bg-ink-900">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200 dark:bg-ink-600" />

            <div className="flex items-center gap-3">
              <Avatar name={profile?.full_name} src={profile?.avatar_url} size={44} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                  {profile?.full_name}
                </p>
                <p className="text-xs capitalize text-slate-400 dark:text-slate-500">
                  {profile?.role}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                autoFocus
                aria-label="Close menu"
                className="rounded-full bg-slate-100 p-2 text-slate-500 outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:bg-ink-800 dark:text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {overflow.length > 0 && (
              <div className="mt-5 grid grid-cols-3 gap-3">
                {overflow.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item, pathname);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      aria-current={active ? "page" : undefined}
                      className={`flex flex-col items-center gap-2 rounded-2xl px-2 py-3.5 text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-400 ${
                        active
                          ? "bg-brand-600 text-white shadow-pop"
                          : "bg-brand-50 text-slate-700 active:bg-brand-100 dark:bg-ink-800 dark:text-slate-200"
                      }`}
                    >
                      <span
                        className={`grid h-10 w-10 place-items-center rounded-xl ${
                          active
                            ? "bg-white/20 text-white"
                            : "bg-white text-brand-600 shadow-soft dark:bg-ink-900 dark:text-brand-300"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-xs font-semibold">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            <div className="mt-5 flex flex-col gap-1 border-t border-slate-100 pt-3 dark:border-ink-700">
              <button
                type="button"
                onClick={onToggleTheme}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 outline-none transition-colors active:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand-400 dark:text-slate-200 dark:active:bg-ink-800"
              >
                {mode === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                <span className="flex-1 text-left">
                  {mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                </span>
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 outline-none transition-colors active:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-300 dark:text-red-400 dark:active:bg-red-950/40"
              >
                <LogOut className="h-5 w-5" />
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
