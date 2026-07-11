"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { tasks, Task } from "@/data/mockData";

// ─── Portal ───────────────────────────────────────────────────────────────────

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function DiamondIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" style={{ flexShrink: 0, display: "block" }}>
      <path d="M7 1L13 7L7 13L1 7L7 1Z" fill="#0065FF" />
    </svg>
  );
}


function SortIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="inline-block ml-1 opacity-40">
      <path d="M4 4.5L6 2.5L8 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 7.5L6 9.5L8 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Status + Human review cells ─────────────────────────────────────────────

function getDisplayStatus(task: Task): { label: string; color: "green" | "amber" | "blue" | "gray" | "red" } {
  if (task.status === "in_progress") return { label: "In progress", color: "gray" };
  if (task.status === "error")       return { label: "Error", color: "red" };
  if (task.status === "abandoned")   return { label: "Abandoned", color: "gray" };
  if (task.status === "flagged" || task.status === "pending_review") {
    return { label: "Awaiting human review", color: "amber" };
  }
  if (typeof task.userOverride === "number" && task.userOverride > 0) {
    return { label: "Accepted with edits", color: "blue" };
  }
  if (task.status === "auto_approved") {
    return { label: "Auto-completed", color: "green" };
  }
  return { label: "Accepted", color: "green" };
}

