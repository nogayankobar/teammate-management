"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { instructionVersions, InstructionVersion } from "@/data/mockData";

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(content: string): string[] {
  const warnings: string[] = [];
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  lines.forEach((line, i) => {
    if (line.length < 8) warnings.push(`Line ${i + 1} seems incomplete: "${line}"`);
  });
  const alwaysLines = lines.filter((l) => l.toLowerCase().includes("always"));
  const neverLines  = lines.filter((l) => l.toLowerCase().includes("never"));
  const stopWords   = new Set(["always", "never", "should", "invoice", "route"]);
  alwaysLines.forEach((al) => {
    const alWords = al.toLowerCase().split(/\W+/).filter((w) => w.length > 4 && !stopWords.has(w));
    neverLines.forEach((nl) => {
      const nlWords = nl.toLowerCase().split(/\W+/).filter((w) => w.length > 4 && !stopWords.has(w));
      if (alWords.some((w) => nlWords.includes(w))) {
        warnings.push(`Possible contradiction: "${al}" and "${nl}"`);
      }
    });
  });
  return warnings;
}

// ─── Conflict detection ───────────────────────────────────────────────────────

function detectConflictPairs(content: string): Array<[string, string]> {
  const pairs: Array<[string, string]> = [];
  const bullets = content
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("- ") || l.startsWith("* "))
    .map((l) => l.slice(2).trim());

  const bySubject = new Map<string, string[]>();
  for (const bullet of bullets) {
    const idx = bullet.indexOf("→");
    if (idx > -1) {
      const subject = bullet.slice(0, idx).trim().toLowerCase();
      if (!bySubject.has(subject)) bySubject.set(subject, []);
      bySubject.get(subject)!.push(bullet);
    }
  }

  for (const group of Array.from(bySubject.values())) {
    if (group.length > 1) {
      const actions = new Set(
        group.map((l) => l.slice(l.indexOf("→") + 1).trim().toLowerCase())
      );
      if (actions.size > 1) {
        pairs.push([group[0], group[1]]);
      }
    }
  }

  return pairs;
}

// ─── Method badge ─────────────────────────────────────────────────────────────

