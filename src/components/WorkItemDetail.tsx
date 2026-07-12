"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Task, TaskType, LogEntry, FeedbackField } from "@/data/mockData";
import { AnnotationProvider, useAnnotation } from "@/contexts/AnnotationContext";
import { AnnotationZone } from "@/components/AnnotationZone";

// ─── Portal ───────────────────────────────────────────────────────────────────

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

// ─── Annotation toggle ────────────────────────────────────────────────────────

function AnnotationToggle() {
  const { annotationMode, toggle } = useAnnotation();
  return (
    <button
      onClick={toggle}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold shadow-lg border transition-all ${
        annotationMode
          ? "bg-gray-800 text-white border-gray-600"
          : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
      }`}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <rect x="1" y="1" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" strokeDasharray="2.5 1.5" />
        <circle cx="6" cy="6" r="1.5" fill="currentColor" />
      </svg>
      {annotationMode ? "Exit annotation mode" : "Annotation mode"}
    </button>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function DiamondIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" style={{ flexShrink: 0, display: "block" }}>
      <path d="M7 1L13 7L7 13L1 7L7 1Z" fill="#0065FF" />
    </svg>
  );
}

function BoldText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
      )}
    </>
  );
}

interface FMsg {
  id: string;
  role: "user" | "ai";
  text: string;
  thumbs?: boolean;
  suggestions?: string[];
  viewInstructions?: boolean;
}

function buildFeedbackContext(task: Task): { text: string; suggestions: string[] } {
  if (task.feedbackFields && task.feedbackFields.length > 0) {
    const fields = task.feedbackFields;
    if (fields.length === 1) {
      const f = fields[0];
      return {
        text: `I coded **${f.label}** as **${f.aiValue}**, but you changed it to **${f.humanValue}**.\n\nTell me what I missed so I can handle similar ${task.vendor} invoices automatically going forward.`,
        suggestions: [
          `Always use ${f.humanValue} for ${task.vendor}`,
          `Use ${f.aiValue} only for standard purchases`,
          "Other",
        ],
      };
    }
    // Multiple fields changed — list them all, ask which to add a rule for
    const fieldLines = fields.map((f) => `• **${f.label}**: ${f.aiValue} → ${f.humanValue}`).join("\n");
    return {
      text: `You changed ${fields.length} fields on this ${task.vendor} invoice:\n\n${fieldLines}\n\nWhich of these would you like me to add an instruction for?`,
      suggestions: [
        ...fields.slice(0, 2).map((f) => `Add rule for ${f.label}`),
        "Other",
      ],
    };
  }
  const uncertainClassify = task.log.find(
    (e) => e.action === "Classify" && (e.reasoning.includes("not fully confident") || e.reasoning.includes("flagging"))
  );
  if (uncertainClassify) {
    const account = uncertainClassify.detail.replace("Expense account → ", "");
    return {
      text: `I thought this invoice belonged under **${account}** based on the line items, even though similar ${task.vendor} invoices were previously coded differently.\n\nTell me what I missed so I can handle similar invoices automatically going forward.`,
      suggestions: [
        `Always use the vendor's historical account for ${task.vendor}`,
        `Use this account only for event/conference purchases`,
        "Other",
      ],
    };
  }
  return {
    text: `Is there anything about how I processed this invoice that you'd like me to do differently next time?`,
    suggestions: ["It looks good", "Add a rule for this vendor", "Other"],
  };
}

// ─── Feedback chat panel ──────────────────────────────────────────────────────

const CONFIRM_WORDS_FB = ["yes", "ok", "sure", "confirm", "apply", "looks good", "good", "proceed", "go ahead"];

