"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TeammateHeader from "@/components/TeammateHeader";
import ExecutionFeed from "@/components/ExecutionFeed";
import Instructions from "@/components/Instructions";
import CanvasDoc from "@/components/CanvasDoc";
import PermissionsModal from "@/components/PermissionsModal";
import {
  getDemoState,
  setDemoState,
  getOnboardingResult,
  getOnboardingHistory,
  revertOnboarding,
  onOnboardingChange,
  type DemoState,
  type OnboardingResult,
} from "@/lib/onboardingStore";

type Tab = "feed" | "instructions";

// ─── Empty feed (fresh agent, hasn't run yet) ──────────────────────────────────

function FeedEmpty({ configured }: { configured: boolean }) {
  return (
    <div className="bg-white border border-tipalti-border rounded-xl shadow-card py-16 px-6 flex flex-col items-center text-center gap-2">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#C1C7D0" strokeWidth="1.4">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18M8 14h8M8 17h5" strokeLinecap="round" />
      </svg>
      <h3 className="text-[14px] font-semibold text-tipalti-text-primary mt-1">No work items yet</h3>
      <p className="text-[12.5px] text-tipalti-text-muted max-w-[320px] leading-relaxed">
        {configured
          ? "Your AP Agent is set up and will list every invoice it processes here."
          : "Once you finish setup, every invoice the AP Agent processes will show up here."}
      </p>
    </div>
  );
}

// ─── Setup CTA (fresh, no instructions yet) ─────────────────────────────────────

function SetupCTA({ onStart }: { onStart: () => void }) {
  return (
    <div className="bg-white border border-tipalti-border rounded-xl shadow-card py-14 px-6 flex flex-col items-center text-center gap-3">
      <div className="w-12 h-12 rounded-xl bg-tipalti-blue-light flex items-center justify-center">
        <svg width="22" height="22" viewBox="0 0 14 14"><path d="M7 1L13 7L7 13L1 7L7 1Z" fill="#0052CC" /></svg>
      </div>
      <h3 className="text-[16px] font-bold text-tipalti-text-primary mt-1">Set up your AP Agent</h3>
      <p className="text-[13px] text-tipalti-text-secondary max-w-[420px] leading-relaxed">
        It's activated but hasn't started yet. Set it up with Tipalti AI — describe how your team
        handles invoices or upload your AP policy, and it'll build its instructions together with you.
      </p>
      <button
        onClick={onStart}
        className="mt-2 flex items-center gap-2 text-[13px] font-semibold text-white bg-tipalti-blue rounded-md px-4 py-2 hover:bg-tipalti-navy-hover transition-colors shadow-sm"
      >
        Activate
      </button>
    </div>
  );
}

// ─── Result view (fresh, instructions built via onboarding) ─────────────────────

