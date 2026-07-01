"use client";

import Sidebar from "@/components/Sidebar";
import ContextLibrary from "@/components/ContextLibrary";

export default function AISettingsPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-tipalti-bg-light">
      <Sidebar />
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Top bar */}
        <div className="h-12 bg-white border-b border-tipalti-border flex items-center px-6 justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-[13px] text-tipalti-text-muted">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 5h2m0 0a2 2 0 004 0m-4 0a2 2 0 014 0m0 0h8" strokeLinecap="round" />
              <path d="M3 10h8m0 0a2 2 0 004 0m-4 0a2 2 0 014 0m0 0h2" strokeLinecap="round" />
              <path d="M3 15h2m0 0a2 2 0 004 0m-4 0a2 2 0 014 0m0 0h8" strokeLinecap="round" />
            </svg>
            <span className="font-medium">AI Settings</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 text-tipalti-text-muted hover:text-tipalti-text-primary transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6 0C6.8 3.2 6.8 3.2 10 4C6.8 4.8 6.8 4.8 6 8C5.2 4.8 5.2 4.8 2 4C5.2 3.2 5.2 3.2 6 0Z" />
                <path d="M12 6C12.5 8 12.5 8 14.5 8.5C12.5 9 12.5 9 12 11C11.5 9 11.5 9 9.5 8.5C11.5 8 11.5 8 12 6Z" />
              </svg>
              <span className="text-[13px] font-medium">AI Assistant</span>
            </button>
            <div className="h-5 w-px bg-tipalti-border" />
            <button className="text-[13px] text-tipalti-text-primary font-medium flex items-center gap-1 hover:text-tipalti-blue transition-colors">
              Payer name
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M3 4l2 2 2-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="w-7 h-7 rounded-full bg-tipalti-navy flex items-center justify-center">
              <span className="text-white text-[10px] font-semibold">M</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-8 py-8">
            {/* Page header */}
            <div className="mb-8">
              <h1 className="text-[22px] font-bold text-tipalti-text-primary tracking-tight">AI Settings</h1>
              <p className="text-[13px] text-tipalti-text-muted mt-1">
                Org-level configuration shared across all teammates.
              </p>
            </div>

            {/* Context Library section */}
            <div>
              <div className="mb-4">
                <h2 className="text-[15px] font-semibold text-tipalti-text-primary">Context Library</h2>
                <p className="text-[12px] text-tipalti-text-muted mt-0.5 leading-relaxed max-w-2xl">
                  Reference documents shared across all teammates. Upload GL mappings, vendor contracts, payment terms,
                  and any data teammates should look up when processing. Reference items using their{" "}
                  <span className="font-mono text-tipalti-text-primary text-[11px]">@handle</span>{" "}
                  in a teammate's rules.
                </p>
              </div>
              <ContextLibrary />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
