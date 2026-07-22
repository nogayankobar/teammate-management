"use client";

import { useRouter, usePathname } from "next/navigation";
import NavSuperagentsBubble from "@/components/NavSuperagentsBubble";

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
    case "superagents":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2C10.8 5.5 10.8 5.5 14.5 6.5C10.8 7.5 10.8 7.5 10 11C9.2 7.5 9.2 7.5 5.5 6.5C9.2 5.5 9.2 5.5 10 2Z" />
          <path d="M5 11.5C5.4 13 5.4 13 7 13.5C5.4 14 5.4 14 5 15.5C4.6 14 4.6 14 3 13.5C4.6 13 4.6 13 5 11.5Z" />
        </svg>
      );
    case "admin":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 6h12M4 10h12M4 14h12" strokeLinecap="round" />
        </svg>
      );
    default:
      return <div className={cls} />;
  }
}

function DropdownChevron() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="ml-auto opacity-60 flex-shrink-0">
      <path d="M3 4l2 2 2-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 5h14M3 10h14M3 15h14" strokeLinecap="round" />
    </svg>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  hasDropdown?: boolean;
  isNew?: boolean;
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { id: "home", label: "Home", icon: "home", href: "#" },
    { id: "bills", label: "Bills", icon: "bills", href: "#" },
    { id: "payments", label: "Payments", icon: "payments", href: "#", hasDropdown: true },
    { id: "cards", label: "Cards", icon: "cards", href: "#" },
    { id: "expenses", label: "Expenses", icon: "expenses", href: "#" },
    { id: "payees", label: "Payees", icon: "payees", href: "#" },
    { id: "detect", label: "Detect", icon: "detect", href: "#" },
    { id: "integrations", label: "Integrations", icon: "integrations", href: "#", hasDropdown: true },
    { id: "reports", label: "Reports", icon: "reports", href: "#" },
    { id: "superagents", label: "AI Agents", icon: "superagents", href: "/", isNew: true },
    { id: "admin", label: "Administration", icon: "admin", href: "#", hasDropdown: true },
  ];

  const isActive = (item: NavItem) => {
    if (item.href === "#") return false;
    if (item.href === "/") {
      return pathname === "/" || pathname.startsWith("/work-items") || pathname.startsWith("/agents");
    }
    return pathname.startsWith(item.href);
  };

  return (
    <aside className="w-[220px] flex-shrink-0 bg-tipalti-navy-dark flex flex-col h-full py-3">
      {/* Top bar: hamburger + logo */}
      <div className="flex items-center gap-3 px-4 mb-5 flex-shrink-0">
        <button className="text-white/70 hover:text-white transition-colors">
          <HamburgerIcon />
        </button>
        <svg width="76" height="20" viewBox="0 0 120 32" fill="none">
          <path
            d="M4 14C10 6, 22 4, 28 9"
            stroke="url(#sidebarSwoosh)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <text
            x="2" y="28"
            fontFamily="'Inter', system-ui, sans-serif"
            fontWeight="700" fontSize="20" fontStyle="italic"
            fill="#FFFFFF" letterSpacing="-0.3"
          >
            tipalti
          </text>
          <defs>
            <linearGradient id="sidebarSwoosh" x1="4" y1="8" x2="28" y2="8" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F5A623" />
              <stop offset="1" stopColor="#E8951A" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5 w-full px-2">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <div key={item.id} className="relative">
              <button
                onClick={() => item.href !== "#" && router.push(item.href)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  active
                    ? "bg-tipalti-purple text-white"
                    : "text-white/60 hover:text-white hover:bg-tipalti-navy-hover"
                }`}
              >
                <NavIcon type={item.icon} />
                <span className="truncate">{item.label}</span>
                {item.isNew && (
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-tipalti-orange bg-white/10 px-1.5 py-0.5 rounded flex-shrink-0">
                    New
                  </span>
                )}
                {item.hasDropdown && <DropdownChevron />}
              </button>
              {item.id === "superagents" && <NavSuperagentsBubble />}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
