"use client";

import { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import TeammateHeader from "@/components/TeammateHeader";
import ExecutionFeed from "@/components/ExecutionFeed";
import Instructions from "@/components/Instructions";

type Tab = "feed" | "instructions";

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
  const [activeTab, setActiveTab] = useState<Tab>("feed");

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
            <TeammateHeader activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="mt-6">
              {activeTab === "feed" && <ExecutionFeed />}
              {activeTab === "instructions" && <Instructions />}
            </div>
          </div>
        </div>
      </main>

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