function ResultView({ result, onEdit }: { result: OnboardingResult; onEdit: () => void }) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const history = getOnboardingHistory();
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-semibold text-tipalti-success bg-tipalti-success-bg px-2 py-0.5 rounded-full">
            v{result.version}
          </span>
          <span className="text-[10px] font-semibold text-tipalti-blue bg-tipalti-blue-light px-1.5 py-0.5 rounded">
            AI setup
          </span>
          <p className="text-[12px] text-tipalti-text-secondary">
            Last saved with Tipalti AI by{" "}
            <span className="font-medium text-tipalti-text-primary">{result.publishedBy}</span> · {fmt(result.publishedAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Version history */}
          <div className="relative">
            <button
              onClick={() => setHistoryOpen(!historyOpen)}
              title="Version history"
              className={`p-1.5 rounded-md border transition-colors ${
                historyOpen
                  ? "border-tipalti-blue bg-blue-50 text-tipalti-blue"
                  : "border-tipalti-border bg-white text-tipalti-text-muted hover:text-tipalti-text-secondary hover:bg-tipalti-bg-light"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                <circle cx="7" cy="7" r="5.5" />
                <path d="M7 4v3.5l2 1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {historyOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setHistoryOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 z-20 w-80 bg-white border border-tipalti-border rounded-lg shadow-lg overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-tipalti-border bg-tipalti-bg-light">
                    <p className="text-[11px] font-semibold text-tipalti-text-muted uppercase tracking-wide">
                      Version history
                    </p>
                  </div>
                  <div className="divide-y divide-tipalti-border max-h-72 overflow-y-auto">
                    {[...history].reverse().map((v) => (
                      <div key={v.version} className="flex items-center gap-4 px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[12px] font-semibold text-tipalti-text-primary">v{v.version}</span>
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-tipalti-blue-light text-tipalti-blue">
                              AI setup
                            </span>
                            {v.version === result.version && (
                              <span className="text-[10px] font-semibold text-tipalti-success bg-tipalti-success-bg px-1.5 py-0.5 rounded-full">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[12px] text-tipalti-text-secondary">
                            {fmt(v.publishedAt)} · {v.publishedBy}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            revertOnboarding(v.version);
                            setHistoryOpen(false);
                          }}
                          disabled={v.version === result.version}
                          className="text-[12px] font-medium text-tipalti-blue hover:underline disabled:text-tipalti-text-muted disabled:no-underline disabled:cursor-default"
                        >
                          {v.version === result.version ? "Current" : "Revert"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-white bg-tipalti-blue rounded-md px-2.5 py-1.5 hover:bg-tipalti-navy-hover transition-colors shadow-sm"
          >
            <svg width="11" height="11" viewBox="0 0 14 14"><path d="M7 1L13 7L7 13L1 7L7 1Z" fill="#ffffff" /></svg>
            Edit with AI
          </button>
        </div>
      </div>
      <div className="bg-[#F4F6F8] rounded-xl border border-tipalti-border p-6">
        <CanvasDoc title="AP Agent" statusLabel={`v${result.version} · Active`} markdown={result.content} />
      </div>
    </div>
  );
}

// ─── Global chat types ────────────────────────────────────────────────────────

interface GMsg {
  id: string;
  role: "user" | "ai";
  text: string;
  viewInstructions?: boolean;
}

// ─── Global chat panel (Flow 2: edit instructions from top bar) ───────────────

function DiamondIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" style={{ flexShrink: 0, display: "block" }}>
      <path d="M7 1L13 7L7 13L1 7L7 1Z" fill="#0065FF" />
    </svg>
  );
}

function GlobalChatPanel({
  messages,
  input,
  isTyping,
  onInputChange,
  onSend,
  onClose,
  onViewInstructions,
}: {
  messages: GMsg[];
  input: string;
  isTyping: boolean;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onClose: () => void;
  onViewInstructions: () => void;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[360px] bg-white border-l border-tipalti-border shadow-xl flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-tipalti-border bg-tipalti-bg-light flex-shrink-0">
        <div className="flex items-center gap-2">
          <DiamondIcon size={13} />
          <span className="text-[13px] font-semibold text-tipalti-text-primary">Tipalti AI</span>
        </div>
        <button
          onClick={onClose}
          className="p-0.5 text-tipalti-text-muted hover:text-tipalti-text-primary transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 3l8 8M11 3l-8 8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
        {messages.length === 0 && !isTyping && (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <DiamondIcon size={22} />
            <p className="text-[12px] text-tipalti-text-muted text-center leading-relaxed max-w-[200px]">
              Ask me to add, update, or remove rules from your teammates&apos; instructions.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((msg) =>
            msg.role === "user" ? (
              <div key={msg.id} className="flex justify-end">
                <div className="bg-tipalti-bg-light border border-tipalti-border rounded-2xl rounded-tr-sm px-3 py-2 max-w-[85%]">
                  <p className="text-[13px] text-tipalti-text-primary leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ) : (
              <div key={msg.id} className="flex items-start gap-2.5">
                <div className="mt-0.5 flex-shrink-0">
                  <DiamondIcon size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-tipalti-text-primary leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </p>
                  {msg.viewInstructions && (
                    <button
                      onClick={onViewInstructions}
                      className="mt-2 text-[12px] font-medium text-tipalti-blue hover:underline flex items-center gap-1"
                    >
                      View instructions
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.4">
                        <path d="M3 7.5L7.5 3M7.5 3H4.5M7.5 3V6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            )
          )}

          {isTyping && (
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex-shrink-0">
                <DiamondIcon size={13} />
              </div>
              <div className="flex gap-1 pt-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-tipalti-text-muted animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="border-t border-tipalti-border px-3 py-2.5 flex-shrink-0">
        <div className="flex items-center gap-2 bg-tipalti-bg-light border border-tipalti-border rounded-xl px-3 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder="Ask about AP Agent…"
            className="flex-1 text-[13px] bg-transparent text-tipalti-text-primary placeholder-tipalti-text-muted focus:outline-none"
          />
          <button
            onClick={onSend}
            disabled={!input.trim()}
            className="w-5 h-5 rounded-md bg-tipalti-blue flex items-center justify-center disabled:opacity-30 hover:bg-tipalti-blue-hover transition-colors flex-shrink-0"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 9L9 5L1.5 1V4L6.5 5L1.5 6V9Z" fill="white" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-tipalti-text-muted mt-1.5 text-center leading-tight">
          AI can make mistakes. Tipalti doesn&apos;t use your data to train its models.
        </p>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const CONFIRM_WORDS = ["yes", "ok", "sure", "confirm", "apply", "looks good", "good", "proceed", "go ahead", "do it"];

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("feed");

  // Prototype demo state — fresh (first-time setup) vs configured (existing agent).
  const [mounted, setMounted] = useState(false);
  const [demo, setDemo] = useState<DemoState>("configured");
  const [result, setResult] = useState<OnboardingResult | null>(null);
  const [savedVersion, setSavedVersion] = useState<number | null>(null);
  const [permOpen, setPermOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "instructions") setActiveTab("instructions");
    const saved = params.get("saved");
    if (saved) {
      setSavedVersion(Number(saved));
      // A just-saved onboarding means we're looking at the freshly set-up agent.
      setDemoState("fresh");
    }
    const refresh = () => {
      setDemo(getDemoState());
      setResult(getOnboardingResult());
    };
    refresh();
    return onOnboardingChange(refresh);
  }, []);

  const fresh = mounted && demo === "fresh";

  // Global chat state
  const [gcOpen, setGcOpen] = useState(false);
  const [gcMessages, setGcMessages] = useState<GMsg[]>([]);
  const [gcInput, setGcInput] = useState("");
  const [gcTyping, setGcTyping] = useState(false);
  const [gcPending, setGcPending] = useState(false);
  const gcMsgId = useRef(0);

  const gcNextId = () => `g${++gcMsgId.current}`;
  const gcSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  const gcPushMsg = (role: "user" | "ai", text: string, extras?: Partial<GMsg>) =>
    new Promise<void>((resolve) => {
      const id = gcNextId();
      setGcMessages((prev) => [...prev, { id, role, text, ...extras }]);
      resolve();
    });

  const gcAiType = async (ms = 1400) => {
    setGcTyping(true);
    await gcSleep(ms);
    setGcTyping(false);
  };

  const handleGcOpen = async () => {
    setGcOpen(true);
    if (gcMessages.length === 0) {
      await gcSleep(150);
      await gcAiType(900);
      await gcPushMsg(
        "ai",
        "Hi! I can help update your teammates' instructions. Which teammate, and what would you like to change?"
      );
    }
  };

  const handleGcSend = async () => {
    const text = gcInput.trim();
    if (!text) return;
    setGcInput("");

    // Confirmation
    if (gcPending) {
      const lower = text.toLowerCase();
      if (CONFIRM_WORDS.some((w) => lower.includes(w))) {
        await gcPushMsg("user", text);
        await gcAiType(800);
        await gcPushMsg(
          "ai",
          "Done. AP Agent instructions updated to v4. Changes are now active for new work items.",
          { viewInstructions: true }
        );
        setGcPending(false);
        return;
      }
    }

    await gcPushMsg("user", text);
    await gcAiType(1800);

    const lower = text.toLowerCase();

    if (
      lower.includes("instruction") ||
      lower.includes("rule") ||
      lower.includes("threshold") ||
      lower.includes("route") ||
      lower.includes("escalat") ||
      lower.includes("ap agent") ||
      lower.includes("mom") ||
      lower.includes("vendor")
    ) {
      const nextVer = 4;
      const ruleText = text
        .replace(/^(update|change|add|set|make|for the ap agent[,]?\s*)/i, "")
        .replace(/^[^A-Za-z0-9]/, "");
      const formattedRule = ruleText.charAt(0).toUpperCase() + ruleText.slice(1);
      await gcPushMsg(
        "ai",
        `Got it. Here's the proposed update to the AP Agent's instructions:\n\n"${formattedRule}"\n\nNo conflicts detected with existing rules. This will become version ${nextVer}. Type "yes" to confirm.`
      );
      setGcPending(true);
    } else {
      await gcPushMsg(
        "ai",
        "I can help with that. Which teammate's instructions would you like to update, and what's the change?"
      );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-tipalti-bg-light">
      <Sidebar />

      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Top bar */}
        <div className="h-12 bg-white border-b border-tipalti-border flex items-center px-6 justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-[13px] text-tipalti-text-muted">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="9" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M0.5 12c0-2 2-3.5 4.5-3.5s4.5 1.5 4.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M8.5 9c.5-.2 1-.3 1.5-.3C12 8.7 14 10 14 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span className="font-medium">AI Workforce</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleGcOpen}
              className={`flex items-center gap-1.5 transition-colors ${
                gcOpen
                  ? "text-tipalti-blue"
                  : "text-tipalti-text-muted hover:text-tipalti-text-primary"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6 0C6.8 3.2 6.8 3.2 10 4C6.8 4.8 6.8 4.8 6 8C5.2 4.8 5.2 4.8 2 4C5.2 3.2 5.2 3.2 6 0Z" />
                <path d="M12 6C12.5 8 12.5 8 14.5 8.5C12.5 9 12.5 9 12 11C11.5 9 11.5 9 9.5 8.5C11.5 8 11.5 8 12 6Z" />
              </svg>
              <span className="text-[13px] font-medium">AI Assistant</span>
            </button>
            <button className="text-tipalti-text-muted hover:text-tipalti-text-primary transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
                <circle cx="8" cy="8" r="6.5" />
                <path d="M6 6.5a2 2 0 113.5 1.5c-.5.5-1.5.8-1.5 1.5" strokeLinecap="round" />
                <circle cx="8" cy="11.5" r="0.5" fill="currentColor" stroke="none" />
              </svg>
            </button>
            <button className="text-tipalti-text-muted hover:text-tipalti-text-primary transition-colors relative">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
                <path d="M4 6a4 4 0 118 0v3l1.5 2H2.5L4 9V6z" />
                <path d="M6 13a2 2 0 004 0" />
              </svg>
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
          <div className="max-w-[1220px] mx-auto px-6 py-6">
            {savedVersion !== null && fresh && (
              <div className="mb-4 flex items-center gap-2.5 bg-tipalti-success-bg border border-tipalti-success/30 rounded-lg px-4 py-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#36B37E" strokeWidth="2.2">
                  <path d="M5 12.5l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-[13px] text-tipalti-text-primary">
                  <span className="font-semibold">Instructions saved.</span> Your AP Agent is set up and ready to start processing invoices.
                </p>
              </div>
            )}

            <TeammateHeader activeTab={activeTab} onTabChange={setActiveTab} fresh={fresh} />
            <div className="mt-6">
              {activeTab === "feed" &&
                (fresh ? <FeedEmpty configured={!!result} /> : <ExecutionFeed />)}
              {activeTab === "instructions" &&
                (!fresh ? (
                  <Instructions />
                ) : result ? (
                  <ResultView
                    result={result}
                    onEdit={() => router.push("/agents/ap/onboarding?mode=edit")}
                  />
                ) : (
                  <SetupCTA onStart={() => setPermOpen(true)} />
                ))}
            </div>
          </div>
        </div>
      </main>

      <PermissionsModal
        open={permOpen}
        onClose={() => setPermOpen(false)}
        onContinue={() => {
          setPermOpen(false);
          router.push("/agents/ap/onboarding");
        }}
      />

      {/* Global chat panel */}
      {gcOpen && (
        <GlobalChatPanel
          messages={gcMessages}
          input={gcInput}
          isTyping={gcTyping}
          onInputChange={setGcInput}
          onSend={handleGcSend}
          onClose={() => setGcOpen(false)}
          onViewInstructions={() => {
            setActiveTab("instructions");
            setGcOpen(false);
          }}
        />
      )}
    </div>
  );
}
