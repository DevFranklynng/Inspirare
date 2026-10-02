import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";

// Compact desktop rail. Each item has its own label popup, and the rail stays
// fixed in the viewport as the page scrolls.
const ITEM_BASE =
  "relative flex shrink-0 items-center overflow-visible rounded-xl outline-none " +
  "transition-[background-color,color,box-shadow] duration-200 " +
  "focus-visible:ring-2 focus-visible:ring-white/90";

function ItemPopup({ children }) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute left-full z-20 ml-2 whitespace-nowrap rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 opacity-0 shadow-card transition-opacity group-hover/item:opacity-100 group-focus-visible/item:opacity-100 dark:bg-ink-800 dark:text-white">
      {children}
    </span>
  );
}

export default function SideNav({ items, onLogout }) {
  return (
    <div className="relative hidden w-[5.5rem] shrink-0 md:block">
      <aside
        aria-label="Primary"
        className="sidebar-fixed fixed top-1/2 z-40 flex h-[min(600px,72dvh)] w-[6.75rem] -translate-y-1/2 items-center justify-center"
      >
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible drop-shadow-[0_14px_26px_rgba(91,73,195,0.23)]"
          viewBox="0 0 108 600"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="inspirare-nav-wave" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: "var(--nav-top)" }} />
              <stop offset="0.48" style={{ stopColor: "var(--nav-mid)" }} />
              <stop offset="1" style={{ stopColor: "var(--nav-bottom)" }} />
            </linearGradient>
          </defs>
          <path
            fill="url(#inspirare-nav-wave)"
            d="M0 0 C5 76 64 95 93 145 C107 170 108 196 108 225 L108 420 C108 455 97 480 75 503 C46 533 7 557 0 600 Z"
          />
        </svg>
        <div className="relative z-10 flex flex-col items-center gap-1.5">
          <nav aria-label="Primary" className="flex flex-col items-center gap-1.5">
            {items.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                aria-label={label}
                className={({ isActive }) =>
                  `group/item ${ITEM_BASE} h-8 w-8 justify-center ${
                    isActive
                      ? "bg-white text-brand-600 shadow-[0_6px_15px_rgba(40,34,78,.18)]"
                      : "text-white/85 hover:bg-white/15 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.3 : 1.9} />
                    <ItemPopup>{label}</ItemPopup>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            onClick={onLogout}
            aria-label="Log out"
            className={`group/item ${ITEM_BASE} h-8 w-8 justify-center text-white/85 hover:bg-white/15 hover:text-white`}
          >
            <LogOut className="h-[18px] w-[18px]" />
            <ItemPopup>Log out</ItemPopup>
          </button>
        </div>
      </aside>
    </div>
  );
}
