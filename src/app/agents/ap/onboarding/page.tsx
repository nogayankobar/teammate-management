"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import CanvasDoc from "@/components/CanvasDoc";
import { instructionVersions } from "@/data/mockData";
import { getOnboardingResult, saveOnboardingResult } from "@/lib/onboardingStore";

// ─── Types ──────────────────────────────────────────────────────────────────────

type Mode = "setup" | "edit";

interface Suggestion {
  label: string;
  kind: "message" | "upload" | "save" | "test" | "openTest";
}

interface TestResult {
  vendor: string;
  amount: string;
  outcome: string;
  tone: "success" | "warning" | "info";
  reason: string;
}

interface ChatMsg {
  id: string;
  role: "user" | "ai";
  text: string;
  bullets?: string[];
  suggestions?: Suggestion[];
  reference?: string;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function DiamondIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" style={{ flexShrink: 0, display: "block" }}>
      <path d="M7 1L13 7L7 13L1 7L7 1Z" fill="#0065FF" />
    </svg>
  );
}

// ─── Baseline draft (setup mode) ────────────────────────────────────────────────

const BASELINE: Array<[string, string[]]> = [
  [
    "Role",
    [
      "I read every incoming invoice, capture its data, code it to the right accounts, run your checks, then route it for approval or auto-approve it.",
    ],
  ],
  ["What I handle", ["All incoming invoices, except PO-matched bills — those stay in your existing manual flow for now."]],
  [
    "Auto-approval",
    [
      "Auto-approve invoices from established vendors when the amount is in the normal range and below your approval limit.",
      "Never auto-approve the first invoice from a new vendor.",
    ],
  ],
  [
    "GL coding",
    [
      "Code each invoice to the vendor's historical accounts and cost centers.",
      "Use the department tag in the invoice description when one is present.",
    ],
  ],
];

