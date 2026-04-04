"use client";

import { useState, useRef, useEffect } from "react";
import { Task } from "@/data/mockData";
import { StatusBadge } from "./StatusBadge";

interface TaskDetailPanelProps {
  task: Task | null;
  onClose: () => void;
  onAction: (taskId: string, action: string) => void;
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M12.5 4.5l-8 8M4.5 4.5l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function StepIcon({ index, isLast }: { index: number; isLast: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-6 h-6 rounded-full bg-tipalti-blue-light border-2 border-tipalti-blue flex items-center justify-center flex-shrink-0">
        <span className="text-[10px] font-bold text-tipalti-blue">{index + 1}</span>
      </div>
      {!isLast && <div className="w-0.5 h-6 bg-tipalti-border mt-0.5" />}
    </div>
  );
}

function ActionButton({
  action,
  taskId,
  onClick,
}: {
  action: string;
  taskId: string;
  onClick: (taskId: string, action: string) => void;
}) {
  const configs: Record<string, { label: string; className: string }> = {
    approve: {
      label: "Approve",
      className: "bg-tipalti-success text-white hover:bg-green-700",
    },
    reject: {
      label: "Reject",
      className: "bg-white text-tipalti-danger border border-tipalti-danger hover:bg-red-50",
    },
    ask: {
      label: "Ask",
      className: "bg-white text-tipalti-blue border border-tipalti-blue hover:bg-tipalti-blue-light",
    },
    fix: {
      label: "Fix",
      className: "bg-white text-tipalti-text-primary border border-tipalti-border hover:bg-tipalti-bg-light",
    },
    correct: {
      label: "Correct",
      className: "bg-white text-tipalti-text-primary border border-tipalti-border hover:bg-tipalti-bg-light",
    },
    stop: {
      label: "Stop",
      className: "bg-white text-tipalti-danger border border-tipalti-danger hover:bg-red-50",
    },
  };

  const config = configs[action];
  if (!config) return null;

  return (
    <button
      onClick={() => onClick(taskId, action)}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${config.className}`}
    >
      {config.label}
    </button>
  );
}

// ─── Chat Panel ──────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "teammate";
  text: string;
  timestamp: Date;
}

function generateTeammateReply(task: Task, userMessage: string): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes("why") || lower.includes("explain") || lower.includes("reason")) {
    return task.reasoning ??
      `I processed this based on the available data and your configured policies. The decision was made with ${task.confidence ?? "high"}% confidence.`;
  }
  if (lower.includes("context") || lower.includes("data") || lower.includes("what did you use")) {
    if (task.contextUsed && task.contextUsed.length > 0) {
      return `Here's the context I used for this decision:\n\n${task.contextUsed.map((c) => `• ${c}`).join("\n")}`;
    }
    return "I used the available vendor history, your configured policies, and the invoice data to make this decision.";
  }
  if (lower.includes("policy") || lower.includes("rule")) {
    return task.policyTriggered
      ? `The policy that triggered here was: "${task.policyTriggered}". Would you like to modify this policy or create an exception?`
      : "No specific policy was triggered for this task. It was processed using standard validation rules.";
  }
  if (lower.includes("approve") || lower.includes("go ahead") || lower.includes("proceed")) {
    return `Got it — I'll proceed with processing this ${task.vendor} item. It will be moved to the completed queue once done.`;
  }
  if (lower.includes("change") || lower.includes("update") || lower.includes("modify")) {
    return "I can update how I handle similar items going forward. Could you describe the specific change you'd like? For example: a different coding rule, routing logic, or approval threshold.";
  }
  if (lower.includes("similar") || lower.includes("like this") || lower.includes("history")) {
    return `Looking at recent history, I've processed 4 similar items from ${task.vendor} in the past 30 days. 3 were auto-approved and 1 was flagged for the same type of issue. Would you like me to pull up the details?`;
  }

  return `I'm reviewing ${task.submittedBy ?? task.vendor} — ${task.invoiceNumber}. ${task.summary}. What would you like to know or do?`;
}

