"use client";

import { useState } from "react";

// ─── Nav icons (outline style matching Tipalti) ──────────────────────────────

function NavIcon({ type }: { type: string }) {
  const cls = "w-5 h-5 flex-shrink-0";
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
    default:
      return <div className={cls} />;
  }
}

// ─── Chevron for dropdowns ───────────────────────────────────────────────────

function DropdownChevron() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="ml-auto">
      <path d="M3 4l2 2 2-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

interface SidebarProps {
  onNavigateHome?: () => void;
}

export default function Sidebar({ onNavigateHome }: SidebarProps) {
  const [activeItem, setActiveItem] = useState("workforce");

  const navItems: Array<{
    id: string;
    label: string;
    icon: string;
    badge?: number;
    hasDropdown?: boolean;
  }> = [
    { id: "home", label: "Home", icon: "home" },
    { id: "workforce", label: "AI Workforce", icon: "workforce", badge: 3 },
    { id: "bills", label: "Bills", icon: "bills" },
    { id: "payments", label: "Payments", icon: "payments", hasDropdown: true },
    { id: "cards", label: "Cards", icon: "cards" },
    { id: "expenses", label: "Expenses", icon: "expenses" },
    { id: "payees", label: "Payees", icon: "payees" },
    { id: "detect", label: "Detect", icon: "detect" },
    { id: "integrations", label: "Integrations", icon: "integrations", hasDropdown: true },
    { id: "reports", label: "Reports", icon: "reports" },
    { id: "admin", label: "Administration", icon: "admin", hasDropdown: true },
  ];

  return (
    <aside className="w-[232px] flex-shrink-0 bg-[#1E2240] flex flex-col h-full sidebar-scroll overflow-y-auto">
      {/* Logo area */}
      <div className="px-4 py-4 flex items-center gap-3">
        {/* Hamburger */}
        <button className="text-white/60 hover:text-white transition-colors p-0.5">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        {/* Tipalti logo */}
        <div className="flex items-center">
          <svg width="100" height="32" viewBox="0 0 100 32" fill="none">
            {/* Orange swoosh arc */}
            <path
              d="M8 10C14 4, 28 2, 42 8"
              stroke="url(#swooshGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* tipalti text */}
            <text
              x="4"
              y="26"
              fontFamily="'Inter', system-ui, sans-serif"
              fontWeight="800"
              fontSize="20"
              fontStyle="italic"
              fill="white"
              letterSpacing="-0.5"
            >
              tipalti
            </text>
            <defs>
              <linearGradient id="swooshGrad" x1="8" y1="8" x2="42" y2="8" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F5A623" />
                <stop offset="1" stopColor="#E8951A" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pb-4 mt-1">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = item.id === activeItem;
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveItem(item.id);
                    if (item.id === "workforce" && onNavigateHome) onNavigateHome();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-colors relative ${
                    isActive
                      ? "bg-[#3B5BDB] text-white shadow-sm"
                      : "text-white/60 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  <NavIcon type={item.icon} />
                  <span className={`font-medium ${isActive ? "text-white" : ""}`}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center leading-none">
                      {item.badge}
                    </span>
                  )}
                  {item.hasDropdown && !item.badge && <DropdownChevron />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
