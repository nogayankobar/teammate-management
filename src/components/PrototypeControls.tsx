"use client";

import { useState, useRef, useEffect } from "react";
import { setShowOverage, useShowOverage } from "@/lib/creditsDemoStore";

// ─── Prototype-only controls ──────────────────────────────────────────────────
// Floating bottom-right popover holding every demo picker, so they don't read as
// part of the product design.

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: ReadonlyArray<{ id: T; label: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-tipalti-text-muted whitespace-nowrap">
        {label}
      </span>
      <div className="flex items-center gap-0.5 bg-tipalti-bg-light border border-tipalti-border rounded-lg p-0.5">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
              value === o.id
                ? "bg-white text-tipalti-text-primary shadow-card"
                : "text-tipalti-text-muted hover:text-tipalti-text-primary"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CreditsOverageControl() {
  const showOverage = useShowOverage();
  return (
    <Segmented
      label="Credits"
      value={showOverage ? "overage" : "within"}
      options={[
        { id: "within", label: "Within package" },
        { id: "overage", label: "Overage" },
      ] as const}
      onChange={(v) => setShowOverage(v === "overage")}
    />
  );
}

export default function PrototypeControls({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
      {open && (
        <div className="bg-white border border-tipalti-border rounded-xl shadow-lg p-3 space-y-2.5 min-w-[300px]">
          <p className="text-[11px] font-semibold text-tipalti-text-primary">Prototype controls</p>
          {children}
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-[11px] font-semibold text-white bg-tipalti-navy/80 hover:bg-tipalti-navy rounded-full px-3 py-1.5 shadow-lg transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3">
          <path d="M2 3h8M2 6h8M2 9h8" strokeLinecap="round" />
          <circle cx="4" cy="3" r="1" fill="currentColor" />
          <circle cx="8" cy="6" r="1" fill="currentColor" />
          <circle cx="5" cy="9" r="1" fill="currentColor" />
        </svg>
        Prototype
      </button>
    </div>
  );
}
