"use client";

import { JSX, useRef, useState } from "react";

// ─── Document model ─────────────────────────────────────────────────────────────

export interface DocItem {
  id: string;
  text: string;
  isNew?: boolean;
}

export interface DocSection {
  id: string;
  title: string;
  items: DocItem[];
  isNew?: boolean;
}

export interface DocReference {
  text: string;
  sectionId: string;
  itemId: string;
}

// ─── Serialize / parse (same markdown shape as instructionVersions) ─────────────

export function serializeDoc(sections: DocSection[]): string {
  return sections
    .filter((s) => s.items.some((i) => i.text.trim()))
    .map(
      (s) =>
        `## ${s.title}\n\n` +
        s.items
          .filter((i) => i.text.trim())
          .map((i) => `- ${i.text}`)
          .join("\n")
    )
    .join("\n\n");
}

let idCounter = 0;
const genId = (p: string) => `${p}${Date.now().toString(36)}${idCounter++}`;

export function parseMarkdown(md: string): DocSection[] {
  const sections: DocSection[] = [];
  let current: DocSection | null = null;
  for (const raw of md.split("\n")) {
    const t = raw.trim();
    if (t.startsWith("## ")) {
      current = { id: genId("ps"), title: t.slice(3).trim(), items: [] };
      sections.push(current);
    } else if ((t.startsWith("- ") || t.startsWith("* ")) && current) {
      current.items.push({ id: genId("pi"), text: t.slice(2).trim() });
    }
  }
  return sections;
}

// ─── Inline bold rendering ──────────────────────────────────────────────────────

