"use client";

import { useState } from "react";

type NavItem = {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  badge?: number;
};

function TipaltiLogo() {
  return (
    <svg width="88" height="24" viewBox="0 0 88 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="18" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="18" fill="white" letterSpacing="-0.5">
        tipalti
      </text>
      <circle cx="80" cy="10" r="4" fill="#F5A623" />
    </svg>
  );
}

function NavIcon({ type }: { type: string }) {
  const cls = "w-4 h-4 flex-shrink-0";
  switch (type) {
    case "home":
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1L1 7.5V15h5v-4h4v4h5V7.5L8 1z" />
        </svg>
      );
    case "workforce":
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="5" r="2.5" />
          <circle cx="11" cy="5" r="2.5" />
          <path d="M0 13c0-2.5 2.5-4 5-4s5 1.5 5 4H0z" />
          <path d="M9.5 9.5C10 9.2 10.5 9 11 9c2.5 0 5 1.5 5 4h-4.5" strokeLinecap="round" />
        </svg>
      );
    case "bills":
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="currentColor">
          <path d="M2 2h12v12H2V2zm2 3h8v1H4V5zm0 2.5h8v1H4v-1zm0 2.5h5v1H4v-1z" />
        </svg>
      );
    case "payments":
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="currentColor">
          <rect x="1" y="3" width="14" height="10" rx="1.5" />
          <rect x="1" y="6" width="14" height="2.5" fill="#1B2B3E" />
          <rect x="3" y="10" width="4" height="1" rx="0.5" fill="#1B2B3E" />
        </svg>
      );
    case "reports":
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="currentColor">
          <path d="M2 2h7l5 5v7H2V2zm7 0v5h5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M4 10h8M4 12h5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
      );
    case "payees":
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="5" r="3" />
          <path d="M2 14c0-3 2.7-5 6-5s6 2 6 5H2z" />
        </svg>
      );
    case "settings":
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="8" r="2" />
          <path
            d="M8 1.5l1 1.8h2l1 1.7-1.5 1.5.5 2-1.8.8-1.2-1.6-1.2 1.6L5 8.5l.5-2L4 5 5 3.3h2L8 1.5z"
            fillRule="evenodd"
          />
        </svg>
      );
    default:
      return <div className={cls} />;
  }
}

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState("workforce");

  const navItems: Array<{ id: string; label: string; icon: string; badge?: number }> = [
    { id: "home", label: "Home", icon: "home" },
    { id: "workforce", label: "AI Workforce", icon: "workforce", badge: 3 },
    { id: "bills", label: "Bills", icon: "bills" },
    { id: "payments", label: "Payments", icon: "payments" },
    { id: "payees", label: "Payees", icon: "payees" },
    { id: "reports", label: "Reports", icon: "reports" },
  ];

  return (
    <aside className="w-[200px] flex-shrink-0 bg-tipalti-navy flex flex-col h-full sidebar-scroll overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-tipalti-orange rounded-sm flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L1 4.5v5L7 13l6-3.5v-5L7 1z" fill="white" />
            </svg>
          </div>
          <span className="text-white font-bold text-[17px] tracking-tight">tipalti</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 pb-4">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = item.id === activeItem;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveItem(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors relative ${
                    isActive
                      ? "bg-white/[0.12] text-white"
                      : "text-white/60 hover:text-white/90 hover:bg-white/[0.06]"
                  }`}
                >
                  <NavIcon type={item.icon} />
                  <span className={`font-medium ${isActive ? "text-white" : ""}`}>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-tipalti-danger text-white text-[10px] font-semibold rounded-full px-1.5 py-0.5 leading-none min-w-[18px] text-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 pt-4 border-t border-white/10">
          <ul className="space-y-0.5">
            <li>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-white/60 hover:text-white/90 hover:bg-white/[0.06] transition-colors">
                <NavIcon type="settings" />
                <span className="font-medium">Administration</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* User */}
      <div className="px-3 pb-4">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-7 h-7 rounded-full bg-tipalti-orange flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">NY</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">Noga Y.</p>
            <p className="text-white/40 text-[10px] truncate">Tipalti_EP_Test</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
