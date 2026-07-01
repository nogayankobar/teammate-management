"use client";

import { useState, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ContextItem {
  id: string;
  handle: string;
  description: string;
  name: string;
  type: "pdf" | "xlsx" | "txt" | "csv" | "note";
  size?: string;
  addedAt: string;
  addedBy: string;
  status: "active" | "archived";
  note?: string;
}

export const INITIAL_CONTEXT: ContextItem[] = [
  {
    id: "ctx-1",
    handle: "gl-mapping-2026",
    description: "GL account codes and department mappings for FY2026",
    name: "GL Mapping 2026.xlsx",
    type: "xlsx",
    size: "42 KB",
    addedAt: "2026-05-15T09:00:00Z",
    addedBy: "Admin",
    status: "active",
  },
  {
    id: "ctx-2",
    handle: "adapt-partners-msa",
    description: "Master Services Agreement — Adapt Partners LLC",
    name: "Adapt Partners LLC - Master Services Agreement.pdf",
    type: "pdf",
    size: "184 KB",
    addedAt: "2026-06-01T10:00:00Z",
    addedBy: "Noga Yankobar",
    status: "active",
  },
  {
    id: "ctx-3",
    handle: "vendor-payment-terms",
    description: "Standard payment terms per vendor (AWS, GCP, Figma, HubSpot, Zoom)",
    name: "Vendor payment terms",
    type: "note",
    addedAt: "2026-06-10T14:30:00Z",
    addedBy: "Noga Yankobar",
    status: "active",
    note: "AWS: Net-30. GCP: Net-30. Figma: Net-0 (annual). HubSpot: Net-30. Zoom: Net-0 (monthly auto-pay).",
  },
  {
    id: "ctx-4",
    handle: "vendor-payment-terms-2025",
    description: "Payment terms FY2025 — superseded by current version",
    name: "Vendor payment terms 2025",
    type: "note",
    addedAt: "2025-12-01T09:00:00Z",
    addedBy: "Noga Yankobar",
    status: "archived",
    note: "AWS: Net-30. GCP: Net-30. Figma: Net-0 (annual).",
  },
];

// ─── Type badge ───────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: ContextItem["type"] }) {
  const cfg: Record<ContextItem["type"], { label: string; className: string }> = {
    pdf:  { label: "PDF",  className: "bg-red-50 text-red-600" },
    xlsx: { label: "XLSX", className: "bg-green-50 text-green-700" },
    txt:  { label: "TXT",  className: "bg-gray-100 text-gray-600" },
    csv:  { label: "CSV",  className: "bg-blue-50 text-tipalti-blue" },
    note: { label: "Note", className: "bg-tipalti-purple-bg text-tipalti-purple" },
  };
  const c = cfg[type];
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide flex-shrink-0 ${c.className}`}>
      {c.label}
    </span>
  );
}

// ─── Table row ────────────────────────────────────────────────────────────────

const COL = "grid grid-cols-[200px_1fr_110px_80px_72px]";

function ContextRow({ item, onToggle, formatDate }: {
  item: ContextItem;
  onToggle: (id: string) => void;
  formatDate: (iso: string) => string;
}) {
  const archived = item.status === "archived";
  return (
    <div className={`${COL} gap-4 px-4 py-3 border-b border-tipalti-border last:border-b-0 items-center ${archived ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-2 min-w-0">
        <TypeBadge type={item.type} />
        <span className="text-[11px] font-mono font-semibold text-tipalti-text-primary truncate">@{item.handle}</span>
      </div>

      <p className="text-[12px] text-tipalti-text-secondary truncate">{item.description || <span className="italic text-tipalti-text-muted">No description</span>}</p>

      <div>
        <p className="text-[11px] text-tipalti-text-secondary">{formatDate(item.addedAt)}</p>
        <p className="text-[10px] text-tipalti-text-muted truncate">{item.addedBy}</p>
      </div>

      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap w-fit ${
        archived ? "bg-gray-100 text-gray-500" : "bg-tipalti-success-bg text-tipalti-success"
      }`}>
        {archived ? "Archived" : "Active"}
      </span>

      <div className="flex items-center justify-end">
        <button
          onClick={() => onToggle(item.id)}
          className="text-[11px] text-tipalti-text-muted hover:text-tipalti-text-primary transition-colors whitespace-nowrap"
        >
          {archived ? "Restore" : "Archive"}
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type AddMode = "file" | "note" | null;

export default function ContextLibrary() {
  const [items, setItems] = useState<ContextItem[]>(INITIAL_CONTEXT);
  const [addMode, setAddMode] = useState<AddMode>(null);
  const [showArchived, setShowArchived] = useState(false);

  const [newHandle, setNewHandle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newNote, setNewNote] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const slugify = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const resetForm = () => {
    setNewHandle("");
    setNewDescription("");
    setNewNote("");
    setPendingFile(null);
    setAddMode(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    if (!newHandle) setNewHandle(slugify(file.name.replace(/\.[^.]+$/, "")));
    e.target.value = "";
  };

  const handleAdd = () => {
    if (!newHandle.trim()) return;
    if (addMode === "note" && !newNote.trim()) return;
    if (addMode === "file" && !pendingFile) return;

    const ext = pendingFile?.name.split(".").pop()?.toLowerCase();
    const type: ContextItem["type"] =
      addMode === "note" ? "note"
      : (["pdf", "xlsx", "txt", "csv"].includes(ext ?? "") ? (ext as ContextItem["type"]) : "txt");

    const newItem: ContextItem = {
      id: `ctx-${Date.now()}`,
      handle: slugify(newHandle),
      description: newDescription,
      name: addMode === "note" ? newHandle : (pendingFile?.name ?? newHandle),
      type,
      size: pendingFile ? `${Math.round(pendingFile.size / 1024)} KB` : undefined,
      addedAt: new Date().toISOString(),
      addedBy: "Noga Yankobar",
      status: "active",
      note: addMode === "note" ? newNote : undefined,
    };
    setItems((prev) => [newItem, ...prev]);
    resetForm();
  };

  const toggleStatus = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: item.status === "active" ? "archived" : "active" } : item
      )
    );
  };

  const activeItems = items.filter((i) => i.status === "active");
  const archivedItems = items.filter((i) => i.status === "archived");

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setAddMode(addMode === "file" ? null : "file")}
          className={`flex items-center gap-1.5 text-[12px] border rounded-md px-3 py-1.5 transition-colors ${addMode === "file" ? "border-tipalti-blue text-tipalti-blue bg-blue-50" : "border-tipalti-border text-tipalti-text-secondary bg-white hover:bg-tipalti-bg-light"}`}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3">
            <path d="M6.5 8.5V2.5M4 5l2.5-2.5L9 5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M1.5 10.5h10" strokeLinecap="round" />
          </svg>
          Upload file
        </button>
        <input ref={fileRef} type="file" accept=".pdf,.txt,.xlsx,.csv" className="hidden" onChange={handleFileSelect} />

        <button
          onClick={() => setAddMode(addMode === "note" ? null : "note")}
          className={`flex items-center gap-1.5 text-[12px] border rounded-md px-3 py-1.5 transition-colors ${addMode === "note" ? "border-tipalti-blue text-tipalti-blue bg-blue-50" : "border-tipalti-border text-tipalti-text-secondary bg-white hover:bg-tipalti-bg-light"}`}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3">
            <rect x="2" y="1.5" width="9" height="10" rx="1" />
            <path d="M4.5 4.5h4M4.5 6.5h4M4.5 8.5h2" strokeLinecap="round" />
          </svg>
          Add note
        </button>

        <span className="text-[11px] text-tipalti-text-muted">PDF, XLSX, CSV, TXT</span>
      </div>

      {/* Inline add form */}
      {addMode && (
        <div className="mb-3 bg-white border border-tipalti-blue rounded-lg overflow-hidden shadow-card">
          <div className="px-4 py-3 space-y-2.5">
            <div className="grid grid-cols-[1fr_2fr] gap-3">
              <div>
                <label className="text-[11px] font-medium text-tipalti-text-muted block mb-1">Reference name</label>
                <div className="flex items-center border border-tipalti-border rounded-md bg-tipalti-bg-light overflow-hidden focus-within:border-tipalti-blue">
                  <span className="px-2 text-[12px] font-mono text-tipalti-text-muted select-none">@</span>
                  <input
                    className="flex-1 py-1.5 pr-3 text-[12px] font-mono text-tipalti-text-primary bg-transparent focus:outline-none"
                    placeholder="e.g. gl-mapping-2026"
                    value={newHandle}
                    onChange={(e) => setNewHandle(e.target.value.replace(/\s+/g, "-").replace(/[^a-z0-9-]/gi, "").toLowerCase())}
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-medium text-tipalti-text-muted block mb-1">Description</label>
                <input
                  className="w-full border border-tipalti-border rounded-md px-3 py-1.5 text-[12px] text-tipalti-text-primary bg-tipalti-bg-light focus:outline-none focus:border-tipalti-blue"
                  placeholder="What does this reference contain?"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
            </div>

            {addMode === "file" ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="text-[12px] font-medium text-tipalti-blue border border-tipalti-blue rounded-md px-3 py-1.5 bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  {pendingFile ? "Change file" : "Choose file"}
                </button>
                {pendingFile && (
                  <span className="text-[12px] text-tipalti-text-secondary">{pendingFile.name} ({Math.round(pendingFile.size / 1024)} KB)</span>
                )}
              </div>
            ) : (
              <div>
                <label className="text-[11px] font-medium text-tipalti-text-muted block mb-1">Content</label>
                <textarea
                  className="w-full min-h-[80px] border border-tipalti-border rounded-md px-3 py-2 text-[12px] text-tipalti-text-primary bg-tipalti-bg-light leading-relaxed resize-y focus:outline-none focus:border-tipalti-blue"
                  placeholder="Add reference data — payment terms, vendor notes, GL mappings, anything teammates should look up…"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 px-4 py-2.5 bg-tipalti-bg-light border-t border-tipalti-border">
            <button onClick={resetForm} className="text-[12px] text-tipalti-text-secondary hover:text-tipalti-text-primary">
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!newHandle.trim() || (addMode === "note" ? !newNote.trim() : !pendingFile)}
              className="ml-auto text-[12px] font-semibold text-white bg-tipalti-blue rounded px-3 py-1 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-tipalti-blue-hover transition-colors"
            >
              Add to library
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-tipalti-border rounded-lg shadow-card overflow-hidden">
        <div className={`${COL} gap-4 px-4 py-2.5 bg-tipalti-bg-light border-b border-tipalti-border`}>
          {["Reference", "Description", "Added", "Status", ""].map((col) => (
            <span key={col} className="text-[10px] font-semibold text-tipalti-text-muted uppercase tracking-wide">
              {col}
            </span>
          ))}
        </div>

        {activeItems.length === 0 && archivedItems.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-[13px] text-tipalti-text-muted">No context items yet. Upload a file or add a note.</p>
          </div>
        ) : (
          <>
            {activeItems.map((item) => (
              <ContextRow key={item.id} item={item} onToggle={toggleStatus} formatDate={formatDate} />
            ))}

            {archivedItems.length > 0 && (
              <>
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-tipalti-bg-light border-t border-tipalti-border hover:bg-gray-100 transition-colors"
                >
                  <svg
                    width="11" height="11" viewBox="0 0 11 11" fill="none"
                    className={`text-tipalti-text-muted transition-transform ${showArchived ? "rotate-180" : ""}`}
                  >
                    <path d="M2 4l3.5 3.5L9 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-[11px] text-tipalti-text-muted font-medium">
                    {archivedItems.length} archived
                  </span>
                </button>
                {showArchived && archivedItems.map((item) => (
                  <ContextRow key={item.id} item={item} onToggle={toggleStatus} formatDate={formatDate} />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
