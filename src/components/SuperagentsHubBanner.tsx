"use client";

import { useState } from "react";

function MegaphoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path
        d="M3 8v4a1 1 0 001 1h1.2l6.3 3.2a.6.6 0 00.9-.53V4.33a.6.6 0 00-.9-.53L5.2 7H4a1 1 0 00-1 1z"
        strokeLinejoin="round"
      />
      <path d="M13.5 7.2a3.2 3.2 0 010 5.6" strokeLinecap="round" />
      <path d="M16 5.5a6 6 0 010 9" strokeLinecap="round" />
    </svg>
  );
}

export default function SuperagentsHubBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const dismiss = () => setVisible(false);

  return (
    <div className="flex items-start gap-3 rounded-xl border border-tipalti-blue-light bg-white px-4 py-3 mb-5 shadow-card">
      <div className="mt-0.5 flex-shrink-0 text-tipalti-blue">
        <MegaphoneIcon />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13px] font-semibold text-tipalti-text-primary">
            This is where all your AI Superagents will live
          </span>
          <span className="text-[11px] font-medium text-tipalti-blue bg-tipalti-info-bg px-2 py-0.5 rounded-full flex-shrink-0">
            Coming soon
          </span>
        </div>
        <p className="text-[13px] text-tipalti-text-secondary mt-1 leading-relaxed">
          Tipalti&apos;s AI Superagents automate your workflows end to end. AP Superagent is the first. As more launch, you&apos;ll manage them all right here.
        </p>
      </div>

      <button
        onClick={dismiss}
        className="text-[13px] text-tipalti-text-muted hover:text-tipalti-text-primary transition-colors flex-shrink-0 mt-0.5"
      >
        Dismiss
      </button>
    </div>
  );
}
