import { NavLink } from "react-router-dom";
import { GraduationCap, LogOut } from "lucide-react";

// Desktop navigation (md and up). On phones this is replaced by MobileNav.
//
// Anatomy, left to right:
//   body  — the coloured panel holding the logo, the nav and log out
//   edge  — a 24px SVG strip that carries the flowing wave contour
//
// The wave lives in its own fixed-width strip on purpose. Drawing the whole
// panel as one stretched SVG would squash the curve every time the rail grows,
// whereas a strip that is always 24px wide stays crisp whatever the panel does.
// Body and strip share the gradient defined by --nav-* in index.css, so the
// seam between them is invisible.
//
// Expanding on hover/keyboard focus OVERLAYS the page instead of pushing it:
// the wrapper keeps a constant 5.5rem, so nothing in the content column
// reflows (tables, forms and editors stay put) when the pointer crosses the
// rail. `has-[:focus-visible]` rather than `focus-within` so that clicking a
// link with a mouse does not leave the rail stuck open.

const LABEL_CLASS =
  "whitespace-nowrap text-sm font-semibold opacity-0 transition-opacity duration-200 " +
  "group-hover:opacity-100 group-hover:delay-150 " +
  "group-has-[:focus-visible]:opacity-100 group-has-[:focus-visible]:delay-150";

const ITEM_BASE =
  "relative flex h-11 w-full shrink-0 items-center overflow-hidden rounded-2xl outline-none " +
  "transition-[background-color,color,box-shadow] duration-200 " +
  "focus-visible:ring-2 focus-visible:ring-white/90";

export default function SideNav({ items, isAdmin = false, onLogout }) {
  return (
    <div className="relative hidden w-[5.5rem] shrink-0 md:block">
      <div className="sticky top-4 h-[calc(100dvh-2rem)] lg:top-5 lg:h-[calc(100dvh-2.5rem)]">
        <aside
          aria-label="Primary"
          className="group absolute inset-y-0 left-0 z-30 flex w-[5.5rem] drop-shadow-[0_18px_28px_rgba(68,83,201,0.32)] transition-[width] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:w-64 has-[:focus-visible]:w-64 motion-reduce:transition-none"
        >
          {/* Body */}
          <div className="relative flex min-w-0 flex-1 flex-col justify-between overflow-hidden rounded-l-[2rem] bg-nav-gradient py-6">
            {/* Soft depth. Sized to stay inside the collapsed body (64px): anything
                wider would be clipped at the body/edge seam and leave a hard
                vertical cut against the wave. Decorative only. */}
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-white/10"
            />

            <div className="relative flex flex-col gap-8 px-[10px]">
              {/* Brand */}
              <div className="flex h-11 items-center gap-3">
                <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/15 text-white ring-1 ring-inset ring-white/25">
                  <GraduationCap className="h-5 w-5" />
                  {isAdmin && (
                    <span
                      aria-hidden
                      className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-sun-400 ring-2 ring-brand-600"
                    />
                  )}
                </div>
                <div className="min-w-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:delay-150 group-has-[:focus-visible]:opacity-100 group-has-[:focus-visible]:delay-150">
                  <p className="text-lg font-extrabold leading-none text-white">Inspirare</p>
                  {isAdmin && (
                    <p className="mt-1 text-[11px] font-semibold leading-none text-white/70">
                      Admin console
                    </p>
                  )}
                </div>
              </div>

              {/* Primary navigation */}
              <nav className="flex flex-col gap-2">
                {items.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `${ITEM_BASE} ${
                        isActive
                          ? "bg-white text-brand-600 shadow-[0_10px_22px_-8px_rgba(20,24,70,0.55)]"
                          : "text-white/75 hover:bg-white/15 hover:text-white"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className="grid h-11 w-11 shrink-0 place-items-center">
                          <Icon className="h-5 w-5" strokeWidth={isActive ? 2.3 : 2} />
                        </span>
                        <span className={LABEL_CLASS}>{label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="relative px-[10px]">
              <button
                type="button"
                onClick={onLogout}
                className={`${ITEM_BASE} text-white/75 hover:bg-white/15 hover:text-white`}
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center">
                  <LogOut className="h-5 w-5" />
                </span>
                <span className={LABEL_CLASS}>Log out</span>
              </button>
            </div>
          </div>

          {/* Wave edge. The -ml-px overlap hides sub-pixel seams. */}
          <svg
            aria-hidden
            className="-ml-px h-full w-[25px] shrink-0"
            viewBox="0 0 24 800"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="inspirare-nav-edge" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" style={{ stopColor: "var(--nav-top)" }} />
                <stop offset="0.45" style={{ stopColor: "var(--nav-mid)" }} />
                <stop offset="1" style={{ stopColor: "var(--nav-bottom)" }} />
              </linearGradient>
            </defs>
            <path
              fill="url(#inspirare-nav-edge)"
              d="M0 0 C13 0 22 28 22 92 C22 154 9 188 9 262 C9 336 22 372 22 446 C22 522 11 560 11 622 C11 690 22 724 22 762 C22 790 12 800 0 800 Z"
            />
          </svg>
        </aside>
      </div>
    </div>
  );
}
