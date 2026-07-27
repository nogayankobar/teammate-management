"use client";

import { useState } from "react";

// The permissions step shown on activation, before onboarding. It's a shortcut
// into the (Janus-owned) permission system pre-scoped to this agent - grant the
// two AP Agent permissions to roles with sensible defaults. Prototype only:
// nothing is persisted; advanced management deep-links to Team Management.

type Level = "view" | "manage";

interface RoleRow {
  id: string;
  name: string;
  desc: string;
  level: Level;
  included: boolean;
  locked?: boolean; // AI Admin always gets Manage
}

const DEFAULT_ROWS: RoleRow[] = [
  { id: "fin-mgr", name: "Finance Manager", desc: "Can see the AP Agent's activity and reasoning", level: "view", included: true },
  { id: "ap-proc", name: "AP Processor", desc: "Can see the AP Agent's activity and reasoning", level: "view", included: true },
  { id: "controller", name: "Controller", desc: "Can see the AP Agent's activity and reasoning", level: "view", included: false },
];

export default function PermissionsModal({
  open,
  onClose,
  onContinue,
}: {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
}) {
  const [rows, setRows] = useState<RoleRow[]>(DEFAULT_ROWS);
  if (!open) return null;

  const grantedCount = rows.filter((r) => r.included).length;
  const toggleIncluded = (id: string) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, included: !r.included } : r)));
  const setLevel = (id: string, level: Level) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, level } : r)));

  return (
    <div className="fixed inset-0 z-[70] bg-black/30 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-panel border border-tipalti-border max-w-[520px] w-full max-h-[88vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-tipalti-border flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#0052CC" }}>
              <span className="text-white font-bold text-[11px]">AP</span>
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-tipalti-text-primary">Give your team access</h3>
              <p className="text-[12.5px] text-tipalti-text-secondary mt-1 leading-relaxed">
                Choose who can use the AP Agent. We've pre-selected the roles that usually need it - adjust as you like.
                You can change this anytime in Team Management.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-tipalti-text-muted hover:text-tipalti-text-primary flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 3l8 8M11 3l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Roles */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {rows.map((r) => (
            <div
              key={r.id}
              className={`flex items-center gap-3 border rounded-xl px-3.5 py-2.5 transition-colors ${
                r.included ? "border-tipalti-border" : "border-tipalti-border opacity-60"
              }`}
            >
              <button
                onClick={() => !r.locked && toggleIncluded(r.id)}
                disabled={r.locked}
                className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                  r.included ? "bg-tipalti-blue border-tipalti-blue" : "bg-white border-tipalti-border"
                } ${r.locked ? "cursor-default" : ""}`}
              >
                {r.included && (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2">
                    <path d="M2.5 6.5l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-semibold text-tipalti-text-primary">{r.name}</span>
                  {r.locked && (
                    <span className="text-[10px] font-medium text-tipalti-text-muted bg-tipalti-bg-light border border-tipalti-border rounded px-1.5 py-0.5">
                      Always
                    </span>
                  )}
                </div>
                <p className="text-[11.5px] text-tipalti-text-muted mt-0.5 truncate">{r.desc}</p>
              </div>
              {/* View / Manage */}
              <div className="flex items-center gap-0.5 bg-tipalti-bg-light border border-tipalti-border rounded-lg p-0.5 flex-shrink-0">
                {(["view", "manage"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => !r.locked && r.included && setLevel(r.id, lvl)}
                    disabled={r.locked || !r.included}
                    className={`text-[11px] font-semibold px-2 py-1 rounded-md capitalize transition-colors ${
                      r.level === lvl
                        ? "bg-white text-tipalti-text-primary shadow-card"
                        : "text-tipalti-text-muted hover:text-tipalti-text-primary disabled:hover:text-tipalti-text-muted"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button className="w-full flex items-center justify-center gap-1.5 text-[12px] font-medium text-tipalti-text-secondary border border-dashed border-tipalti-border rounded-xl px-3 py-2.5 hover:bg-tipalti-bg-light transition-colors">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2.5v7M2.5 6h7" strokeLinecap="round" />
            </svg>
            Add people or roles
          </button>

          <p className="text-[11.5px] text-tipalti-text-muted pt-1">
            Need finer control? <span className="text-tipalti-blue font-medium">Manage in Team Management</span>. Manage includes
            editing the agent's instructions; View is see-only.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-tipalti-border flex items-center justify-between gap-3 bg-tipalti-bg-light">
          <button onClick={onContinue} className="text-[13px] font-medium text-tipalti-text-secondary hover:text-tipalti-text-primary transition-colors">
            Skip for now
          </button>
          <button
            onClick={onContinue}
            className="text-[13px] font-semibold text-white bg-tipalti-blue rounded-md px-4 py-1.5 hover:bg-tipalti-navy-hover transition-colors shadow-sm"
          >
            Grant access to {grantedCount} {grantedCount === 1 ? "role" : "roles"} · Continue
          </button>
        </div>
      </div>
    </div>
  );
}
