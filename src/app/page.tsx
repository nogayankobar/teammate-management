"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TeammateHeader from "@/components/TeammateHeader";
import ExecutionFeed from "@/components/ExecutionFeed";

type Tab = "overview" | "execution" | "policies" | "control";

function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-48 bg-white rounded-lg border border-tipalti-border shadow-card">
      <div className="text-center">
        <p className="text-sm font-medium text-tipalti-text-secondary">{label}</p>
        <p className="text-xs text-tipalti-text-muted mt-1">Coming soon</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("execution");

  return (
    <div className="flex h-screen overflow-hidden bg-tipalti-bg-light">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Top bar */}
        <div className="h-12 bg-white border-b border-tipalti-border flex items-center px-6 justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-tipalti-text-muted">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="9" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M0.5 12c0-2 2-3.5 4.5-3.5s4.5 1.5 4.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M8.5 9c.5-.2 1-.3 1.5-.3C12 8.7 14 10 14 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span className="font-medium">AI Workforce</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-xs text-tipalti-text-secondary hover:text-tipalti-text-primary flex items-center gap-1.5 border border-tipalti-border rounded px-2.5 py-1.5 hover:bg-tipalti-bg-light transition-colors">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M6 4.5v2M6 7.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              Help
            </button>
            <div className="w-7 h-7 rounded-full bg-tipalti-blue flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">AP</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto px-6 py-6">
            {/* Teammate header + tabs */}
            <TeammateHeader activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Tab content */}
            <div className="mt-6">
              {activeTab === "execution" && <ExecutionFeed />}
              {activeTab === "overview" && <PlaceholderTab label="Overview" />}
              {activeTab === "policies" && <PlaceholderTab label="Policies, Guardrails & Instructions" />}
              {activeTab === "control" && <PlaceholderTab label="Control" />}
            </div>
          </div>
        </div>
      </main>

      {/* Chat bubble */}
      <button className="fixed bottom-6 right-6 w-12 h-12 bg-tipalti-navy rounded-full shadow-panel flex items-center justify-center hover:bg-tipalti-navy-hover transition-colors z-30">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M2 4a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6l-4 4V4z"
            stroke="white"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="6.5" cy="8" r="1" fill="white" />
          <circle cx="10" cy="8" r="1" fill="white" />
          <circle cx="13.5" cy="8" r="1" fill="white" />
        </svg>
      </button>
    </div>
  );
}