function renderInline(text: string): JSX.Element {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold text-tipalti-text-primary">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// ─── Document paper ─────────────────────────────────────────────────────────────

export default function DocPaper({
  title,
  statusLabel,
  sections,
  writing,
  emptyHint,
  editable,
  onChange,
  onReference,
}: {
  title: string;
  statusLabel?: string;
  sections: DocSection[];
  writing?: boolean;
  emptyHint?: string;
  editable?: boolean;
  onChange?: (sections: DocSection[]) => void;
  onReference?: (ref: DocReference) => void;
}) {
  const isEmpty = sections.length === 0;
  const bodyRef = useRef<HTMLDivElement>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [selBtn, setSelBtn] = useState<{ x: number; y: number; ref: DocReference } | null>(null);

  // ── Editing helpers ─────────────────────────────────────────────────────────
  const startEdit = (item: DocItem) => {
    setSelBtn(null);
    setEditingId(item.id);
    setDraft(item.text);
  };

  const commitEdit = (sectionId: string, itemId: string) => {
    if (!onChange) return;
    const text = draft.trim();
    const next = sections
      .map((s) =>
        s.id !== sectionId
          ? s
          : { ...s, items: text ? s.items.map((i) => (i.id === itemId ? { ...i, text } : i)) : s.items.filter((i) => i.id !== itemId) }
      )
      .filter((s) => s.items.length > 0);
    onChange(next);
    setEditingId(null);
  };

  const deleteItem = (sectionId: string, itemId: string) => {
    if (!onChange) return;
    const next = sections
      .map((s) => (s.id !== sectionId ? s : { ...s, items: s.items.filter((i) => i.id !== itemId) }))
      .filter((s) => s.items.length > 0);
    onChange(next);
  };

  const addItem = (sectionId: string) => {
    if (!onChange) return;
    const newItem: DocItem = { id: genId("ni"), text: "" };
    onChange(sections.map((s) => (s.id === sectionId ? { ...s, items: [...s.items, newItem] } : s)));
    setEditingId(newItem.id);
    setDraft("");
  };

  // ── Selection → reference ──────────────────────────────────────────────────────
  const handleMouseUp = () => {
    if (!onReference) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return setSelBtn(null);
    const text = sel.toString().trim();
    if (!text || !bodyRef.current) return setSelBtn(null);
    let node: Node | null = sel.anchorNode;
    let el = node instanceof HTMLElement ? node : node?.parentElement ?? null;
    const li = el?.closest("[data-item-id]") as HTMLElement | null;
    if (!li || !bodyRef.current.contains(li)) return setSelBtn(null);
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    const box = bodyRef.current.getBoundingClientRect();
    setSelBtn({
      x: rect.left - box.left + rect.width / 2,
      y: rect.top - box.top,
      ref: { text, itemId: li.dataset.itemId!, sectionId: li.dataset.sectionId! },
    });
  };

  const confirmReference = () => {
    if (selBtn && onReference) onReference(selBtn.ref);
    window.getSelection()?.removeAllRanges();
    setSelBtn(null);
  };

  return (
    <div className="mx-auto w-full max-w-[760px]">
      <div className="bg-white rounded-2xl border border-tipalti-border shadow-panel overflow-hidden">
        {/* Document header */}
        <div className="px-9 pt-8 pb-5 border-b border-tipalti-border">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10.5px] font-semibold tracking-[0.14em] text-tipalti-text-muted uppercase">
                Operating Instructions
              </p>
              <h1 className="text-[21px] font-bold text-tipalti-text-primary mt-1 tracking-tight">{title}</h1>
            </div>
            {statusLabel && (
              <span className="mt-1 flex-shrink-0 text-[11px] font-semibold text-tipalti-info bg-tipalti-info-bg px-2.5 py-1 rounded-full">
                {statusLabel}
              </span>
            )}
          </div>
          {editable && (
            <p className="text-[11.5px] text-tipalti-text-muted mt-3">
              Edit any rule directly, or select text to ask Tipalti AI about it.
            </p>
          )}
          {writing && (
            <div className="flex items-center gap-2 mt-4">
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-tipalti-info animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
              <span className="text-[11.5px] font-medium text-tipalti-text-secondary">
                Tipalti AI is updating the instructions…
              </span>
            </div>
          )}
        </div>

        {/* Document body */}
        <div ref={bodyRef} onMouseUp={handleMouseUp} className="relative px-9 py-7">
          {isEmpty ? (
            <div className="py-16 flex flex-col items-center justify-center text-center gap-2">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#C1C7D0" strokeWidth="1.4">
                <rect x="5" y="3" width="14" height="18" rx="2" />
                <path d="M8 8h8M8 12h8M8 16h4" strokeLinecap="round" />
              </svg>
              <p className="text-[13px] text-tipalti-text-muted max-w-[300px] leading-relaxed">
                {emptyHint ?? "Your instructions will take shape here as you go."}
              </p>
            </div>
          ) : (
            <div className="space-y-7">
              {sections.map((section, si) => (
                <section key={section.id} className={section.isNew ? "doc-section-enter" : undefined}>
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="w-6 h-6 rounded-md bg-tipalti-blue-light text-tipalti-blue text-[12px] font-bold flex items-center justify-center flex-shrink-0">
                      {si + 1}
                    </span>
                    <h2 className="text-[15px] font-bold text-tipalti-text-primary tracking-tight">{section.title}</h2>
                  </div>
                  <ul className="space-y-1.5 pl-[34px]">
                    {section.items.map((item) => {
                      const isEditing = editingId === item.id;
                      if (isEditing) {
                        return (
                          <li key={item.id} className="py-0.5">
                            <textarea
                              autoFocus
                              value={draft}
                              onChange={(e) => setDraft(e.target.value)}
                              onBlur={() => commitEdit(section.id, item.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  commitEdit(section.id, item.id);
                                } else if (e.key === "Escape") {
                                  setEditingId(null);
                                }
                              }}
                              rows={2}
                              placeholder="Type a rule…"
                              className="w-full text-[13.5px] leading-relaxed text-tipalti-text-primary border border-tipalti-blue rounded-md px-2.5 py-1.5 resize-none focus:outline-none"
                            />
                          </li>
                        );
                      }
                      return (
                        <li
                          key={item.id}
                          data-item-id={item.id}
                          data-section-id={section.id}
                          className={`group/item flex gap-2.5 text-[13.5px] leading-relaxed text-tipalti-text-secondary rounded-md px-2 -mx-2 py-0.5 ${
                            item.isNew ? "doc-new" : ""
                          } ${editable ? "hover:bg-tipalti-bg-light" : ""}`}
                        >
                          <span className="text-tipalti-text-muted mt-[7px] flex-shrink-0 w-1 h-1 rounded-full bg-tipalti-text-muted" />
                          <span className="flex-1 min-w-0">{renderInline(item.text)}</span>
                          {editable && (
                            <span className="flex items-start gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity flex-shrink-0">
                              <button
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => startEdit(item)}
                                title="Edit"
                                className="p-1 text-tipalti-text-muted hover:text-tipalti-blue"
                              >
                                <svg width="12" height="12" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4">
                                  <path d="M9 2L11 4L5 10H3V8L9 2Z" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                              <button
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => deleteItem(section.id, item.id)}
                                title="Delete"
                                className="p-1 text-tipalti-text-muted hover:text-tipalti-danger"
                              >
                                <svg width="12" height="12" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4">
                                  <path d="M2.5 3.5h8M5 3.5V2.5h3v1M4 3.5l.5 7h4l.5-7" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                            </span>
                          )}
                        </li>
                      );
                    })}
                    {editable && (
                      <li>
                        <button
                          onClick={() => addItem(section.id)}
                          className="flex items-center gap-1.5 text-[12px] font-medium text-tipalti-text-muted hover:text-tipalti-blue transition-colors mt-1"
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M6 2.5v7M2.5 6h7" strokeLinecap="round" />
                          </svg>
                          Add rule
                        </button>
                      </li>
                    )}
                  </ul>
                </section>
              ))}
            </div>
          )}

          {/* Selection → reference floating button */}
          {selBtn && (
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={confirmReference}
              style={{ left: selBtn.x, top: selBtn.y - 8, transform: "translate(-50%, -100%)" }}
              className="absolute z-30 flex items-center gap-1.5 text-[11.5px] font-semibold text-white bg-tipalti-navy rounded-md px-2.5 py-1.5 shadow-panel whitespace-nowrap"
            >
              <svg width="11" height="11" viewBox="0 0 14 14"><path d="M7 1L13 7L7 13L1 7L7 1Z" fill="#ffffff" /></svg>
              Ask Tipalti AI about this
            </button>
          )}
        </div>
      </div>

      <p className="text-center text-[11px] text-tipalti-text-muted mt-3">
        These instructions guide how the AP Agent processes every invoice.
      </p>
    </div>
  );
}