// ─── Component ──────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("setup");
  const [ready, setReady] = useState(false);

  const [docMd, setDocMdState] = useState("");
  const docRef = useRef("");
  const [writing, setWriting] = useState(false);

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [showExit, setShowExit] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reference, setReference] = useState<{ text: string; kind: "doc" | "run" } | null>(null);
  const [rightView, setRightView] = useState<"doc" | "test">("doc");
  const [reactions, setReactions] = useState<Record<number, "up" | "down">>({});

  const msgId = useRef(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
  const nextMsg = () => `m${++msgId.current}`;

  // ── Markdown document helpers ────────────────────────────────────────────────
  const setDoc = (md: string) => {
    docRef.current = md;
    setDocMdState(md);
  };
  const hasSection = (title: string) => docRef.current.includes(`## ${title}`);

  const appendSection = (title: string, items: string[]) => {
    const body = `## ${title}\n` + items.map((i) => `- ${i}`).join("\n");
    setDoc(docRef.current ? `${docRef.current}\n\n${body}` : body);
  };

  const appendUnder = (title: string, items: string[]) => {
    if (!hasSection(title)) return appendSection(title, items);
    const lines = docRef.current.split("\n");
    const idx = lines.findIndex((l) => l.trim() === `## ${title}`);
    let end = lines.length;
    for (let i = idx + 1; i < lines.length; i++) {
      if (lines[i].trim().startsWith("## ")) {
        end = i;
        break;
      }
    }
    while (end > idx + 1 && lines[end - 1].trim() === "") end--;
    const next = [...lines.slice(0, end), ...items.map((i) => `- ${i}`), ...lines.slice(end)];
    setDoc(next.join("\n"));
  };

  const replaceReferenced = (needle: string, newText: string) => {
    const lines = docRef.current.split("\n");
    const i = lines.findIndex((l) => l.includes(needle));
    if (i === -1) return;
    lines[i] = lines[i].trim().startsWith("## ") ? `## ${newText}` : `- ${newText}`;
    setDoc(lines.join("\n"));
  };

  // ── Scroll chat to bottom ──────────────────────────────────────────────────
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Read mode from URL, run the right intro once ───────────────────────────
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const params = new URLSearchParams(window.location.search);
    const m: Mode = params.get("mode") === "edit" ? "edit" : "setup";
    setMode(m);
    setReady(true);
    if (m === "edit") runEditIntro();
    else runSetupIntro();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Chat helpers ────────────────────────────────────────────────────────────

  const pushMsg = (role: "user" | "ai", text: string, extras?: Partial<ChatMsg>) =>
    new Promise<void>((resolve) => {
      setMessages((prev) => [...prev, { id: nextMsg(), role, text, ...extras }]);
      resolve();
    });

  const aiType = async (ms = 1100) => {
    setIsTyping(true);
    await sleep(ms);
    setIsTyping(false);
  };

  const clearSuggestions = () => setMessages((prev) => prev.map((m) => ({ ...m, suggestions: undefined })));

  // ── Intros ────────────────────────────────────────────────────────────────

  async function runSetupIntro() {
    await sleep(300);
    await aiType(900);
    await pushMsg(
      "ai",
      "Let's set up your AP Agent. I'll turn the way your team handles invoices into clear instructions it follows on every bill."
    );

    // Proactive draft — write the baseline into the document.
    await sleep(500);
    setWriting(true);
    await sleep(1200);
    for (const [title, items] of BASELINE) {
      appendSection(title, items);
      await sleep(450);
    }
    setWriting(false);

    await aiType(1000);
    await pushMsg(
      "ai",
      "I've drafted a starting point based on how most finance teams process invoices — it's on the right, and you can edit it directly like a doc. Here's the gist:",
      {
        bullets: [
          "Reads and codes every incoming invoice automatically",
          "Auto-approves established vendors within your limits",
          "Holds anything new, unusual, or over limit for a human",
        ],
      }
    );

    await aiType(900);
    await pushMsg(
      "ai",
      "The fastest way to make this yours is to share your AP policy — I'll fold the specifics in. You can also just tell me a rule, or type straight into the document.",
      {
        suggestions: [
          { label: "Upload our AP policy", kind: "upload" },
          { label: "Set our approval limits", kind: "message" },
          { label: "Add a routing rule", kind: "message" },
        ],
      }
    );
  }

  async function runEditIntro() {
    const result = getOnboardingResult();
    setDoc(result?.content ?? instructionVersions[0].content);
    await sleep(300);
    await aiType(900);
    await pushMsg(
      "ai",
      "Here are your current AP Agent instructions — edit them directly, or tell me what to change and I'll update the document."
    );
    await pushMsg("ai", "", {
      suggestions: [
        { label: "Raise the approval limit", kind: "message" },
        { label: "Add a routing rule", kind: "message" },
        { label: "Upload an updated policy", kind: "upload" },
      ],
    });
  }

  // ── Upload flow ─────────────────────────────────────────────────────────────

  const triggerUpload = () => fileRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    await runUploadFlow(file?.name ?? "AP-Policy-2026.pdf");
  };

  async function runUploadFlow(filename: string) {
    clearSuggestions();
    await pushMsg("user", `Uploading ${filename}`);
    await aiType(1600);
    await pushMsg("ai", `Got it — reading **${filename}** now.`);

    setWriting(true);
    await sleep(1900);
    if (!hasSection("Escalation thresholds")) {
      appendSection("Escalation thresholds", [
        "Escalate any invoice more than **20% higher** than the same vendor's previous month.",
        "Require human sign-off before the first payment to any new vendor, regardless of amount.",
        "Send any invoice at or above **$15,000** for human review.",
      ]);
    }
    await sleep(600);
    setWriting(false);

    await aiType(900);
    await pushMsg(
      "ai",
      "I pulled the specifics out of your policy and added an **Escalation thresholds** section — a 20% month-over-month limit, new-vendor sign-off, and a $15,000 review line. Want to set up how invoices get routed next?",
      {
        suggestions: [
          { label: "Add a routing rule", kind: "message" },
          { label: "Test on 5 recent bills", kind: "test" },
          { label: "Save instructions", kind: "save" },
        ],
      }
    );
  }

  // ── Interpreting a typed / chip message ──────────────────────────────────────

  async function handleUserText(text: string) {
    clearSuggestions();
    await pushMsg("user", text);
    await aiType(1500);
    const lower = text.toLowerCase();

    if (/(except|exceed|carve|meal|receipt|per-diem|per diem|entertain|waive)/.test(lower)) {
      appendUnder("Exceptions", [cleanRule(text)]);
      await pushMsg("ai", `Added an exception:\n\n"${cleanRule(text)}"`, { suggestions: nextSuggestions() });
      return;
    }

    if (/(rout|figma|aws|vp |approver|assign)/.test(lower)) {
      if (!hasSection("Routing")) {
        appendSection("Routing", [
          "Figma invoices → always route to VP Design (Sarah Chen).",
          "Split AWS invoices by cost center using the tag in the description.",
        ]);
        await pushMsg("ai", "Done — I added a **Routing** section with two starter rules. Edit either directly, or add more.", {
          suggestions: nextSuggestions(),
        });
      } else {
        appendUnder("Routing", [cleanRule(text)]);
        await pushMsg("ai", "Added that routing rule.", { suggestions: nextSuggestions() });
      }
      return;
    }

    if (/(limit|approv|threshold|escalat|\$|amount|over )/.test(lower)) {
      if (!hasSection("Escalation thresholds")) {
        appendSection("Escalation thresholds", [
          "Escalate any invoice more than **20% higher** than the same vendor's previous month.",
          "Require human sign-off before the first payment to any new vendor, regardless of amount.",
          "Send any invoice at or above **$15,000** for human review.",
        ]);
        await pushMsg(
          "ai",
          "I added an **Escalation thresholds** section with sensible defaults. Tell me your actual limit and I'll adjust it — or edit it right in the document.",
          { suggestions: nextSuggestions() }
        );
      } else {
        appendUnder("Escalation thresholds", [cleanRule(text)]);
        await pushMsg("ai", "Updated your escalation rules.", { suggestions: nextSuggestions() });
      }
      return;
    }

    appendUnder("Exceptions", [cleanRule(text)]);
    await pushMsg("ai", `Added to your instructions:\n\n"${cleanRule(text)}"`, { suggestions: nextSuggestions() });
  }

  const cleanRule = (t: string) => {
    const r = t
      .replace(/^(add|create|include|set|make sure|ensure|please)\s+(a\s+)?(rule\s*:?\s*|that\s+)?/i, "")
      .trim();
    return r.charAt(0).toUpperCase() + r.slice(1);
  };

  const nextSuggestions = (): Suggestion[] => {
    const s: Suggestion[] = [];
    if (!hasSection("Routing")) s.push({ label: "Add a routing rule", kind: "message" });
    s.push({ label: "Test on 5 recent bills", kind: "test" });
    s.push({ label: "Save instructions", kind: "save" });
    return s;
  };

  // ── Reference (select text in the doc, ask about it) ─────────────────────────

  async function handleReferencedText(text: string, refText: string) {
    clearSuggestions();
    await pushMsg("user", text, { reference: refText });
    await aiType(1400);
    const isQuestion = /\b(why|what|how|when|which|explain|should)\b|\?/.test(text.toLowerCase());
    if (isQuestion) {
      await pushMsg(
        "ai",
        `About that line — "${refText}" — the AP Agent applies exactly this on every matching invoice before anything is auto-approved. Want me to change how it behaves?`,
        { suggestions: nextSuggestions() }
      );
    } else {
      const newText = cleanRule(text);
      replaceReferenced(refText, newText);
      await pushMsg("ai", `Done — I updated that line to:\n\n"${newText}"`, { suggestions: nextSuggestions() });
    }
  }

  // ── Send / suggestion handlers ────────────────────────────────────────────────

  const onSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    const ref = reference;
    setReference(null);
    if (ref?.kind === "run") await handleRunReferencedText(text, ref.text);
    else if (ref) await handleReferencedText(text, ref.text);
    else await handleUserText(text);
  };

  const onSuggestion = async (s: Suggestion) => {
    if (s.kind === "upload") return triggerUpload();
    if (s.kind === "save") return handleSave();
    if (s.kind === "test") return runTest();
    if (s.kind === "openTest") return setRightView("test");
    await handleUserText(s.label);
  };

  // ── Test run ─────────────────────────────────────────────────────────────────

  const computeTestResults = (): TestResult[] => {
    const doc = docMd.toLowerCase();
    const hasMoM = doc.includes("20%") || doc.includes("previous month");
    const hasHighValue = doc.includes("15,000") || doc.includes("human review");
    const hasNewVendor = doc.includes("new vendor");
    const routeFigma = doc.includes("figma");
    return [
      {
        vendor: "Google Cloud",
        amount: "$11,200",
        outcome: "Auto-approved",
        tone: "success",
        reason: "Established vendor, +1.8% vs last month - within your normal range and under your limit.",
      },
      {
        vendor: "AWS",
        amount: "$24,850",
        outcome: hasMoM || hasHighValue ? "Flagged for review" : "Auto-approved",
        tone: hasMoM || hasHighValue ? "warning" : "success",
        reason: hasMoM
          ? "Up 38% vs last month - above your 20% month-over-month limit."
          : hasHighValue
          ? "Above your $15,000 human-review line."
          : "Within normal range - no rule stopped it.",
      },
      {
        vendor: "Figma",
        amount: "$3,200",
        outcome: routeFigma ? "Routed to VP Design" : "Auto-approved",
        tone: routeFigma ? "info" : "success",
        reason: routeFigma
          ? "Routed to VP Design (Sarah Chen), per your routing rule."
          : "Recurring design subscription - within range.",
      },
      {
        vendor: "Acme Software Ltd.",
        amount: "$5,400",
        outcome: hasNewVendor ? "Flagged for review" : "Auto-approved",
        tone: hasNewVendor ? "warning" : "success",
        reason: hasNewVendor
          ? "First invoice from a new vendor - held for sign-off, per your rule."
          : "Processed normally - no new-vendor rule set.",
      },
      {
        vendor: "Zoom",
        amount: "$450",
        outcome: "Auto-approved",
        tone: "success",
        reason: "Recurring subscription, unchanged for 12 months.",
      },
    ];
  };

  // Run the test and summarize it in chat; a chip opens the results page.
  async function runTest() {
    clearSuggestions();
    await aiType(1500);
    const results = computeTestResults();
    const flagged = results.filter((r) => r.tone !== "success").length;
    const auto = results.length - flagged;
    await pushMsg(
      "ai",
      `I ran your current instructions against 5 recent bills - ${auto} auto-approved, ${flagged} held for review. Open the results to see why each landed where it did, then thumbs it or refer a run to sharpen a rule.`,
      {
        suggestions: [
          { label: "View test results", kind: "openTest" },
          { label: "Save instructions", kind: "save" },
        ],
      }
    );
  }

  // A message sent while a specific test run is referenced - shapes the rules.
  async function handleRunReferencedText(text: string, runText: string) {
    clearSuggestions();
    await pushMsg("user", text, { reference: runText });
    await aiType(1500);
    const lower = text.toLowerCase();
    if (/(rout|figma|aws|vp |approver|assign)/.test(lower)) {
      hasSection("Routing") ? appendUnder("Routing", [cleanRule(text)]) : appendSection("Routing", [cleanRule(text)]);
    } else if (/(limit|approv|threshold|escalat|\$|amount|over|flag|auto)/.test(lower)) {
      hasSection("Escalation thresholds")
        ? appendUnder("Escalation thresholds", [cleanRule(text)])
        : appendSection("Escalation thresholds", [cleanRule(text)]);
    } else {
      appendUnder("Exceptions", [cleanRule(text)]);
    }
    setRightView("doc");
    await pushMsg(
      "ai",
      `Done - I updated your instructions so a bill like ${runText} is handled that way next time. Run the test again to check.`,
      { suggestions: nextSuggestions() }
    );
  }

  // ── Save ──────────────────────────────────────────────────────────────────────

  async function handleSave() {
    clearSuggestions();
    const result = saveOnboardingResult(docRef.current);
    setSaved(true);
    await sleep(1400);
    router.push(`/agents/ap?tab=instructions&saved=${result.version}`);
  }

  const canSave = docMd.trim().length > 0;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 flex flex-col bg-white z-50">
      {/* Top bar */}
      <header className="h-14 flex items-center justify-between px-5 border-b border-tipalti-border bg-white flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#0052CC" }}>
            <span className="text-white font-bold text-[11px]">AP</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-[14px] font-bold text-tipalti-text-primary truncate">AP Agent</h1>
              <span className="text-[10px] font-semibold text-tipalti-info bg-tipalti-info-bg px-1.5 py-0.5 rounded">
                {mode === "edit" ? "Editing instructions" : "Setup"}
              </span>
            </div>
            <p className="text-[11.5px] text-tipalti-text-muted -mt-0.5">Accounts Payable · Invoice Processing</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowExit(true)}
            className="text-[13px] font-medium text-tipalti-text-secondary hover:text-tipalti-text-primary px-3 py-1.5 rounded-md hover:bg-tipalti-bg-light transition-colors"
          >
            Exit
          </button>
          <button
            onClick={runTest}
            disabled={!canSave}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-tipalti-blue border border-tipalti-blue rounded-md px-3 py-1.5 bg-white hover:bg-tipalti-blue-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 2.5v9l7-4.5-7-4.5z" strokeLinejoin="round" />
            </svg>
            Test run
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="text-[13px] font-semibold text-white bg-tipalti-blue rounded-md px-4 py-1.5 hover:bg-tipalti-navy-hover transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {mode === "edit" ? "Save changes" : "Save instructions"}
          </button>
        </div>
      </header>

      {/* Split body */}
      <div className="flex-1 flex min-h-0">
        {/* Chat — left */}
        <div className="w-[42%] max-w-[520px] min-w-[380px] flex flex-col border-r border-tipalti-border bg-white">
          <div className="px-5 py-3 border-b border-tipalti-border flex items-center gap-2 flex-shrink-0">
            <DiamondIcon size={14} />
            <span className="text-[13px] font-semibold text-tipalti-text-primary">Tipalti AI</span>
            <span className="mx-1 text-tipalti-border">·</span>
            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-tipalti-text-secondary bg-tipalti-bg-light border border-tipalti-border rounded-full pl-1 pr-2 py-0.5">
              <span className="w-4 h-4 rounded flex items-center justify-center text-white text-[8px] font-bold" style={{ backgroundColor: "#0052CC" }}>
                AP
              </span>
              {mode === "edit" ? "Editing" : "Setting up"}: AP Agent
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 min-h-0">
            <div className="space-y-4">
              {messages.map((msg) =>
                msg.text === "" && !msg.suggestions ? null : msg.role === "user" ? (
                  <div key={msg.id} className="flex justify-end msg-enter">
                    <div className="flex flex-col items-end gap-1 max-w-[85%]">
                      {msg.reference && (
                        <div className="flex items-center gap-1.5 text-[11px] text-tipalti-text-muted bg-tipalti-bg-light border border-tipalti-border rounded-md px-2 py-1 max-w-full">
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" className="flex-shrink-0">
                            <path d="M3 3v3a2 2 0 002 2h5M7 5l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span className="truncate">{msg.reference}</span>
                        </div>
                      )}
                      <div className="bg-tipalti-blue-light border border-tipalti-border rounded-2xl rounded-tr-sm px-3.5 py-2">
                        <p className="text-[13px] text-tipalti-text-primary leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={msg.id} className="flex items-start gap-2.5 msg-enter">
                    <div className="mt-1 flex-shrink-0">
                      <DiamondIcon size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      {msg.text && (
                        <p className="text-[13px] text-tipalti-text-primary leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      )}
                      {msg.bullets && (
                        <ul className="mt-2 space-y-1.5">
                          {msg.bullets.map((bl, i) => (
                            <li key={i} className="flex gap-2 text-[12.5px] text-tipalti-text-secondary leading-relaxed">
                              <span className="text-tipalti-blue mt-0.5 flex-shrink-0">✓</span>
                              <span>{bl}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {msg.suggestions && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {msg.suggestions.map((s) => (
                            <button
                              key={s.label}
                              onClick={() => onSuggestion(s)}
                              className={`flex items-center gap-1.5 text-[12px] font-medium rounded-full px-3 py-1.5 border transition-colors ${
                                s.kind === "save"
                                  ? "text-tipalti-blue border-tipalti-blue bg-white hover:bg-tipalti-blue-light"
                                  : "text-tipalti-text-secondary border-tipalti-border bg-white hover:bg-tipalti-bg-light hover:border-tipalti-text-muted"
                              }`}
                            >
                              {s.kind === "upload" && (
                                <svg width="12" height="12" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4">
                                  <path d="M6.5 8.5V2.5M4 5l2.5-2.5L9 5" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M1.5 10.5h10" strokeLinecap="round" />
                                </svg>
                              )}
                              {s.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}

              {isTyping && (
                <div className="flex items-start gap-2.5">
                  <div className="mt-1 flex-shrink-0">
                    <DiamondIcon size={13} />
                  </div>
                  <div className="flex gap-1 pt-1.5">
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
          <div className="border-t border-tipalti-border px-4 py-3 flex-shrink-0">
            {reference && (
              <div className="mb-2 flex items-center gap-1.5 bg-tipalti-blue-light border border-tipalti-blue/40 rounded-lg px-2.5 py-1.5">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#0052CC" strokeWidth="1.4" className="flex-shrink-0">
                  <path d="M3 3v3a2 2 0 002 2h5M7 5l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="flex-1 min-w-0 text-[12px] text-tipalti-text-secondary truncate">{reference.text}</span>
                <button onClick={() => setReference(null)} className="text-tipalti-text-muted hover:text-tipalti-text-primary flex-shrink-0">
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 3l8 8M11 3l-8 8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 bg-white border border-tipalti-border rounded-xl px-2.5 py-2 focus-within:border-tipalti-blue transition-colors">
              <button onClick={triggerUpload} title="Upload a document" className="text-tipalti-text-muted hover:text-tipalti-blue transition-colors flex-shrink-0 p-0.5">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M10.5 4.5l-5 5a2 2 0 002.8 2.8l5-5a3.5 3.5 0 00-5-5l-5.2 5.2a5 5 0 007 7l4.7-4.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSend();
                  }
                }}
                placeholder="Describe a rule, or upload your policy…"
                className="flex-1 text-[13px] bg-transparent text-tipalti-text-primary placeholder-tipalti-text-muted focus:outline-none"
              />
              <button
                onClick={onSend}
                disabled={!input.trim()}
                className="w-6 h-6 rounded-md bg-tipalti-blue flex items-center justify-center disabled:opacity-30 hover:bg-tipalti-navy-hover transition-colors flex-shrink-0"
              >
                <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
                  <path d="M1.5 9L9 5L1.5 1V4L6.5 5L1.5 6V9Z" fill="white" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-tipalti-text-muted mt-1.5 text-center leading-tight">
              Tipalti AI can make mistakes. Nothing is active until you save.
            </p>
          </div>
        </div>

        {/* Right panel — instructions document or test results page */}
        <div className="flex-1 overflow-y-auto bg-[#F4F6F8] px-8 py-8">
          {ready && rightView === "doc" && (
            <CanvasDoc
              title="AP Agent"
              statusLabel={mode === "edit" ? "Editing" : "Draft"}
              markdown={docMd}
              editable
              writing={writing}
              onChange={setDoc}
              onReference={(t) => setReference({ text: t, kind: "doc" })}
              emptyHint="Your AP Agent's instructions will take shape here as you and Tipalti AI work through the setup."
            />
          )}
          {ready && rightView === "test" && (
            <div className="mx-auto w-full max-w-[760px]">
              <div className="bg-white rounded-2xl border border-tipalti-border shadow-panel overflow-hidden">
                <div className="px-8 pt-5 pb-4 border-b border-tipalti-border">
                  <button
                    onClick={() => setRightView("doc")}
                    className="flex items-center gap-1.5 text-[12px] font-medium text-tipalti-text-secondary hover:text-tipalti-text-primary transition-colors mb-2"
                  >
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M9 3L4 7l5 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Back to instructions
                  </button>
                  <h1 className="text-[18px] font-bold text-tipalti-text-primary tracking-tight">Test run · 5 recent bills</h1>
                  <p className="text-[12.5px] text-tipalti-text-secondary mt-1 leading-relaxed">
                    How the AP Agent would handle these under your current instructions. This is a preview - nothing is
                    processed or changed. Refer any run to shape a rule.
                  </p>
                </div>

                <div className="px-8 py-5 space-y-2.5">
                  {computeTestResults().map((r, i) => {
                    const badge =
                      r.tone === "success"
                        ? "text-tipalti-success bg-tipalti-success-bg"
                        : r.tone === "warning"
                        ? "text-tipalti-warning bg-tipalti-warning-bg"
                        : "text-tipalti-info bg-tipalti-info-bg";
                    return (
                      <div key={i} className="border border-tipalti-border rounded-xl px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-baseline gap-2 min-w-0">
                            <span className="text-[13px] font-semibold text-tipalti-text-primary truncate">{r.vendor}</span>
                            <span className="text-[12px] text-tipalti-text-muted">{r.amount}</span>
                          </div>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${badge}`}>{r.outcome}</span>
                        </div>
                        <p className="text-[12px] text-tipalti-text-secondary mt-1.5 leading-relaxed">{r.reason}</p>
                        <div className="flex items-center gap-1 mt-2">
                          {(["up", "down"] as const).map((dir) => (
                            <button
                              key={dir}
                              onClick={() => setReactions((p) => ({ ...p, [i]: dir }))}
                              className={`p-1 rounded transition-colors ${
                                reactions[i] === dir
                                  ? dir === "up"
                                    ? "text-tipalti-success"
                                    : "text-tipalti-danger"
                                  : "text-tipalti-text-muted hover:text-tipalti-text-secondary"
                              }`}
                              title={dir === "up" ? "Looks right" : "Not quite"}
                            >
                              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" style={{ transform: dir === "down" ? "rotate(180deg)" : undefined }}>
                                <path d="M5 7l2.5-4.5a1.5 1.5 0 012.7 1.2L9.5 6.5H13a1.5 1.5 0 011.4 2l-1.4 4.5a1.5 1.5 0 01-1.4 1H5V7z" strokeLinejoin="round" />
                                <path d="M5 7H3v6.5h2V7z" strokeLinejoin="round" />
                              </svg>
                            </button>
                          ))}
                          <span className="w-px h-3.5 bg-tipalti-border mx-1.5" />
                          <button
                            onClick={() => setReference({ text: `${r.vendor} ${r.amount} → ${r.outcome}`, kind: "run" })}
                            className="flex items-center gap-1.5 text-[11.5px] font-medium text-tipalti-blue hover:underline"
                          >
                            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4">
                              <path d="M3 3v3a2 2 0 002 2h5M7 5l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Shape a rule from this
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="px-8 py-4 border-t border-tipalti-border flex items-center justify-between gap-3 bg-tipalti-bg-light">
                  <p className="text-[11.5px] text-tipalti-text-muted">Happy with these? Save to put your AP Agent to work.</p>
                  <button
                    onClick={handleSave}
                    className="text-[13px] font-semibold text-white bg-tipalti-blue rounded-md px-4 py-1.5 hover:bg-tipalti-navy-hover transition-colors shadow-sm"
                  >
                    Save instructions
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />

      {/* Exit confirm */}
      {showExit && (
        <div className="fixed inset-0 z-[60] bg-black/30 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-panel border border-tipalti-border max-w-[380px] w-full p-5">
            <h3 className="text-[15px] font-bold text-tipalti-text-primary">Exit setup?</h3>
            <p className="text-[13px] text-tipalti-text-secondary mt-1.5 leading-relaxed">
              Your draft won't be saved and the AP Agent won't start until you save these instructions.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowExit(false)}
                className="text-[13px] font-medium text-tipalti-text-secondary border border-tipalti-border rounded-md px-3.5 py-1.5 hover:bg-tipalti-bg-light transition-colors"
              >
                Keep editing
              </button>
              <button
                onClick={() => router.push("/agents/ap")}
                className="text-[13px] font-semibold text-white bg-tipalti-danger rounded-md px-3.5 py-1.5 hover:opacity-90 transition-opacity"
              >
                Exit without saving
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved overlay */}
      {saved && (
        <div className="fixed inset-0 z-[60] bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-tipalti-success-bg flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#36B37E" strokeWidth="2.2">
                <path d="M5 12.5l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-[14px] font-semibold text-tipalti-text-primary">{mode === "edit" ? "Changes saved" : "Instructions saved"}</p>
            <p className="text-[12.5px] text-tipalti-text-muted">Taking you back to the AP Agent…</p>
          </div>
        </div>
      )}
    </div>
  );
}
