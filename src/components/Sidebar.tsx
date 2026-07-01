"use client";

import { useRouter, usePathname } from "next/navigation";

// ─── Nav icons (outline style matching Tipalti) ──────────────────────────────

function NavIcon({ type }: { type: string }) {
  const cls = "w-[18px] h-[18px] flex-shrink-0";
  switch (type) {
    case "home":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 10.5L10 4l7 6.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 9v7a1 1 0 001 1h3v-4h2v4h3a1 1 0 001-1V9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "bills":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="2" width="14" height="16" rx="1.5" />
          <path d="M6 6h8M6 9.5h8M6 13h5" strokeLinecap="round" />
        </svg>
      );
    case "payments":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="10" cy="10" r="7" />
          <path d="M10 5.5V7M10 13v1.5" strokeLinecap="round" />
          <path d="M7.5 11.5c0 1 1 1.5 2.5 1.5s2.5-.5 2.5-1.5S11.5 10 10 10s-2.5-.5-2.5-1.5S8.5 7 10 7s2.5.5 2.5 1.5" strokeLinecap="round" />
        </svg>
      );
    case "cards":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="4" width="16" height="12" rx="2" />
          <path d="M2 8h16" />
          <path d="M5 12h4" strokeLinecap="round" />
        </svg>
      );
    case "expenses":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 3h8l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" />
          <path d="M12 3v4h4" />
          <path d="M7 10h6M7 13h4" strokeLinecap="round" />
        </svg>
      );
    case "payees":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="10" cy="7" r="3" />
          <path d="M4 17c0-3 2.7-5.5 6-5.5s6 2.5 6 5.5" strokeLinecap="round" />
        </svg>
      );
    case "detect":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="10" cy="10" r="7" />
          <path d="M10 6v4l3 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "integrations":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="5" height="5" rx="1" />
          <rect x="12" y="3" width="5" height="5" rx="1" />
          <rect x="3" y="12" width="5" height="5" rx="1" />
          <rect x="12" y="12" width="5" height="5" rx="1" />
        </svg>
      );
    case "reports":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 16V8M8 16V4M12 16v-6M16 16V7" strokeLinecap="round" />
        </svg>
      );
    case "workforce":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="7" cy="7" r="2.5" />
          <circle cx="13" cy="7" r="2.5" />
          <path d="M2 16c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5" strokeLinecap="round" />
          <path d="M12 11.8c.4-.2.8-.3 1.3-.3 2.5 0 4.7 2 4.7 4.5" strokeLinecap="round" />
          <circle cx="10" cy="3" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "admin":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 6h12M4 10h12M4 14h12" strokeLinecap="round" />
        </svg>
      );
    case "ai-settings":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 5h2m0 0a2 2 0 004 0m-4 0a2 2 0 014 0m0 0h8" strokeLinecap="round" />
          <path d="M3 10h8m0 0a2 2 0 004 0m-4 0a2 2 0 014 0m0 0h2" strokeLinecap="round" />
          <path d="M3 15h2m0 0a2 2 0 004 0m-4 0a2 2 0 014 0m0 0h8" strokeLinecap="round" />
        </svg>
      );
    default:
      return <div className={cls} />;
  }
}

// ─── Chevron for dropdowns ───────────────────────────────────────────────────

function DropdownChevron() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="ml-auto opacity-50">
      <path d="M3 4l2 2 2-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: number;
  dividerBefore?: boolean;
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { id: "home",        label: "Home",           icon: "home",        href: "#" },
    { id: "workforce",   label: "AI Workforce",   icon: "workforce",   href: "/",           badge: 3 },
    { id: "bills",       label: "Bills",           icon: "bills",       href: "#", dividerBefore: true },
    { id: "payments",    label: "Payments",        icon: "payments",    href: "#" },
    { id: "cards",       label: "Cards",           icon: "cards",       href: "#" },
    { id: "expenses",    label: "Expenses",        icon: "expenses",    href: "#" },
    { id: "payees",      label: "Payees",          icon: "payees",      href: "#" },
    { id: "reports",     label: "Reports",         icon: "reports",     href: "#" },
    { id: "admin",       label: "Administration",  icon: "admin",       href: "#", dividerBefore: true },
  ];

  const isActive = (item: NavItem) => {
    if (item.href === "/") return pathname === "/" || pathname.startsWith("/work-items");
    return pathname.startsWith(item.href);
  };

  return (
    <aside className="w-14 flex-shrink-0 bg-white border-r border-tipalti-border flex flex-col h-full items-center py-4 sidebar-scroll overflow-y-auto">
      {/* Tipalti logo */}
      <div className="mb-6 flex-shrink-0">
        <svg width="30" height="40" viewBox="0 0 30 40" fill="none">
          <path
            d="M8 8C13 3, 22 2, 26 6"
            stroke="url(#sidebarSwoosh)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <text
            x="7" y="35"
            fontFamily="'Inter', system-ui, sans-serif"
            fontWeight="800" fontSize="26" fontStyle="italic"
            fill="#1A1A2E" letterSpacing="-0.5"
          >
            t
          </text>
          <defs>
            <linearGradient id="sidebarSwoosh" x1="8" y1="5" x2="26" y2="5" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F5A623" />
              <stop offset="1" stopColor="#E8951A" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col items-center gap-1 w-full px-2">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <div key={item.id} className="w-full">
              {item.dividerBefore && (
                <div className="border-t border-tipalti-border mx-1 my-2" />
              )}
              <button
                onClick={() => item.href !== "#" && router.push(item.href)}
                title={item.label}
                className={`relative w-full flex items-center justify-center h-9 rounded-lg transition-colors group ${
                  active
                    ? "bg-tipalti-navy text-white"
                    : "text-tipalti-text-muted hover:text-tipalti-text-primary hover:bg-tipalti-bg-light"
                }`}
              >
                {item.icon === "workforce" ? (
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 0C10 0 10.8 4 10 6C11.5 4.2 15 2 15 2C15 2 13 5.5 11.5 6.5C13.5 6 17 5.5 17 5.5C17 5.5 14 8 12 9C14 9.5 17 10.5 17 10.5C17 10.5 13.5 10.5 11.5 10C13 11 15 14.5 15 14.5C15 14.5 11.5 12.2 10 10.5C10.8 12.5 10 16.5 10 16.5C10 16.5 9.2 12.5 10 10.5C8.5 12.2 5 14.5 5 14.5C5 14.5 7 11 8.5 10C6.5 10.5 3 10.5 3 10.5C3 10.5 6 9.5 8 9C6 8 3 5.5 3 5.5C3 5.5 6.5 6 8.5 6.5C7 5.5 5 2 5 2C5 2 8.5 4.2 10 6C9.2 4 10 0 10 0Z" />
                  </svg>
                ) : (
                  <NavIcon type={item.icon} />
                )}
                {item.badge && !active && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                )}
                {/* Tooltip */}
                <span className="absolute left-full ml-2 px-2 py-1 rounded bg-tipalti-navy text-white text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                  {item.label}
                </span>
              </button>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