function FeedbackChatPanel({ task, onClose }: { task: Task; onClose: () => void }) {
  const [messages, setMessages] = useState<FMsg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [pending, setPending] = useState(false);
  const msgIdRef = useRef(0);
  const initializedRef = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);

  const nextId = () => `fb${++msgIdRef.current}`;
  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
  const pushMsg = (msg: Omit<FMsg, "id">) =>
    new Promise<void>((resolve) => {
      setMessages((prev) => [...prev, { id: nextId(), ...msg }]);
      resolve();
    });
  const aiType = async (ms = 1100) => {
    setTyping(true);
    await sleep(ms);
    setTyping(false);
  };

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const init = async () => {
      await sleep(250);
      await aiType(1000);
      const { text, suggestions } = buildFeedbackContext(task);
      await pushMsg({ role: "ai", text, thumbs: true, suggestions });
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleSend = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    setInput("");

    if (pending) {
      if (CONFIRM_WORDS_FB.some((w) => msg.toLowerCase().includes(w))) {
        await pushMsg({ role: "user", text: msg });
        await aiType(700);
        await pushMsg({ role: "ai", text: "Done. I've added this rule to my instructions — it's active for new invoices from now on.", viewInstructions: true });
        setPending(false);
        return;
      }
    }

    await pushMsg({ role: "user", text: msg });
    await aiType(1400);

    const lower = msg.toLowerCase();

    if (lower.includes("good") || lower.includes("correct") || lower.includes("one-off") || lower.includes("fine")) {
      await pushMsg({ role: "ai", text: "Noted — no changes needed. I'll keep handling this vendor the same way." });
      return;
    }

    if (lower === "other") {
      await pushMsg({ role: "ai", text: `What instruction would you like me to add? Describe what you'd like me to do differently for ${task.vendor} invoices.` });
      return;
    }

    // Handle "Add rule for [Field]" suggestions
    if (lower.startsWith("add rule for ")) {
      const fieldName = msg.slice("add rule for ".length).trim();
      const field = task.feedbackFields?.find(
        (f) => f.label.toLowerCase() === fieldName.toLowerCase()
      );
      if (field) {
        const ruleText = `For ${task.vendor} invoices, always use ${field.humanValue} for ${field.label}`;
        await pushMsg({
          role: "ai",
          text: `Got it. Here's the rule I'll add:\n\n"${ruleText}"\n\nType "yes" to confirm.`,
        });
        setPending(true);
        return;
      }
    }

    // Generic rule proposal
    await pushMsg({
      role: "ai",
      text: `Got it. Here's the rule I'll add to my instructions:\n\n"${msg}"\n\nThis will apply to future ${task.vendor} invoices. Type "yes" to confirm.`,
    });
    setPending(true);
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[360px] bg-white border-l border-tipalti-border shadow-xl flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-tipalti-border bg-tipalti-bg-light flex-shrink-0">
        <div className="flex items-center gap-2">
          <DiamondIcon size={13} />
          <span className="text-[13px] font-semibold text-tipalti-text-primary">Tipalti AI</span>
        </div>
        <button onClick={onClose} className="p-0.5 text-tipalti-text-muted hover:text-tipalti-text-primary transition-colors">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 3l8 8M11 3l-8 8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Context banner */}
      <div className="px-4 py-2 border-b border-tipalti-border flex-shrink-0">
        <p className="text-[11px] text-tipalti-text-muted text-center">
          {task.vendor} — {task.currency} {task.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
        <div className="space-y-4">
          {messages.map((msg) =>
            msg.role === "user" ? (
              <div key={msg.id} className="flex justify-end">
                <div className="bg-tipalti-bg-light border border-tipalti-border rounded-2xl rounded-tr-sm px-3 py-2 max-w-[85%]">
                  <p className="text-[13px] text-tipalti-text-primary leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ) : (
              <div key={msg.id} className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex-shrink-0"><DiamondIcon size={13} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-tipalti-text-primary leading-relaxed whitespace-pre-wrap">
                      <BoldText text={msg.text} />
                    </p>
                    {msg.viewInstructions && (
                      <button className="mt-2 text-[12px] font-medium text-tipalti-blue hover:underline flex items-center gap-1">
                        View instructions
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.4">
                          <path d="M3 7.5L7.5 3M7.5 3H4.5M7.5 3V6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                {msg.thumbs && (
                  <div className="pl-6 flex items-center gap-3">
                    <button className="text-tipalti-text-muted hover:text-tipalti-success transition-colors">
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3">
                        <path d="M5 6.5V13H11.5L13 8.5H9V3.5L7.5 2 5 6.5Z" strokeLinejoin="round" />
                        <path d="M5 6.5H3V13H5" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button className="text-tipalti-text-muted hover:text-tipalti-danger transition-colors">
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3">
                        <path d="M10 8.5V2H3.5L2 6.5H6V11.5L7.5 13 10 8.5Z" strokeLinejoin="round" />
                        <path d="M10 8.5H12V2H10" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                )}
                {msg.suggestions && (
                  <div className="pl-6 space-y-1.5">
                    <p className="text-[10px] font-semibold text-tipalti-text-muted uppercase tracking-wide">Suggestions</p>
                    {msg.suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSend(s)}
                        className="flex items-start gap-1.5 text-[12px] text-tipalti-text-secondary hover:text-tipalti-blue transition-colors text-left w-full"
                      >
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none" className="mt-0.5 flex-shrink-0">
                          <path d="M2 7L7 4.5L2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          )}
          {typing && (
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex-shrink-0"><DiamondIcon size={13} /></div>
              <div className="flex gap-1 pt-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-tipalti-text-muted animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
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
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Tell me what to do differently…"
            className="flex-1 text-[13px] bg-transparent text-tipalti-text-primary placeholder-tipalti-text-muted focus:outline-none"
          />
          <button
            onClick={() => handleSend()}
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

// ─── Icons ────────────────────────────────────────────────────────────────────

function Sparkle({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ display: "block" }}>
      <path d="M10 4 L11.5 10.5 L18 12 L11.5 13.5 L10 20 L8.5 13.5 L2 12 L8.5 10.5 Z" />
      <path d="M18 5 L18.7 7.3 L21 8 L18.7 8.7 L18 11 L17.3 8.7 L15 8 L17.3 7.3 Z" />
    </svg>
  );
}

function TypeIcon({ type }: { type: TaskType }) {
  switch (type) {
    case "anomaly":
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1.5L1 12.5h12L7 1.5z" stroke="#DE350B" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M7 6v2.5M7 10v.5" stroke="#DE350B" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "bookkeeping":
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="2" y="1.5" width="10" height="11" rx="1" stroke="#5243AA" strokeWidth="1.4" />
          <path d="M4.5 5h5M4.5 7.5h5M4.5 10h3" stroke="#5243AA" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "routing":
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 4h7l3 3-3 3H2" stroke="#5E6C84" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "validation":
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="5" stroke="#0065FF" strokeWidth="1.4" />
          <path d="M4.5 7l2 2 3-3" stroke="#0065FF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "extraction":
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="2" y="2" width="10" height="10" rx="1" stroke="#0065FF" strokeWidth="1.4" />
          <path d="M7 5v4M5 7l2 2 2-2" stroke="#0065FF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}


function getDetailStatus(task: Task): { label: string; cls: string } {
  if (task.status === "in_progress") return { label: "In progress",           cls: "bg-gray-100 text-gray-500" };
  if (task.status === "error")       return { label: "Error",                 cls: "bg-red-50 text-red-600" };
  if (task.status === "abandoned")   return { label: "Abandoned",             cls: "bg-gray-100 text-gray-500" };
  if (task.status === "flagged" || task.status === "pending_review")
                                     return { label: "Awaiting human review", cls: "bg-tipalti-warning-bg text-tipalti-warning" };
  if (typeof task.userOverride === "number" && task.userOverride > 0)
                                     return { label: "Accepted with edits",   cls: "bg-blue-50 text-tipalti-blue" };
  if (task.status === "auto_approved")
                                     return { label: "Auto-completed",        cls: "bg-tipalti-success-bg text-tipalti-success" };
  return                                    { label: "Accepted",               cls: "bg-tipalti-success-bg text-tipalti-success" };
}

function StatusPill({ task }: { task: Task }) {
  const { label, cls } = getDetailStatus(task);
  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full ${cls}`}>
      {label}
    </span>
  );
}

function PersonIcon({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="currentColor" style={{ display: "block", flexShrink: 0 }}>
      <circle cx="7" cy="4.5" r="2.5" />
      <path d="M1.5 13c0-3 2.5-5 5.5-5s5.5 2 5.5 5" strokeLinecap="round" />
    </svg>
  );
}

function LogActionBadge({ action }: { action: LogEntry["action"] }) {
  const cfg: Record<Exclude<LogEntry["action"], "Human">, string> = {
    Fetch:    "bg-gray-100 text-gray-600",
    Extract:  "bg-blue-50 text-tipalti-blue",
    Match:    "bg-indigo-50 text-indigo-600",
    Classify: "bg-tipalti-purple-bg text-tipalti-purple",
    Validate: "bg-amber-50 text-amber-700",
    Flag:     "bg-tipalti-danger-bg text-tipalti-danger",
    Ask:      "bg-violet-50 text-violet-600",
    Escalate: "bg-orange-50 text-orange-600",
    Decide:   "bg-tipalti-success-bg text-tipalti-success",
  };
  return (
    <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap ${cfg[action as Exclude<LogEntry["action"], "Human">]}`}>
      {action}
    </span>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Field helpers ────────────────────────────────────────────────────────────

function FieldRow({ label, value, mono, bold }: {
  label: string;
  value: string;
  mono?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-[12px] text-tipalti-text-muted flex-shrink-0">{label}</span>
      <span className={`text-[12px] text-right ${bold ? "font-semibold text-tipalti-text-primary" : "text-tipalti-text-primary"} ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function OverrideRow({ override }: { override: Task["userOverride"] }) {
  let display: React.ReactNode;
  if (override === "none")
    display = <span className="text-[12px] font-medium text-tipalti-success">Submitted with no overrides</span>;
  else if (override === "pending")
    display = <span className="text-[12px] text-tipalti-text-muted">Not yet reviewed</span>;
  else
    display = <span className="text-[12px] font-medium text-tipalti-warning">{override} override{(override as number) > 1 ? "s" : ""}</span>;

  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-[12px] text-tipalti-text-muted flex-shrink-0">User override</span>
      {display}
    </div>
  );
}

function OutcomeCard({ task }: { task: Task }) {
  const reasons = task.outcomeReasons;
  if (!reasons || reasons.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-tipalti-border shadow-card overflow-hidden">
      <div className="px-4 py-2.5 border-b border-tipalti-border bg-tipalti-bg-light flex items-center gap-1.5">
        <DiamondIcon size={9} />
        <p className="text-[11px] font-semibold text-tipalti-text-muted uppercase tracking-wide">Outcome</p>
      </div>
      <div className="px-4 py-3 space-y-3">
        {task.fieldStats.total > 0 && (() => {
          const { confident, total } = task.fieldStats;
          const pct = Math.round((confident / total) * 100);
          const barColor = pct === 100 ? "bg-tipalti-success" : pct >= 80 ? "bg-tipalti-blue" : "bg-tipalti-warning";
          const textColor = pct === 100 ? "text-tipalti-success" : pct >= 80 ? "text-tipalti-blue" : "text-tipalti-warning";
          return (
            <AnnotationZone label="Consumer" description="Consumer selects how accuracy is expressed (confidence bar, score, thumbs, etc.)." rounded="rounded">
            <div className="pb-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] text-tipalti-text-muted">{confident}/{total} fields coded confidently</span>
                <span className={`text-[12px] font-semibold ${textColor}`}>{pct}%</span>
              </div>
              <div className="h-1.5 bg-tipalti-border rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
            </AnnotationZone>
          );
        })()}
        <AnnotationZone label="Fixed" description="Platform generates review reasons and explanations. Format is fixed. Consumer can hide the Outcome card." rounded="rounded-lg" className="space-y-3">
          {reasons.map((r) => (
            <div key={r.reason} className="flex items-start gap-2">
              <div className="mt-2 flex-shrink-0">
                <DiamondIcon size={10} />
              </div>
              <div className="flex-1 min-w-0 bg-indigo-50 rounded-xl rounded-tl-none px-3 py-2.5">
                <p className="text-[12px] font-semibold text-tipalti-text-primary leading-snug">{r.reason}</p>
                <p className="text-[12px] text-tipalti-text-secondary leading-relaxed mt-1">{r.explanation}</p>
              </div>
            </div>
          ))}
        </AnnotationZone>
      </div>
    </div>
  );
}

// ─── Feedback card ────────────────────────────────────────────────────────────

function FeedbackCard({ override, fields, onOpenFeedback }: {
  override: Task["userOverride"];
  fields?: FeedbackField[];
  onOpenFeedback: () => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-tipalti-border shadow-card overflow-hidden">
      <div className="px-4 py-2.5 border-b border-tipalti-border bg-tipalti-bg-light flex items-center justify-between">
        <p className="text-[11px] font-semibold text-tipalti-text-muted uppercase tracking-wide">Feedback</p>
        <button
          onClick={onOpenFeedback}
          className="flex items-center gap-1 text-[11px] font-medium text-tipalti-blue hover:underline"
        >
          <DiamondIcon size={9} />
          Update instructions
        </button>
      </div>
      <AnnotationZone label="Consumer" description="Consumer decides whether to show this card." rounded="rounded-b-lg">
      <div className="px-4 py-3 space-y-2">
        {override === "none" && (
          <div className="flex items-center gap-2">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="#36B37E" strokeWidth="1.3" />
              <path d="M4.5 7l2 2 3-3" stroke="#36B37E" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[12px] font-medium text-tipalti-success">Accepted as coded — no changes made</span>
          </div>
        )}
        {override === "pending" && (
          <p className="text-[12px] text-tipalti-text-muted">Not yet reviewed</p>
        )}
        {typeof override === "number" && fields && fields.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] text-tipalti-text-muted">{override} field{override > 1 ? "s" : ""} changed</p>
            {fields.map((f) => (
              <div key={f.label} className="text-[12px]">
                <span className="text-tipalti-text-muted mr-2">{f.label}</span>
                <span className="line-through text-tipalti-text-muted mr-2">{f.aiValue}</span>
                <span className="text-tipalti-text-primary font-medium">→ {f.humanValue}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      </AnnotationZone>
    </div>
  );
}

// ─── Left column ──────────────────────────────────────────────────────────────

function InvoiceDocument({ task }: { task: Task }) {
  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2 });
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="bg-white w-full shadow-md" style={{ fontFamily: "Georgia, serif" }}>
      <div className="bg-[#0B1A2E] px-4 py-3">
        <div className="text-white font-bold text-[13px] tracking-wide">{task.vendor.toUpperCase()}</div>
        <div className="text-[#8FA3BB] text-[8px] mt-0.5 tracking-wider">INVOICE</div>
      </div>
      <div className="flex justify-between px-4 py-2 border-b border-gray-100 bg-gray-50">
        <div>
          <div className="text-[8px] text-gray-400 uppercase tracking-wider mb-0.5">Invoice #</div>
          <div className="text-[10px] font-semibold text-gray-800 font-mono">{task.invoiceNumber}</div>
        </div>
        <div className="text-right">
          <div className="text-[8px] text-gray-400 uppercase tracking-wider mb-0.5">Date</div>
          <div className="text-[10px] text-gray-700">{fmtDate(task.date)}</div>
        </div>
      </div>
      <div className="px-4 py-2 border-b border-gray-100">
        <div className="text-[8px] text-gray-400 uppercase tracking-wider mb-1">Bill to</div>
        <div className="text-[9px] text-gray-700 leading-relaxed">
          Tipalti Inc. · 1810 Gateway Dr, San Mateo CA 94404
        </div>
      </div>
      <div className="px-4 py-3">
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th className="text-[7px] text-gray-400 uppercase tracking-wider text-left pb-1 font-normal">Description</th>
              <th className="text-[7px] text-gray-400 uppercase tracking-wider text-right pb-1 font-normal">Amount</th>
            </tr>
          </thead>
          <tbody>
            {task.lineItems ? (
              task.lineItems.map((line, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="text-[9px] text-gray-700 py-1.5 pr-2 leading-snug">{line.description}</td>
                  <td className="text-[9px] text-gray-700 text-right py-1.5 font-mono">{task.currency === "USD" ? "$" : task.currency + " "}{fmt(line.amount)}</td>
                </tr>
              ))
            ) : (
              <tr className="border-t border-gray-100">
                <td className="text-[9px] text-gray-700 py-1.5 pr-2 leading-snug">{task.summary.split(" — ")[0]}</td>
                <td className="text-[9px] text-gray-700 text-right py-1.5 font-mono">${fmt(task.amount)}</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="border-t border-gray-100 pt-1.5 mt-1 flex justify-between text-[10px] font-bold text-gray-800">
          <span>Total</span>
          <span className="font-mono">{task.currency} {fmt(task.amount)}</span>
        </div>
      </div>
    </div>
  );
}

function InvoicePanel({ task, onOpenFeedback }: { task: Task; onOpenFeedback: () => void }) {
  const [inputExpanded, setInputExpanded] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [zoom, setZoom] = useState(1);

  return (
    <div className="flex flex-col gap-4">
      {/* Input card */}
      <div className="bg-white rounded-lg border border-tipalti-border shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-tipalti-border bg-tipalti-bg-light">
          <p className="text-[11px] font-semibold text-tipalti-text-muted uppercase tracking-wide">Input</p>
          <a href="#" className="flex items-center gap-1 text-[11px] font-medium text-tipalti-blue hover:underline">
            Open in Bills
            <svg width="9" height="9" viewBox="0 0 11 11" fill="none">
              <path d="M4.5 2H2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.5M6.5 1H10m0 0v3.5M10 1 5 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
        <AnnotationZone label="Consumer" description="Consumer selects which artifact component to display here (document, structured data, free text)." rounded="rounded-b-lg">

        {/* File type row — click to expand */}
        <div
          className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors select-none"
          onClick={() => setInputExpanded((v) => !v)}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-tipalti-bg-light border border-tipalti-border flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="2" y="1" width="8" height="12" rx="1" stroke="#5E6C84" strokeWidth="1.2" />
                <path d="M8 1v3h3" stroke="#5E6C84" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 7h6M4 9.5h4" stroke="#5E6C84" strokeWidth="1.1" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-[12px] font-medium text-tipalti-text-primary">Invoice</p>
              <p className="text-[11px] text-tipalti-text-muted font-mono">{task.invoiceNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {inputExpanded && (
              <button
                onClick={(e) => { e.stopPropagation(); setMaximized(true); }}
                className="p-1 text-tipalti-text-muted hover:text-tipalti-text-primary transition-colors"
                title="Maximize"
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            <svg
              width="14" height="14" viewBox="0 0 14 14" fill="none"
              className={`text-tipalti-text-muted transition-transform ${inputExpanded ? "rotate-180" : ""}`}
            >
              <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Expanded: full document */}
        {inputExpanded && (
          <div className="border-t border-tipalti-border bg-[#E8EAED] px-4 py-4 flex justify-center">
            <InvoiceDocument task={task} />
          </div>
        )}
        </AnnotationZone>
      </div>

      <OutcomeCard task={task} />

      {/* Feedback */}
      <FeedbackCard override={task.userOverride} fields={task.feedbackFields} onOpenFeedback={onOpenFeedback} />

      {/* Maximize modal */}
      {maximized && (
        <Portal>
          <div
            className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-8 pb-8 px-8"
            onClick={(e) => { if (e.target === e.currentTarget) { setMaximized(false); setZoom(1); } }}
          >
            <div className="bg-white rounded-xl shadow-2xl flex flex-col w-full max-w-2xl" style={{ maxHeight: "90vh" }}>
              {/* Toolbar */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-tipalti-border flex-shrink-0">
                <span className="text-[12px] font-semibold text-tipalti-text-primary">{task.invoiceNumber}</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-0.5 border border-tipalti-border rounded-md px-1 py-0.5">
                    <button
                      onClick={() => setZoom((z) => Math.max(0.5, Math.round((z - 0.25) * 100) / 100))}
                      disabled={zoom <= 0.5}
                      className="w-6 h-6 flex items-center justify-center text-[16px] text-tipalti-text-muted hover:text-tipalti-text-primary disabled:opacity-30 transition-colors leading-none"
                    >−</button>
                    <span className="text-[11px] text-tipalti-text-muted w-9 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
                    <button
                      onClick={() => setZoom((z) => Math.min(3, Math.round((z + 0.25) * 100) / 100))}
                      disabled={zoom >= 3}
                      className="w-6 h-6 flex items-center justify-center text-[16px] text-tipalti-text-muted hover:text-tipalti-text-primary disabled:opacity-30 transition-colors leading-none"
                    >+</button>
                  </div>
                  <button
                    onClick={() => { setMaximized(false); setZoom(1); }}
                    className="p-1 text-tipalti-text-muted hover:text-tipalti-text-primary transition-colors"
                  >
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 3l8 8M11 3l-8 8" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
              {/* Scrollable content with zoom */}
              <div className="flex-1 overflow-auto bg-[#E8EAED] p-6" style={{ minHeight: 0 }}>
                <div style={{ zoom: zoom }}>
                  <InvoiceDocument task={task} />
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

// ─── Right column: 3-column log table ─────────────────────────────────────────

function SortIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="inline-block ml-1 opacity-40 flex-shrink-0">
      <path d="M4 4.5L6 2.5L8 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 7.5L6 9.5L8 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const REASONING_TRUNCATE = 110;

function ReasoningLog({ task }: { task: Task }) {
  const [search, setSearch] = useState("");
  const log = task.log ?? [];
  const filtered = search
    ? log.filter((e) =>
        e.action.toLowerCase().includes(search.toLowerCase()) ||
        e.detail.toLowerCase().includes(search.toLowerCase()) ||
        e.reasoning.toLowerCase().includes(search.toLowerCase())
      )
    : log;

  return (
    <div className="flex flex-col h-full">
      {/* Title + steps + search — single row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-tipalti-text-primary">Agent Trace</h2>
          <span className="text-sm text-tipalti-text-muted">{log.length} steps</span>
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-tipalti-text-muted" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
            <circle cx="6" cy="6" r="4.5" />
            <path d="M9.5 9.5L13 13" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-sm border border-tipalti-border rounded-md bg-white pl-9 pr-3 py-1.5 text-tipalti-text-primary focus:outline-none focus:ring-2 focus:ring-tipalti-blue w-48"
          />
        </div>
      </div>

      {/* Table — flat, border-t opens it */}
      <div className="flex-1 overflow-y-auto border-t border-tipalti-border">
        {/* Column headers */}
        <div className="grid grid-cols-[110px_1.4fr_2fr] gap-4 px-4 py-3 border-b border-tipalti-border sticky top-0 bg-white z-10">
          {["Type", "Action", "Reasoning"].map((col) => (
            <button key={col} className="flex items-center text-sm font-semibold text-tipalti-text-primary text-left hover:text-tipalti-blue transition-colors">
              {col}
              <SortIcon />
            </button>
          ))}
        </div>

        <AnnotationZone label="Consumer" description="Consumer provides all trace data: each step's action type, action detail, and reasoning text." rounded="rounded-none">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-tipalti-text-muted">No log entries match your search.</p>
          </div>
        ) : (
          filtered.map((entry) => {
            if (entry.action === "Human") {
              return (
                <div
                  key={entry.id}
                  className="grid grid-cols-[110px_1.4fr_2fr] gap-4 px-4 py-3.5 border-b border-tipalti-border last:border-b-0 bg-violet-50 items-start"
                >
                  <div className="pt-0.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 whitespace-nowrap">
                      <PersonIcon size={10} />
                      Human
                    </span>
                  </div>
                  <p className="text-sm font-medium text-tipalti-text-primary leading-relaxed col-span-2">{entry.detail}</p>
                </div>
              );
            }
            return (
              <div
                key={entry.id}
                className="grid grid-cols-[110px_1.4fr_2fr] gap-4 px-4 py-3.5 border-b border-tipalti-border last:border-b-0 hover:bg-[#FAFBFF] transition-colors items-start"
              >
                <div className="pt-0.5">
                  <LogActionBadge action={entry.action} />
                </div>
                <p className="text-sm text-tipalti-text-primary leading-relaxed">{entry.detail}</p>
                <div className="relative group/reasoning">
                  <p className="text-sm text-tipalti-text-secondary leading-relaxed">
                    {entry.reasoning.length > REASONING_TRUNCATE
                      ? entry.reasoning.slice(0, REASONING_TRUNCATE).trimEnd() + "…"
                      : entry.reasoning}
                  </p>
                  {entry.reasoning.length > REASONING_TRUNCATE && (
                    <div className="absolute bottom-full left-0 mb-2 w-80 bg-tipalti-text-primary text-white text-[11px] leading-snug px-3 py-2.5 rounded-lg shadow-xl invisible group-hover/reasoning:visible z-30 pointer-events-none">
                      {entry.reasoning}
                      <div className="absolute top-full left-5 border-4 border-transparent border-t-tipalti-text-primary" />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        </AnnotationZone>
      </div>
    </div>
  );
}

// ─── Main layout ──────────────────────────────────────────────────────────────

export default function WorkItemDetail({ task }: { task: Task }) {
  const router = useRouter();
  const [feedbackChatOpen, setFeedbackChatOpen] = useState(false);

  const formatProcessedDate = (dt: string) =>
    new Date(dt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const formatProcessedTime = (dt: string) =>
    new Date(dt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  return (
    <AnnotationProvider>
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page header */}
      <AnnotationZone label="Fixed" description="Platform computes all header metadata: item title, status, date, time, duration, and credits." rounded="rounded-none" labelPosition="top">
      <div className="px-6 pt-3 pb-2.5 border-b border-tipalti-border bg-white flex-shrink-0">
        {/* Vendor name row: arrow + name + pills + open in bills */}
        <div className="flex items-center gap-2 mb-1">
          <button
            onClick={() => router.back()}
            className="p-1 text-tipalti-text-muted hover:text-tipalti-text-primary transition-colors rounded flex-shrink-0"
            aria-label="Back to Work Items"
          >
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
              <path d="M9 11.5L4.5 7 9 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="text-[20px] font-bold text-tipalti-text-primary leading-tight">
            {task.vendor} - {task.currency === "USD" ? "$" : `${task.currency} `}{task.amount.toLocaleString("en-US")}
          </h1>
          <StatusPill task={task} />
          {task.aiSummary && (
            <button
              onClick={() => setFeedbackChatOpen(true)}
              className="ml-auto flex items-center gap-1.5 text-[12px] font-medium text-tipalti-blue border border-tipalti-blue rounded-md px-2.5 py-1 hover:bg-blue-50 transition-colors whitespace-nowrap flex-shrink-0"
            >
              <DiamondIcon size={10} />
              Ask AI
            </button>
          )}
        </div>
        {/* Subtitle */}
        <div className="flex items-center pl-7 text-[12px] text-tipalti-text-muted">
          <span>{formatProcessedDate(task.processedAt)}</span>
          <span className="mx-1.5 select-none">·</span>
          <span>{formatProcessedTime(task.processedAt)}</span>
          <span className="mx-1.5 select-none">·</span>
          <span>{task.processingDuration}</span>
          <span className="mx-1.5 select-none">·</span>
          <span>{task.credits} credits</span>
        </div>
      </div>
      </AnnotationZone>

      {/* Two-column body */}
      <div className="flex-1 overflow-hidden grid grid-cols-[360px_1fr] gap-0">
        {/* Left: input + outcome */}
        <div className="border-r border-tipalti-border bg-tipalti-bg-light overflow-y-auto p-5">
          <InvoicePanel task={task} onOpenFeedback={() => setFeedbackChatOpen(true)} />
        </div>

        {/* Right: agent trace */}
        <AnnotationZone label="Fixed" description="Platform owns the trace layout: column structure, action type taxonomy, badge design, step count, search, and truncation behavior." className="overflow-hidden" rounded="rounded-none">
        <div className="overflow-hidden p-5 h-full">
          <ReasoningLog task={task} />
        </div>
        </AnnotationZone>
      </div>

      {feedbackChatOpen && (
        <Portal>
          <FeedbackChatPanel task={task} onClose={() => setFeedbackChatOpen(false)} />
        </Portal>
      )}
    </div>
    <AnnotationToggle />
    </AnnotationProvider>
  );
}