function ChatPanel({ task, onClose }: { task: Task; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "teammate",
      text: `You're chatting about: **${task.submittedBy ?? task.vendor}** (${task.invoiceNumber}).\n\n${task.summary}\n\nHow can I help? You can ask me about my reasoning, the context I used, related policies, or tell me how to handle this differently.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate teammate thinking
    setTimeout(() => {
      const reply: ChatMessage = {
        id: `teammate-${Date.now()}`,
        role: "teammate",
        text: generateTeammateReply(task, text),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
    }, 800 + Math.random() * 800);
  };

  const quickActions = [
    "Why was this flagged?",
    "What context did you use?",
    "Show me similar items",
  ];

  return (
    <div className="fixed top-0 right-[520px] h-full w-[380px] bg-white z-50 shadow-side-panel flex flex-col border-r border-tipalti-border">
      {/* Chat header */}
      <div className="px-5 py-4 border-b border-tipalti-border flex items-center justify-between bg-tipalti-bg-light/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-tipalti-blue flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 3.5a1.5 1.5 0 011.5-1.5h9A1.5 1.5 0 0113 3.5v5a1.5 1.5 0 01-1.5 1.5H5L2 13V3.5z" stroke="white" strokeWidth="1.3" strokeLinejoin="round" />
              <circle cx="5" cy="6" r="0.75" fill="white" />
              <circle cx="7" cy="6" r="0.75" fill="white" />
              <circle cx="9" cy="6" r="0.75" fill="white" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-tipalti-text-primary">Ask AP Specialist</p>
            <p className="text-[10px] text-tipalti-text-muted">Context: {task.invoiceNumber}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-tipalti-border text-tipalti-text-muted transition-colors"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Context chip */}
      <div className="px-4 py-2.5 border-b border-tipalti-border bg-tipalti-info-bg/40">
        <div className="flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1L1 3.5v3C1 9 3.2 11.2 6 12c2.8-.8 5-3 5-5.5v-3L6 1z" stroke="#0052CC" strokeWidth="1.2" />
          </svg>
          <span className="text-[11px] text-tipalti-blue font-medium">
            Scoped to: {task.submittedBy ?? task.vendor} — {task.invoiceNumber}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[85%] ${msg.role === "user" ? "order-2" : ""}`}>
              {msg.role === "teammate" && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-5 h-5 rounded-md bg-tipalti-blue flex items-center justify-center">
                    <span className="text-white text-[8px] font-bold">AP</span>
                  </div>
                  <span className="text-[10px] text-tipalti-text-muted font-medium">AP Specialist</span>
                </div>
              )}
              <div
                className={`text-sm leading-relaxed rounded-xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-tipalti-blue text-white rounded-br-sm"
                    : "bg-tipalti-bg-light text-tipalti-text-primary rounded-bl-sm"
                }`}
              >
                {msg.text.split("\n").map((line, i) => (
                  <span key={i}>
                    {line.replace(/\*\*(.*?)\*\*/g, "$1")}
                    {i < msg.text.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </div>
              <p className={`text-[10px] text-tipalti-text-muted mt-1 ${msg.role === "user" ? "text-right" : ""}`}>
                {msg.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-5 h-5 rounded-md bg-tipalti-blue flex items-center justify-center">
                  <span className="text-white text-[8px] font-bold">AP</span>
                </div>
                <span className="text-[10px] text-tipalti-text-muted font-medium">AP Specialist</span>
              </div>
              <div className="bg-tipalti-bg-light rounded-xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-tipalti-text-muted animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-tipalti-text-muted animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-tipalti-text-muted animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick action chips */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {quickActions.map((q) => (
            <button
              key={q}
              onClick={() => {
                setInput(q);
                setTimeout(() => {
                  const userMsg: ChatMessage = {
                    id: `user-${Date.now()}`,
                    role: "user",
                    text: q,
                    timestamp: new Date(),
                  };
                  setMessages((prev) => [...prev, userMsg]);
                  setIsTyping(true);
                  setTimeout(() => {
                    const reply: ChatMessage = {
                      id: `teammate-${Date.now()}`,
                      role: "teammate",
                      text: generateTeammateReply(task, q),
                      timestamp: new Date(),
                    };
                    setMessages((prev) => [...prev, reply]);
                    setIsTyping(false);
                    setInput("");
                  }, 800 + Math.random() * 800);
                }, 100);
              }}
              className="text-[11px] font-medium text-tipalti-blue bg-tipalti-blue-light border border-blue-200 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-tipalti-border">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask about this item..."
            className="flex-1 text-sm border border-tipalti-border rounded-lg px-3 py-2.5 bg-white placeholder:text-tipalti-text-muted focus:outline-none focus:ring-2 focus:ring-tipalti-blue focus:border-transparent"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="w-9 h-9 rounded-lg bg-tipalti-blue flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8l5-5v3h5v4H7v3L2 8z" fill="white" transform="rotate(-90 8 8)" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Panel ──────────────────────────────────────────────────────────────

export default function TaskDetailPanel({ task, onClose, onAction }: TaskDetailPanelProps) {
  const [chatOpen, setChatOpen] = useState(false);

  // Reset chat when task changes
  useEffect(() => {
    setChatOpen(false);
  }, [task?.id]);

  if (!task) return null;

  const formatAmount = (amount: number, currency: string) =>
    `${currency} ${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const handleAction = (taskId: string, action: string) => {
    if (action === "ask") {
      setChatOpen(true);
      return;
    }
    onAction(taskId, action);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={() => {
          setChatOpen(false);
          onClose();
        }}
      />

      {/* Chat panel (slides in from the left of the detail panel) */}
      {chatOpen && <ChatPanel task={task} onClose={() => setChatOpen(false)} />}

      {/* Detail Panel */}
      <div className="fixed top-0 right-0 h-full w-[520px] bg-white z-50 shadow-side-panel flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-tipalti-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={task.status} />
              <StatusBadge type={task.type} />
            </div>
            <h2 className="text-base font-semibold text-tipalti-text-primary">
              {task.submittedBy ?? task.vendor}
            </h2>
            <p className="text-xs text-tipalti-text-secondary mt-0.5">
              {task.invoiceNumber}
              {task.category && <span className="text-tipalti-text-muted"> &middot; {task.category}</span>}
            </p>
          </div>
          <button
            onClick={() => {
              setChatOpen(false);
              onClose();
            }}
            className="p-1.5 rounded-md hover:bg-tipalti-bg-light text-tipalti-text-muted transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Key details */}
          <div className="px-6 py-4 grid grid-cols-3 gap-4 border-b border-tipalti-border">
            <div>
              <p className="text-[11px] text-tipalti-text-muted uppercase tracking-wide mb-1">Amount</p>
              <p className="text-sm font-semibold text-tipalti-text-primary">
                {formatAmount(task.amount, task.currency)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-tipalti-text-muted uppercase tracking-wide mb-1">Invoice date</p>
              <p className="text-sm font-medium text-tipalti-text-primary">{formatDate(task.date)}</p>
            </div>
            {task.dueDate && (
              <div>
                <p className="text-[11px] text-tipalti-text-muted uppercase tracking-wide mb-1">Due date</p>
                <p className="text-sm font-medium text-tipalti-text-primary">{formatDate(task.dueDate)}</p>
              </div>
            )}
            {task.codedTo && (
              <div className="col-span-2">
                <p className="text-[11px] text-tipalti-text-muted uppercase tracking-wide mb-1">Coded to</p>
                <p className="text-sm font-medium text-tipalti-text-primary">{task.codedTo}</p>
              </div>
            )}
            {task.assignedTo && (
              <div className="col-span-2">
                <p className="text-[11px] text-tipalti-text-muted uppercase tracking-wide mb-1">Assigned to</p>
                <p className="text-sm font-medium text-tipalti-text-primary">{task.assignedTo}</p>
              </div>
            )}
            {task.confidence && (
              <div>
                <p className="text-[11px] text-tipalti-text-muted uppercase tracking-wide mb-1">Confidence</p>
                <p className={`text-sm font-semibold ${task.confidence >= 90 ? "text-tipalti-success" : task.confidence >= 75 ? "text-tipalti-warning" : "text-tipalti-danger"}`}>
                  {task.confidence}%
                </p>
              </div>
            )}
          </div>

          {/* Issue / Summary */}
          {task.issue && (
            <div className="px-6 py-4 border-b border-tipalti-border">
              <div className="bg-tipalti-danger-bg border border-red-200 rounded-lg p-4">
                <div className="flex gap-2.5">
                  <div className="mt-0.5 flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1.5L1 12.5h12L7 1.5z" stroke="#DE350B" strokeWidth="1.5" strokeLinejoin="round" />
                      <path d="M7 6v3" stroke="#DE350B" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="7" cy="10.5" r="0.75" fill="#DE350B" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-tipalti-danger mb-1">Issue detected</p>
                    <p className="text-xs text-red-700 leading-relaxed">{task.issue}</p>
                  </div>
                </div>
              </div>
              {task.suggestedAction && (
                <div className="mt-3 bg-tipalti-info-bg border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-2.5">
                    <div className="mt-0.5 flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="5.5" stroke="#0065FF" strokeWidth="1.5" />
                        <path d="M7 5.5v4" stroke="#0065FF" strokeWidth="1.5" strokeLinecap="round" />
                        <circle cx="7" cy="4" r="0.75" fill="#0065FF" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-tipalti-blue mb-1">Suggested action</p>
                      <p className="text-xs text-blue-700 leading-relaxed">{task.suggestedAction}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reasoning */}
          {task.reasoning && (
            <div className="px-6 py-4 border-b border-tipalti-border">
              <h3 className="text-xs font-semibold text-tipalti-text-secondary uppercase tracking-wide mb-3">
                Reasoning
              </h3>
              <p className="text-sm text-tipalti-text-primary leading-relaxed">{task.reasoning}</p>
            </div>
          )}

          {/* Context Used */}
          {task.contextUsed && task.contextUsed.length > 0 && (
            <div className="px-6 py-4 border-b border-tipalti-border">
              <h3 className="text-xs font-semibold text-tipalti-text-secondary uppercase tracking-wide mb-3">
                Context used
              </h3>
              <ul className="space-y-2">
                {task.contextUsed.map((ctx, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-tipalti-blue" viewBox="0 0 14 14" fill="currentColor">
                      <path d="M7 1a6 6 0 100 12A6 6 0 007 1zM6 4h2v2H6V4zm0 3h2v4H6V7z" />
                    </svg>
                    <span className="text-xs text-tipalti-text-secondary leading-relaxed">{ctx}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Policy Triggered */}
          {task.policyTriggered && (
            <div className="px-6 py-4 border-b border-tipalti-border">
              <h3 className="text-xs font-semibold text-tipalti-text-secondary uppercase tracking-wide mb-2">
                Policy triggered
              </h3>
              <span className="inline-flex items-center gap-1.5 bg-tipalti-purple-bg text-tipalti-purple text-xs font-medium px-2.5 py-1.5 rounded-md">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M6 1L1 3.5v3C1 9 3.2 11.2 6 12c2.8-.8 5-3 5-5.5v-3L6 1z" />
                </svg>
                {task.policyTriggered}
              </span>
            </div>
          )}

          {/* Audit trail */}
          {task.steps && task.steps.length > 0 && (
            <div className="px-6 py-4">
              <h3 className="text-xs font-semibold text-tipalti-text-secondary uppercase tracking-wide mb-4">
                Audit trail
              </h3>
              <div className="space-y-0">
                {task.steps.map((step, i) => (
                  <div key={step.id} className="flex gap-3">
                    <StepIcon index={i} isLast={i === task.steps!.length - 1} />
                    <div className="pb-5 flex-1 min-w-0">
                      <p className="text-xs font-semibold text-tipalti-text-primary">{step.action}</p>
                      <p className="text-xs text-tipalti-text-secondary mt-0.5 leading-relaxed">{step.detail}</p>
                      {step.tool && (
                        <span className="mt-1.5 inline-block text-[10px] text-tipalti-text-muted bg-tipalti-bg-light px-1.5 py-0.5 rounded">
                          {step.tool}
                        </span>
                      )}
                      <p className="text-[10px] text-tipalti-text-muted mt-1">
                        {new Date(step.timestamp).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {task.availableActions.length > 0 && (
          <div className="px-6 py-4 border-t border-tipalti-border bg-tipalti-bg-light">
            <div className="flex items-center gap-2 flex-wrap">
              {task.availableActions.map((action) => (
                <ActionButton
                  key={action}
                  action={action}
                  taskId={task.id}
                  onClick={handleAction}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
