"use client";

import { useState } from "react";

export default function NavSuperagentsBubble() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 w-[280px] z-50">
      {/* Arrow pointing left at the nav item */}
      <div
        className="absolute -left-[7px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[7px] border-y-transparent border-r-[7px]"
        style={{ borderRightColor: "#6E75E8" }}
      />

      <div className="rounded-xl p-4 shadow-panel" style={{ backgroundColor: "#6E75E8" }}>
        <p className="text-[13px] font-semibold text-white">New: AI Agents</p>
        <p className="text-[12.5px] text-white/85 leading-relaxed mt-1.5">
          See what your AI Agents are doing and track their performance and accuracy over time - all in one place.
        </p>
        <div className="flex justify-end mt-3">
          <button
            onClick={() => setVisible(false)}
            className="text-[12px] font-semibold text-tipalti-navy bg-tipalti-orange hover:bg-tipalti-orange-hover px-3 py-1.5 rounded-md transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