function MethodBadge({ method }: { method: InstructionVersion["method"] }) {
  const cfg = {
    manual: { label: "Manual",      className: "bg-gray-100 text-gray-600" },
    upload: { label: "File upload", className: "bg-tipalti-info-bg text-tipalti-info" },
    chat:   { label: "Chat",        className: "bg-tipalti-purple-bg text-tipalti-purple" },
  };
  const c = cfg[method];
  return <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${c.className}`}>{c.label}</span>;
}

// ─── Markdown preview ─────────────────────────────────────────────────────────

function renderInline(text: string): JSX.Element {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold text-tipalti-text-primary">{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function MarkdownPreview({ content, conflictSet }: { content: string; conflictSet?: Set<string> }): JSX.Element {
  const lines = content.split("\n");
  const elements: JSX.Element[] = [];
  let bulletBuffer: Array<{ text: string; conflict: boolean }> = [];
  let key = 0;

  const flushBullets = () => {
    if (!bulletBuffer.length) return;
    const buf = [...bulletBuffer];
    bulletBuffer = [];
    elements.push(
      <ul key={key++} className="my-3 space-y-1.5 pl-2">
        {buf.map((item, i) =>
          item.conflict ? (
            <li key={i} className="text-sm text-tipalti-text-primary leading-relaxed flex gap-2 rounded-md bg-red-50 border border-red-200 px-2.5 py-1.5 -mx-0.5">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="#DE350B" strokeWidth="1.4" className="flex-shrink-0 mt-0.5" style={{ display: "block" }}>
                <path d="M7 1.5L1 12.5h12L7 1.5z" strokeLinejoin="round" />
                <path d="M7 6v2.5M7 10.5v.5" strokeLinecap="round" />
              </svg>
              <span>{renderInline(item.text)}</span>
            </li>
          ) : (
            <li key={i} className="text-sm text-tipalti-text-primary leading-relaxed flex gap-2.5">
              <span className="text-tipalti-text-muted mt-0.5 flex-shrink-0 select-none">·</span>
              <span>{renderInline(item.text)}</span>
            </li>
          )
        )}
      </ul>
    );
  };

  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("## ")) {
      flushBullets();
      elements.push(
        <h2 key={key++} className="text-[15px] font-semibold text-tipalti-text-primary mt-6 mb-2 pb-1.5 border-b border-tipalti-border">
          {renderInline(t.slice(3))}
        </h2>
      );
    } else if (t.startsWith("### ")) {
      flushBullets();
      elements.push(
        <h3 key={key++} className="text-sm font-semibold text-tipalti-text-primary mt-5 mb-1.5">
          {renderInline(t.slice(4))}
        </h3>
      );
    } else if (t.startsWith("- ") || t.startsWith("* ")) {
      const bulletText = t.slice(2);
      bulletBuffer.push({ text: bulletText, conflict: !!conflictSet?.has(bulletText) });
    } else if (t === "") {
      flushBullets();
    } else {
      flushBullets();
      elements.push(
        <p key={key++} className="text-sm text-tipalti-text-primary leading-relaxed my-2">
          {renderInline(t)}
        </p>
      );
    }
  }
  flushBullets();

  if (!elements.length) {
    return (
      <div className="px-6 py-10 flex items-center justify-center">
        <p className="text-sm text-tipalti-text-muted italic">No instructions yet.</p>
      </div>
    );
  }
  return <div className="px-6 py-5">{elements}</div>;
}

// ─── Chat panel ───────────────────────────────────────────────────────────────

interface ChatMsg {
  id: string;
  role: "user" | "ai";
  text: string;
  options?: Array<{ label: string; value: string }>;
  viewInstructions?: boolean;
}

function DiamondIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" style={{ flexShrink: 0, display: "block" }}>
      <path d="M7 1L13 7L7 13L1 7L7 1Z" fill="#0065FF" />
    </svg>
  );
}

function ChatPanel({
  messages,
  input,
  isTyping,
  onInputChange,
  onSend,
  onClose,
  onOptionSelect,
  onViewInstructions,
}: {
  messages: ChatMsg[];
  input: string;
  isTyping: boolean;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onClose: () => void;
  onOptionSelect: (msgId: string, value: string) => void;
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
              Ask me to add, update, or remove rules from your instructions.
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
                  {msg.options && (
                    <div className="flex flex-col gap-1.5 mt-3">
                      {msg.options.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => onOptionSelect(msg.id, opt.value)}
                          className="text-left text-[12px] font-medium text-tipalti-blue border border-tipalti-blue rounded-md px-2.5 py-1.5 hover:bg-blue-50 transition-colors"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
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
            placeholder="Message Tipalti AI"
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

export default function Instructions() {
  const activeVersion = instructionVersions[0];

  // Instructions state
  const [mode, setMode]             = useState<"preview" | "edit">("preview");
  const [content, setContent]       = useState(activeVersion.content);
  const [isDirty, setIsDirty]       = useState(false);
  const [warnings, setWarnings]     = useState<string[]>([]);
  const [showWarnings, setShowWarnings] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [draftSaved, setDraftSaved]     = useState(false);
  const [historyOpen, setHistoryOpen]   = useState(false);
  const [versions, setVersions]         = useState<InstructionVersion[]>(instructionVersions);
  const [published, setPublished]       = useState(activeVersion);
  const fileRef = useRef<HTMLInputElement>(null);

  // Chat state
  const [chatOpen, setChatOpen]         = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput]       = useState("");
  const [isTyping, setIsTyping]         = useState(false);
  const [pendingContent, setPendingContent] = useState<string | null>(null);
  const [pendingMethod, setPendingMethod]   = useState<InstructionVersion["method"]>("chat");
  const msgId = useRef(0);

  // Conflict detection
  const conflictPairs = useMemo(() => detectConflictPairs(content), [content]);
  const conflictSet = useMemo(() => {
    const s = new Set<string>();
    conflictPairs.forEach(([a, b]) => { s.add(a); s.add(b); });
    return s;
  }, [conflictPairs]);

  const nextId = () => `m${++msgId.current}`;

  const pushMsg = (role: "user" | "ai", text: string, extras?: Partial<ChatMsg>) =>
    new Promise<string>((resolve) => {
      const id = nextId();
      setChatMessages((prev) => [...prev, { id, role, text, ...extras }]);
      resolve(id);
    });

  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  const aiType = async (ms = 1400) => {
    setIsTyping(true);
    await sleep(ms);
    setIsTyping(false);
  };

  // ── Conflict resolution chat ─────────────────────────────────────────────────

  const openChatForConflict = async () => {
    setChatMessages([]);
    setChatInput("");
    setPendingContent(null);
    setPendingMethod("chat");
    setChatOpen(true);
    await sleep(250);
    await aiType(900);
    if (conflictPairs.length > 0) {
      const [rule1, rule2] = conflictPairs[0];
      const dest1 = rule1.split("→")[1]?.trim() ?? rule1;
      const dest2 = rule2.split("→")[1]?.trim() ?? rule2;
      await pushMsg(
        "ai",
        `I found a conflict in your **Routing** instructions:\n\n• "${rule1}"\n• "${rule2}"\n\nBoth rules match the same invoices but route to different approvers. Which one should take priority?`,
        {
          options: [
            { label: `Keep: ${dest1}`, value: "keep_first" },
            { label: `Keep: ${dest2}`, value: "keep_second" },
          ],
        }
      );
    }
  };

  // ── Upload flow ─────────────────────────────────────────────────────────────

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const fileText = (evt.target?.result as string) ?? "";
      e.target.value = "";
      setChatOpen(true);
      setChatMessages([]);
      await sleep(150);
      runUploadFlow(file.name, fileText);
    };
    reader.readAsText(file);
  };

  const runUploadFlow = async (filename: string, fileText: string) => {
    await pushMsg("user", `Uploading ${filename}`);

    await aiType(1600);
    await pushMsg("ai", `I've received **${filename}**. Reviewing the content now...`);

    await aiType(2200);
    await pushMsg(
      "ai",
      `Here's what I found:\n\n• 3 new routing rules\n• 1 updated threshold (MoM flag raised from 20% → 25%)\n• 1 new vendor exception\n\n⚠️ Potential conflict detected:\n\n"Auto-approve recurring SaaS invoices under $1,000" may conflict with the existing rule "Flag all new vendor invoices for manual review regardless of amount."\n\nIf a new SaaS vendor's first invoice is under $1,000, these rules produce conflicting behavior. How would you like to handle this?`,
      {
        options: [
          { label: "New vendors always flagged first, then SaaS rule applies", value: "flag_new" },
          { label: "Keep both — I'll decide case by case", value: "keep_both" },
        ],
      }
    );

    // Build what will become the pending content
    const newContent =
      fileText.trim() ||
      content +
        `\n\n## Vendor Exceptions\n\n- Recurring SaaS invoices from known vendors under $1,000 may be auto-approved. New vendors always require manual review regardless of amount.\n- Figma invoices should always be routed to VP Design for approval.\n\n## Updated Thresholds\n\n- Month-over-month variance flag threshold updated from 20% to 25% for cloud infrastructure vendors.`;

    setPendingContent(newContent);
    setPendingMethod("upload");
  };

  // ── Option selected (upload flow or conflict resolution) ────────────────────

  const handleOptionSelect = async (msgId: string, value: string) => {
    setChatMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, options: undefined } : m))
    );

    const nextVer = versions[0].version + 1;

    // Conflict resolution
    if (value === "keep_first" || value === "keep_second") {
      const [rule1, rule2] = conflictPairs[0] ?? ["", ""];
      const keepRule  = value === "keep_first" ? rule1 : rule2;
      const dropRule  = value === "keep_first" ? rule2 : rule1;
      const keepLabel = keepRule.split("→")[1]?.trim() ?? keepRule;

      await pushMsg("user", `Keep: ${keepLabel}`);
      await aiType(1200);

      const newContent = content
        .split("\n")
        .filter((l) => {
          const t = l.trim();
          return !(t.startsWith("- ") && t.slice(2).trim() === dropRule);
        })
        .join("\n");

      setPendingContent(newContent);
      setPendingMethod("chat");
      await pushMsg(
        "ai",
        `Got it. I'll remove the conflicting rule:\n\n"${dropRule}"\n\nAnd keep:\n\n"${keepRule}"\n\nThis will become version ${nextVer}. Type "yes" to confirm.`
      );
      return;
    }

    // Upload flow options
    if (value === "flag_new") {
      await pushMsg("user", "New vendors always flagged first, then SaaS rule applies");
      await aiType(1400);
      await pushMsg(
        "ai",
        `Got it. I'll add a clarification: "For new vendors: always flag for review regardless of amount. For known vendors: auto-approve recurring SaaS invoices under $1,000."\n\nThis will become version ${nextVer}. Type "yes" to confirm.`
      );
    } else {
      await pushMsg("user", "Keep both — I'll decide case by case");
      await aiType(1000);
      await pushMsg(
        "ai",
        `Understood. Both rules are kept as written. This will become version ${nextVer}. Type "yes" to confirm.`
      );
    }
  };

  // ── Apply (from any chat flow) ───────────────────────────────────────────────

  const handleApply = async () => {
    const newContent = pendingContent ?? content;
    const nextVer = versions[0].version + 1;
    const next: InstructionVersion = {
      version: nextVer,
      content: newContent,
      publishedAt: new Date().toISOString(),
      publishedBy: "Noga Yankobar",
      method: pendingMethod,
    };
    setVersions([next, ...versions]);
    setPublished(next);
    setContent(newContent);
    setIsDirty(false);
    setPendingContent(null);

    await aiType(800);
    await pushMsg("ai", `Done. Instructions updated to v${nextVer}. Changes are now active for new work items.`, {
      viewInstructions: true,
    });
  };

  // ── Chat send (user-initiated edit) ─────────────────────────────────────────

  const CONFIRM_WORDS = ["yes", "ok", "sure", "confirm", "apply", "looks good", "good", "proceed", "go ahead", "do it"];

  const handleChatSend = async () => {
    const text = chatInput.trim();
    if (!text) return;
    setChatInput("");

    // If there's a pending change waiting for confirmation, check if this is a confirm
    if (pendingContent !== null) {
      const lower = text.toLowerCase();
      if (CONFIRM_WORDS.some((w) => lower.includes(w))) {
        await pushMsg("user", text);
        await handleApply();
        return;
      }
    }

    await pushMsg("user", text);
    await aiType(1800);

    const lower = text.toLowerCase();
    const nextVer = versions[0].version + 1;

    let aiResponse: string;
    let newContent: string;

    if (lower.includes("remove") || lower.includes("delete")) {
      const ruleText = text.replace(/^(remove|delete)\s+(rule\s*:?\s*)?/i, "");
      aiResponse = `I'll remove this rule from your instructions:\n\n"${ruleText}"\n\nNo other rules will be affected. This will become version ${nextVer}. Type "yes" to confirm.`;
      newContent = content;
    } else {
      const ruleText = text
        .replace(/^(add|create|include|set|make sure|ensure)\s+(a\s+)?(rule\s*:?\s*|that\s+)?/i, "")
        .replace(/^[^A-Za-z0-9]/, "");
      const formattedRule =
        ruleText.charAt(0).toUpperCase() + ruleText.slice(1);
      aiResponse = `Got it. Here's what I'll add to your instructions:\n\n"${formattedRule}"\n\nNo conflicts with existing rules found. This will become version ${nextVer}. Type "yes" to confirm.`;
      newContent = content + `\n- ${formattedRule}`;
    }

    setPendingContent(newContent);
    setPendingMethod("chat");
    await pushMsg("ai", aiResponse);
  };

  // ── UI edit mode handlers ────────────────────────────────────────────────────

  const handleChange = (value: string) => {
    setContent(value);
    setIsDirty(value !== published.content);
    setDraftSaved(false);
    setShowWarnings(false);
    setShowConfirm(false);
  };

  const handleEnterEdit = () => setMode("edit");

  const handleCancel = () => {
    if (isDirty) {
      if (!window.confirm("Discard unsaved changes?")) return;
      setContent(published.content);
      setIsDirty(false);
    }
    setDraftSaved(false);
    setShowWarnings(false);
    setShowConfirm(false);
    setMode("preview");
  };

  const handleSaveDraft = () => {
    const w = validate(content);
    setWarnings(w);
    setShowWarnings(w.length > 0);
    setDraftSaved(true);
  };

  const handlePublish = () => {
    const w = validate(content);
    setWarnings(w);
    if (w.length > 0) {
      setShowWarnings(true);
      setShowConfirm(true);
    } else {
      doPublish();
    }
  };

  const doPublish = () => {
    const next: InstructionVersion = {
      version: versions[0].version + 1,
      content,
      publishedAt: new Date().toISOString(),
      publishedBy: "Noga Yankobar",
      method: "manual",
    };
    setVersions([next, ...versions]);
    setPublished(next);
    setIsDirty(false);
    setDraftSaved(false);
    setShowWarnings(false);
    setShowConfirm(false);
    setWarnings([]);
    setMode("preview");
  };

  const handleRevert = (v: InstructionVersion) => {
    setContent(v.content);
    setIsDirty(v.content !== published.content);
    setDraftSaved(false);
    setShowWarnings(false);
    setMode("edit");
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Section title */}
      <div className="mb-4">
        <h2 className="text-[14px] font-semibold text-tipalti-text-primary">Instructions</h2>
        <p className="text-[12px] text-tipalti-text-muted mt-0.5 leading-relaxed">
          Behavioral rules written in plain language — how this teammate should act in specific situations.
        </p>
      </div>

      {/* Instructions card */}
      <div>

        {/* ── Instructions card ─────────────────────────────────────────── */}
        <div
          className={`flex flex-col bg-white rounded-lg overflow-hidden shadow-card border transition-colors w-full ${isDirty ? "border-tipalti-blue" : "border-tipalti-border"}`}
          style={{ minHeight: "calc(100vh - 380px)" }}
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-tipalti-border bg-tipalti-bg-light min-h-[44px] flex-shrink-0">
            {mode === "preview" ? (
              <>
                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] font-semibold text-tipalti-success bg-tipalti-success-bg px-2 py-0.5 rounded-full">
                    v{published.version}
                  </span>
                  <p className="text-[12px] text-tipalti-text-secondary">
                    Last published by{" "}
                    <span className="font-medium text-tipalti-text-primary">{published.publishedBy}</span>
                    {" · "}{formatDate(published.publishedAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Clock — version history */}
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
                            <p className="text-[11px] font-semibold text-tipalti-text-muted uppercase tracking-wide">Version history</p>
                          </div>
                          <div className="divide-y divide-tipalti-border max-h-72 overflow-y-auto">
                            {versions.map((v) => (
                              <div key={v.version} className="flex items-center gap-4 px-4 py-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-[12px] font-semibold text-tipalti-text-primary">v{v.version}</span>
                                    <MethodBadge method={v.method} />
                                    {v.version === published.version && (
                                      <span className="text-[10px] font-semibold text-tipalti-success bg-tipalti-success-bg px-1.5 py-0.5 rounded-full">Active</span>
                                    )}
                                  </div>
                                  <p className="text-[12px] text-tipalti-text-secondary">
                                    {formatDate(v.publishedAt)} · {v.publishedBy}
                                  </p>
                                </div>
                                <button
                                  onClick={() => { handleRevert(v); setHistoryOpen(false); }}
                                  disabled={v.version === published.version}
                                  className="text-[12px] font-medium text-tipalti-blue hover:underline disabled:text-tipalti-text-muted disabled:no-underline disabled:cursor-default"
                                >
                                  {v.version === published.version ? "Current" : "Revert"}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Ask AI */}
                  <button
                    onClick={() => {
                      setChatMessages([]);
                      setChatInput("");
                      setPendingContent(null);
                      setChatOpen(true);
                    }}
                    className="flex items-center gap-1.5 text-[12px] font-medium text-tipalti-blue border border-tipalti-blue rounded-md px-2.5 py-1.5 bg-white hover:bg-blue-50 transition-colors"
                  >
                    <svg width="11" height="11" viewBox="0 0 14 14" style={{ flexShrink: 0 }}>
                      <path d="M7 1L13 7L7 13L1 7L7 1Z" fill="#0065FF" />
                    </svg>
                    Ask AI
                  </button>

                  {/* Upload file */}
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-1.5 text-[12px] font-medium text-tipalti-text-secondary border border-tipalti-border rounded-md px-2.5 py-1.5 bg-white hover:bg-tipalti-bg-light transition-colors"
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <path d="M6.5 8.5V2.5M4 5l2.5-2.5L9 5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M1.5 10.5h10" strokeLinecap="round" />
                    </svg>
                    Upload file
                  </button>

                  {/* Edit */}
                  <button
                    onClick={handleEnterEdit}
                    className="flex items-center gap-1.5 text-[12px] font-semibold text-white bg-tipalti-blue rounded-md px-3 py-1.5 hover:bg-tipalti-blue-hover transition-colors shadow-sm"
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <path d="M9 2L11 4L5 10H3V8L9 2Z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Edit
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  {isDirty ? (
                    <span className="text-[10px] font-medium text-tipalti-warning bg-tipalti-warning-bg px-1.5 py-0.5 rounded">
                      Unsaved changes
                    </span>
                  ) : draftSaved ? (
                    <span className="text-[10px] font-medium text-tipalti-text-muted bg-gray-100 px-1.5 py-0.5 rounded">
                      Draft saved
                    </span>
                  ) : (
                    <span className="text-[12px] text-tipalti-text-muted">Editing</span>
                  )}
                </div>
                <button
                  onClick={handleCancel}
                  className="text-[12px] font-medium text-tipalti-text-secondary hover:text-tipalti-text-primary transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
          </div>

          {/* Card body */}
          {mode === "preview" ? (
            <div className="flex-1">
              {/* Conflict banner */}
              {conflictPairs.length > 0 && (
                <div className="mx-5 mt-3.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 flex items-center gap-2.5">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#DE350B" strokeWidth="1.4" style={{ flexShrink: 0 }}>
                    <path d="M7 1.5L1 12.5h12L7 1.5z" strokeLinejoin="round" />
                    <path d="M7 5.5v3M7 10v.5" strokeLinecap="round" />
                  </svg>
                  <p className="text-[12px] text-red-800 flex-1">
                    <span className="font-semibold">{conflictPairs.length} conflict detected</span>
                    {" — "}2 rules apply to &ldquo;{conflictPairs[0][0].split("→")[0].trim()}&rdquo; but route to different approvers.
                  </p>
                  <button
                    onClick={openChatForConflict}
                    className="text-[12px] font-semibold text-tipalti-blue hover:underline whitespace-nowrap flex-shrink-0 flex items-center gap-1"
                  >
                    Resolve with AI
                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <path d="M2 8L8 2M8 2H5M8 2V5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              )}
              <MarkdownPreview content={content} conflictSet={conflictSet} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <textarea
                value={content}
                onChange={(e) => handleChange(e.target.value)}
                className="flex-1 w-full px-6 py-5 text-sm text-tipalti-text-primary leading-relaxed resize-none focus:outline-none"
                style={{ minHeight: "calc(100vh - 480px)" }}
                placeholder={"Add instructions for the AP Specialist. For example:\n- Figma invoices → always route to VP Design\n- Escalate any new vendor regardless of amount"}
                spellCheck={false}
                autoFocus
              />
              {/* Warnings */}
              {showWarnings && warnings.length > 0 && (
                <div className="border-t border-yellow-200 bg-tipalti-warning-bg px-4 py-3 flex-shrink-0">
                  <p className="text-[12px] font-semibold text-tipalti-warning mb-2">
                    {warnings.length} validation {warnings.length === 1 ? "issue" : "issues"} found
                  </p>
                  <ul className="space-y-1">
                    {warnings.map((w, i) => (
                      <li key={i} className="text-[12px] text-tipalti-text-secondary flex items-start gap-1.5">
                        <span className="text-tipalti-warning mt-0.5 flex-shrink-0">·</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                  {showConfirm && (
                    <div className="mt-3 pt-3 border-t border-yellow-200 flex items-center gap-3">
                      <p className="text-[12px] text-tipalti-text-secondary flex-1">Publish anyway?</p>
                      <button onClick={() => setShowConfirm(false)} className="text-[12px] font-medium text-tipalti-text-secondary hover:text-tipalti-text-primary">
                        Cancel
                      </button>
                      <button onClick={doPublish} className="text-[12px] font-medium text-tipalti-danger hover:underline">
                        Publish with warnings
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Edit footer */}
          {mode === "edit" && (
            <div className="border-t border-tipalti-border px-4 py-3 flex items-center justify-end gap-2 bg-tipalti-bg-light flex-shrink-0">
              <button
                onClick={handleSaveDraft}
                disabled={!isDirty}
                className="text-[13px] font-medium text-tipalti-text-secondary border border-tipalti-border rounded-md px-3 py-1.5 bg-white hover:bg-tipalti-bg-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save draft
              </button>
              <button
                onClick={handlePublish}
                disabled={content === published.content && !isDirty}
                className="text-[13px] font-semibold text-white bg-tipalti-blue rounded-md px-4 py-1.5 hover:bg-tipalti-blue-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                Publish
              </button>
            </div>
          )}
        </div>

        {/* ── Chat panel ────────────────────────────────────────────────── */}
        {chatOpen && (
          <ChatPanel
            messages={chatMessages}
            input={chatInput}
            isTyping={isTyping}
            onInputChange={setChatInput}
            onSend={handleChatSend}
            onClose={() => setChatOpen(false)}
            onOptionSelect={handleOptionSelect}
            onViewInstructions={() => setChatOpen(false)}
          />
        )}
      </div>

      <input ref={fileRef} type="file" accept=".txt,.csv,.yaml,.yml" className="hidden" onChange={handleFileUpload} />
    </div>
  );
}