function StatusCell({ task }: { task: Task }) {
  const { label, color } = getDisplayStatus(task);
  const cls = {
    green: "bg-tipalti-success-bg text-tipalti-success",
    amber: "bg-tipalti-warning-bg text-tipalti-warning",
    blue:  "bg-blue-50 text-tipalti-blue",
    gray:  "bg-gray-100 text-gray-500",
    red:   "bg-red-50 text-red-600",
  }[color];
  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full ${cls}`}>
      {label}
    </span>
  );
}

function HumanReviewCell({ reasons }: { reasons?: string[] }) {
  if (!reasons || reasons.length === 0) return <span className="text-[13px] text-tipalti-text-muted">-</span>;
  return <span className="text-[12px] text-tipalti-text-secondary leading-tight">{reasons.join(", ")}</span>;
}

// ─── Row dropdown menu ────────────────────────────────────────────────────────

function RowMenu({ onOpenInBills, onAskAI, onClose }: {
  onOpenInBills: () => void;
  onAskAI: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-1 w-44 bg-white border border-tipalti-border rounded-lg shadow-lg z-20 overflow-hidden py-1"
    >
      <button
        onClick={(e) => { e.stopPropagation(); onOpenInBills(); onClose(); }}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-tipalti-text-primary hover:bg-tipalti-bg-light transition-colors text-left"
      >
        <svg width="13" height="13" viewBox="0 0 11 11" fill="none">
          <path d="M4.5 2H2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.5M6.5 1H10m0 0v3.5M10 1 5 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Open in Bills
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onAskAI(); onClose(); }}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-tipalti-text-primary hover:bg-tipalti-bg-light transition-colors text-left"
      >
        <DiamondIcon size={12} />
        Ask AI
      </button>
    </div>
  );
}

// ─── Ask AI panel ─────────────────────────────────────────────────────────────

interface AskMsg {
  id: string;
  role: "user" | "ai";
  text: string;
  suggestions?: string[];
}

const CONFIRM_WORDS = ["yes", "ok", "sure", "confirm", "apply", "looks good", "good", "proceed", "go ahead"];

function buildSuggestions(task: Task): string[] {
  const base = [`Update instructions for ${task.vendor}`];
  if (task.status === "flagged") base.push("What should I check before approving?");
  if (typeof task.userOverride === "number" && task.userOverride > 0) base.push("Why were fields overridden?");
  base.push("Tell me more about this invoice");
  return base;
}

function AskAIPanel({ task, onClose }: { task: Task; onClose: () => void }) {
  const [messages, setMessages] = useState<AskMsg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [pending, setPending] = useState(false);
  const msgIdRef = useRef(0);
  const initializedRef = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);

  const nextId = () => `m${++msgIdRef.current}`;
  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
  const push = (msg: Omit<AskMsg, "id">) =>
    new Promise<void>((res) => { setMessages((p) => [...p, { id: nextId(), ...msg }]); res(); });
  const aiType = async (ms = 1000) => { setTyping(true); await sleep(ms); setTyping(false); };

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const init = async () => {
      await sleep(200);
      await aiType(900);
      const summary = task.aiSummary ?? `I processed the ${task.vendor} invoice for ${task.currency} ${task.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}.`;
      await push({
        role: "ai",
        text: summary,
        suggestions: buildSuggestions(task),
      });
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const handleSend = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    setInput("");

    if (pending) {
      if (CONFIRM_WORDS.some((w) => msg.toLowerCase().includes(w))) {
        await push({ role: "user", text: msg });
        await aiType(700);
        await push({ role: "ai", text: "Done. I've added this rule to the instructions draft — it's active for new invoices from now on." });
        setPending(false);
        return;
      }
    }

    await push({ role: "user", text: msg });
    await aiType(1300);

    const lower = msg.toLowerCase();
    if (lower.includes("update instructions") || lower.includes("instruction")) {
      const rule = task.feedbackFields?.length
        ? `Always code "${task.feedbackFields[0].label}" as "${task.feedbackFields[0].humanValue}" for ${task.vendor}.`
        : `Flag any ${task.vendor} invoices with spend inconsistent with vendor history for human review.`;
      await push({
        role: "ai",
        text: `Here's the rule I'd add to your instructions:\n\n"${rule}"\n\nThis will apply to future ${task.vendor} invoices. Type "yes" to confirm.`,
      });
      setPending(true);
    } else if (lower.includes("more") || lower.includes("tell me")) {
      const flag = task.log?.find((e) => e.action === "Flag");
      await push({
        role: "ai",
        text: flag
          ? `The main thing I want to highlight: ${flag.reasoning}`
          : `Everything on this invoice matched vendor history. The only signal worth reviewing is the confidence level — ${Math.round((task.fieldStats.confident / task.fieldStats.total) * 100)}% of fields were coded with full confidence.`,
      });
    } else if (lower.includes("check") || lower.includes("approv") || lower.includes("review")) {
      await push({
        role: "ai",
        text: task.issue
          ? `Before approving, check: ${task.issue} You can open the full work item to see the agent trace.`
          : `This item looks clean — all fields coded from vendor history. You can approve it directly.`,
      });
    } else {
      await push({
        role: "ai",
        text: `I can help with that. Want me to look at the instructions for ${task.vendor}, or is there a specific field or decision you'd like me to explain?`,
        suggestions: [`Explain the coding for ${task.vendor}`, `Update instructions for ${task.vendor}`],
      });
    }
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

      {/* Context */}
      <div className="px-4 py-2 border-b border-tipalti-border flex-shrink-0">
        <p className="text-[11px] text-tipalti-text-muted text-center">
          {task.vendor} · {task.currency} {task.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
        <div className="space-y-4">
          {messages.map((msg) =>
            msg.role === "user" ? (
              <div key={msg.id} className="flex justify-end">
                <div className="bg-tipalti-bg-light border border-tipalti-border rounded-2xl rounded-tr-sm px-3 py-2 max-w-[85%]">
                  <p className="text-[13px] text-tipalti-text-primary leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ) : (
              <div key={msg.id} className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex-shrink-0"><DiamondIcon size={13} /></div>
                  <p className="flex-1 text-[13px] text-tipalti-text-primary leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
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
            placeholder="Ask about this invoice…"
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
          Tipalti AI · responses may not reflect the latest data
        </p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const TIME_OPTIONS = [
  { value: "7d",  label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" },
];

export default function ExecutionFeed() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState("7d");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [askAITask, setAskAITask] = useState<Task | null>(null);

  const filtered = useMemo(() => {
    let result = tasks;
    if (timeFilter !== "all") {
      const days = timeFilter === "7d" ? 7 : 30;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      result = result.filter((t) => new Date(t.processedAt) >= cutoff);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.vendor.toLowerCase().includes(q) ||
          t.invoiceNumber.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q)
      );
    }
    return [...result].sort(
      (a, b) => new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime()
    );
  }, [timeFilter, search]);

  const formatAmount = (amount: number) =>
    amount.toLocaleString("en-US", { maximumFractionDigits: 0 });
  const formatInvoiceDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };
  const formatProcessed = (dt: string) => {
    const d = new Date(dt);
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
    };
  };

  return (
    <div>
      {/* Filter + search row */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="appearance-none text-sm border border-tipalti-border rounded-full bg-white px-3 py-1 pr-7 text-tipalti-text-secondary focus:outline-none focus:ring-2 focus:ring-tipalti-blue cursor-pointer"
          >
            {TIME_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <svg className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-tipalti-text-muted" width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M2 4l3.5 3.5L9 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <span className="text-sm text-tipalti-text-muted">{filtered.length} items</span>

        <div className="relative ml-auto">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-tipalti-text-muted" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
            <circle cx="6" cy="6" r="4.5" />
            <path d="M9.5 9.5L13 13" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="text-sm border border-tipalti-border rounded-md bg-white pl-9 pr-3 py-1.5 text-tipalti-text-primary focus:outline-none focus:ring-2 focus:ring-tipalti-blue w-56"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border-t border-tipalti-border">
        <div className="grid grid-cols-[96px_2fr_64px_220px_170px_56px_32px] gap-4 px-4 py-3 border-b border-tipalti-border">
          {["Time", "Item", "Duration", "Review reason", "Status", "Credits"].map((col) => (
            <button key={col} className="flex items-center text-sm font-semibold text-tipalti-text-primary text-left hover:text-tipalti-blue transition-colors group">
              {col}
              <SortIcon />
            </button>
          ))}
          <div />
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-tipalti-text-muted">No items match the current filters.</p>
          </div>
        ) : (
          filtered.map((task) => (
            <div
              key={task.id}
              className="grid grid-cols-[96px_2fr_64px_220px_170px_56px_32px] gap-4 px-4 py-3.5 border-b border-tipalti-border hover:bg-[#FAFBFF] transition-colors group items-center cursor-pointer"
              onClick={() => router.push(`/work-items/${task.id}`)}
            >
              <div>
                <p className="text-sm text-tipalti-text-secondary">{formatProcessed(task.processedAt).date}</p>
                <p className="text-[11px] text-tipalti-text-muted">{formatProcessed(task.processedAt).time}</p>
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-tipalti-text-primary truncate group-hover:text-tipalti-blue transition-colors">
                  {task.vendor}
                </p>
                <p className="text-[11px] text-tipalti-text-muted mt-0.5">
                  {formatInvoiceDate(task.date)} · {task.currency} {formatAmount(task.amount)}
                </p>
              </div>

              <span className="text-sm text-tipalti-text-secondary font-mono">{task.processingDuration}</span>

              <HumanReviewCell reasons={task.humanReviewReason} />
              <StatusCell task={task} />
              <span className="text-[13px] text-tipalti-text-secondary">{task.credits}</span>

              {/* 3-dot menu */}
              <div
                className="relative flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="opacity-0 group-hover:opacity-100 text-tipalti-text-muted hover:text-tipalti-text-primary transition-all p-1 rounded"
                  onClick={() => setOpenMenuId(openMenuId === task.id ? null : task.id)}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                    <circle cx="7" cy="2.5" r="1.2" />
                    <circle cx="7" cy="7" r="1.2" />
                    <circle cx="7" cy="11.5" r="1.2" />
                  </svg>
                </button>
                {openMenuId === task.id && (
                  <RowMenu
                    onOpenInBills={() => window.open("#", "_blank")}
                    onAskAI={() => setAskAITask(task)}
                    onClose={() => setOpenMenuId(null)}
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded border border-tipalti-border text-tipalti-text-muted hover:text-tipalti-text-primary hover:border-tipalti-text-muted transition-colors disabled:opacity-40" disabled>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 11.5L4.5 7 9 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="text-sm font-medium text-tipalti-text-primary px-1">1</span>
          <button className="p-1.5 rounded border border-tipalti-border text-tipalti-text-muted hover:text-tipalti-text-primary hover:border-tipalti-text-muted transition-colors disabled:opacity-40" disabled>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2.5L9.5 7 5 11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <span className="text-sm text-tipalti-text-muted">{filtered.length} items · 1 page</span>
      </div>

      {/* Ask AI panel — portaled to body */}
      {askAITask && (
        <Portal>
          <AskAIPanel task={askAITask} onClose={() => setAskAITask(null)} />
        </Portal>
      )}
    </div>
  );
}
