export type TaskStatus = "auto_approved" | "approved" | "pending_review" | "flagged" | "in_progress" | "error" | "abandoned";
export type TaskType = "bookkeeping" | "validation" | "routing" | "anomaly" | "extraction";

export interface DecisionStep {
  id: string;
  timestamp: string;
  action: string;
  detail: string;
  tool?: string;
}

export interface FieldStats {
  total: number;
  confident: number;
  escalated: number;
}

export interface LineItem {
  description: string;
  amount: number;
  qty?: number;
  unit?: string;
  poRef?: string;
}

export interface FeedbackField {
  label: string;
  aiValue: string;
  humanValue: string;
}

export interface LogEntry {
  id: string;
  action: "Fetch" | "Extract" | "Match" | "Classify" | "Validate" | "Flag" | "Ask" | "Escalate" | "Decide" | "Human";
  detail: string;
  reasoning: string;
}

export interface Task {
  id: string;
  status: TaskStatus;
  type: TaskType;
  vendor: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  date: string;
  processedAt: string;
  processingDuration: string;
  summary: string;
  lineItems?: LineItem[];
  actionLabel: string;
  fieldStats: FieldStats;
  userOverride: "none" | "pending" | number;
  issue?: string;
  aiSummary?: string;
  codedTo?: string;
  assignedTo?: string;
  feedbackFields?: FeedbackField[];
  humanReviewReason?: string[];
  outcomeReasons?: { reason: string; explanation: string }[];
  credits: number;
  log: LogEntry[];
}

export interface Teammate {
  id: string;
  name: string;
  domain: string;
  job: string;
  avatar: string;
  avatarColor: string;
  status: "active" | "paused";
  lastActive: string;
}

export interface Superagent {
  id: string;
  name: string;
  domain: string;
  job: string;
  avatar: string;
  avatarColor: string;
  href?: string;
  comingSoon?: boolean;
}

export const superagents: Superagent[] = [
  {
    id: "ap",
    name: "AP Agent",
    domain: "Accounts Payable",
    job: "Invoice processing & bill coding",
    avatar: "AP",
    avatarColor: "#0052CC",
    href: "/agents/ap",
  },
  {
    id: "procurement",
    name: "Procurement Agent",
    domain: "Procurement",
    job: "Purchase order management",
    avatar: "PR",
    avatarColor: "#5243AA",
  },
  {
    id: "expenses",
    name: "Expenses Agent",
    domain: "Expenses",
    job: "Expense report processing",
    avatar: "EX",
    avatarColor: "#36B37E",
  },
  {
    id: "treasury",
    name: "Treasury Agent",
    domain: "Treasury",
    job: "Cash & liquidity management",
    avatar: "TR",
    avatarColor: "#97A0AF",
    comingSoon: true,
  },
];

export interface InstructionVersion {
  version: number;
  content: string;
  publishedAt: string;
  publishedBy: string;
  method: "manual" | "upload" | "chat";
}

export const teammate: Teammate = {
  id: "ap-specialist-01",
  name: "AP Specialist",
  domain: "Accounts Payable",
  job: "Invoice Processing",
  avatar: "AP",
  avatarColor: "#0052CC",
  status: "active",
  lastActive: "2 min ago",
};

export const instructionVersions: InstructionVersion[] = [
  {
    version: 3,
    content: `## Routing

- Figma invoices → always route to VP Design (Sarah Chen)
- Figma invoices → always route to VP Product (Sahar Shlomo)
- Split AWS invoices by cost center using the tag in the description

## Escalation thresholds

- Escalate any invoice from a vendor with **no prior payment history** in Tipalti, regardless of amount
- Escalate if invoice amount is more than **20% higher** than the same vendor's previous month

## GL coding

- Default cost center: use the department tag in the invoice description
- If no tag is present, code to the vendor's historical cost center`,
    publishedAt: "2026-07-22T10:30:00Z",
    publishedBy: "Sarah Chen",
    method: "manual",
  },
  {
    version: 2,
    content: `## Routing

- Figma invoices → always route to VP Design (Sarah Chen)

## Escalation thresholds

- Escalate any invoice from a vendor with no prior payment history in Tipalti, regardless of amount
- Escalate if invoice amount is more than 20% higher than the same vendor's previous month`,
    publishedAt: "2026-07-15T14:00:00Z",
    publishedBy: "Noga Yankobar",
    method: "chat",
  },
  {
    version: 1,
    content: `## Escalation thresholds

- Escalate any invoice from a vendor with no prior payment history in Tipalti
- Escalate if invoice amount is more than 20% higher than the same vendor's previous month`,
    publishedAt: "2026-06-20T09:00:00Z",
    publishedBy: "Admin",
    method: "upload",
  },
];

export const tasks: Task[] = [
  // ── FLAGGED ───────────────────────────────────────────────────────────────────
  {
    id: "task-001",
    status: "flagged",
    type: "anomaly",
    vendor: "AWS",
    invoiceNumber: "AWS-2024-08-9871",
    amount: 24850,
    currency: "USD",
    date: "2026-06-28",
    processedAt: "2026-07-11T14:23:00",
    processingDuration: "2m 18s",
    humanReviewReason: ["Anomaly detected", "By policy"],
    outcomeReasons: [
      { reason: "Anomaly detected", explanation: "This AWS invoice is $24,850 — up 38% from last month's $17,980. Exceeds the 20% MoM threshold in your instructions, so I stopped and flagged it for you." },
      { reason: "By policy", explanation: "Your instructions require escalation for any invoice more than 20% above the prior month. This rule applied regardless of how well everything else checked out." },
    ],
    credits: 14,
    actionLabel: "Flagged for review",
    fieldStats: { total: 19, confident: 18, escalated: 1 },
    userOverride: "pending",
    summary: "Invoice 38% higher than last month — escalated per instruction",
    issue: "This AWS invoice is $24,850 — up 38% from last month's $17,980. Exceeds the 20% MoM threshold in your instructions.",
    aiSummary: "I read the AWS invoice and extracted all three line items: EC2, S3, and CloudFront. Everything matched vendor history and coded cleanly to Engineering and Analytics. The only issue is the total — at $24,850 it's 38% higher than last month, which exceeds the 20% threshold in your instructions, so I stopped and flagged it for you.",
    lineItems: [
      { description: "EC2 Compute Services",        amount: 12400 },
      { description: "S3 Data Storage & Transfer",  amount: 8200  },
      { description: "CloudFront CDN Delivery",     amount: 4250  },
    ],
    log: [
      { id: "l1",  action: "Fetch",    detail: "Payer profile",                          reasoning: "I pulled the payer profile. Noga Yankobar is the AP contact — auto-approve limit is $15,000 and the MoM spike threshold is set to 20%." },
      { id: "l2",  action: "Fetch",    detail: "Vendor profile: AWS",                    reasoning: "AWS has been processing since 2021 with 24 prior invoices, all approved. Infrastructure provider on Net-30 terms. No flags in history." },
      { id: "l3",  action: "Fetch",    detail: "Invoice history: AWS (last 3 months)",   reasoning: "I looked at the last 3 months: April $15,200, May $16,900, June $17,980. Consistent upward trend, trailing average $16,693." },
      { id: "l4",  action: "Extract",  detail: "Invoice number → AWS-2024-08-9871",      reasoning: "Found in the document header, clearly labeled 'Invoice Number'." },
      { id: "l5",  action: "Extract",  detail: "Vendor → Amazon Web Services",           reasoning: "I matched this to 'Amazon Web Services Inc.' in Tipalti — 99% similarity. Confident match." },
      { id: "l6",  action: "Extract",  detail: "Invoice date → Jun 28, 2026",            reasoning: "Extracted from the document header." },
      { id: "l7",  action: "Extract",  detail: "Currency → USD",                         reasoning: "Both the currency symbol and ISO code are present in the document. No ambiguity." },
      { id: "l8",  action: "Extract",  detail: "Line 1 — EC2 Compute Services → $12,400.00",       reasoning: "Line 1 of 3. I extracted the amount from the line item row — description matches a known AWS service category." },
      { id: "l9",  action: "Classify",     detail: "[EC2 Compute] Expense account → Expenses_Cloud_6040", reasoning: "EC2 maps to cloud infrastructure based on vendor memory. I've coded every prior AWS compute line this way." },
      { id: "l10", action: "Classify",     detail: "[EC2 Compute] Department → Engineering",             reasoning: "Compute instances are owned by Engineering per the cost allocation policy." },
      { id: "l11", action: "Classify",     detail: "[EC2 Compute] Cost center → CC-1002",               reasoning: "Engineering cost center — consistent with all prior EC2 lines." },
      { id: "l12", action: "Extract",  detail: "Line 2 — S3 Data Storage & Transfer → $8,200.00",   reasoning: "Line 2 of 3. S3 storage service line." },
      { id: "l13", action: "Classify",     detail: "[S3 Storage] Expense account → Expenses_Cloud_6040", reasoning: "S3 goes to the same cloud infrastructure account as other AWS services." },
      { id: "l14", action: "Classify",     detail: "[S3 Storage] Department → Analytics",               reasoning: "Data storage is tagged to Analytics per the cost allocation policy." },
      { id: "l15", action: "Classify",     detail: "[S3 Storage] Cost center → CC-1005",               reasoning: "Analytics cost center." },
      { id: "l16", action: "Extract",  detail: "Line 3 — CloudFront CDN Delivery → $4,250.00",      reasoning: "Line 3 of 3. CDN delivery line." },
      { id: "l17", action: "Classify",     detail: "[CloudFront] Expense account → Expenses_Cloud_6040", reasoning: "CDN delivery maps to cloud infrastructure — same as prior CloudFront lines." },
      { id: "l18", action: "Classify",     detail: "[CloudFront] Department → Engineering",             reasoning: "CDN is managed by the infrastructure sub-team within Engineering." },
      { id: "l19", action: "Classify",     detail: "[CloudFront] Cost center → CC-1002",               reasoning: "Engineering cost center." },
      { id: "l20", action: "Classify",     detail: "AP account → AP_Engineering_2000",                  reasoning: "Engineering payables account applies to the full invoice." },
      { id: "l21", action: "Validate", detail: "MoM threshold: +38.2% vs 20% limit",               reasoning: "This invoice is $24,850 — up 38.2% from last month's $17,980. The threshold in the instructions is 20%. This fails." },
      { id: "l22", action: "Flag",     detail: "Anomaly: MoM spike exceeds threshold",              reasoning: "The spike is nearly double the allowed threshold. I'm flagging this for human review — I can't auto-approve it per the payer's instructions." },
      { id: "l23", action: "Decide",   detail: "Decided: flagged for review",                        reasoning: "All 3 lines are coded and I'm confident in the GL mapping. I'm only pausing because of the MoM spike — everything else checks out." },
    ],
  },
  {
    id: "task-002",
    status: "flagged",
    type: "validation",
    vendor: "Acme Software Ltd.",
    invoiceNumber: "ACME-33291",
    amount: 5400,
    currency: "USD",
    date: "2026-06-27",
    processedAt: "2026-07-10T11:47:00",
    processingDuration: "58s",
    humanReviewReason: ["Missing information", "By policy"],
    outcomeReasons: [
      { reason: "Missing information", explanation: "The PO number field in this invoice is blank. I can't match it to an approved purchase order, which is required before I can process." },
      { reason: "By policy", explanation: "Your policy requires human sign-off before any first payment to a new vendor. Acme Software Ltd. has no prior record in Tipalti — I couldn't proceed without your approval." },
    ],
    credits: 5,
    actionLabel: "Flagged for review",
    fieldStats: { total: 10, confident: 4, escalated: 2 },
    userOverride: "pending",
    summary: "No vendor record in Tipalti, PO number missing",
    issue: "Vendor 'Acme Software Ltd.' not found in Tipalti. PO number is blank. Cannot process without confirmation.",
    aiSummary: "I received an invoice from Acme Software Ltd. for $5,400. When I searched the Tipalti vendor database, I found no matching record — this appears to be a new vendor. The PO number field was also blank. Both checks are required before I can process a first-time payment, so I stopped and flagged this for you.",
    log: [
      { id: "l1",  action: "Fetch",    detail: "Payer profile",                          reasoning: "Tipalti Inc. — AP contact Noga Yankobar. New vendor policy: requires human sign-off before first payment." },
      { id: "l2",  action: "Match",    detail: "Vendor lookup: Acme Software Ltd.",       reasoning: "Searched Tipalti vendor database. No matching record found (similarity threshold 80%). Zero payment history." },
      { id: "l3",  action: "Extract",  detail: "Invoice number → ACME-33291",             reasoning: "Found in document header, clearly labeled." },
      { id: "l4",  action: "Extract",  detail: "Vendor → Acme Software Ltd.",             reasoning: "Name extracted from document. Attempted fuzzy match — no result in vendor database." },
      { id: "l5",  action: "Extract",  detail: "Amount → $5,400.00",                      reasoning: "Found in 'Total Due' field. Single line item invoice." },
      { id: "l6",  action: "Extract",  detail: "Date → Jul 29, 2024",                     reasoning: "Extracted from document header." },
      { id: "l7",  action: "Extract",  detail: "PO number → (blank)",                     reasoning: "PO number field is empty in the invoice. No PO reference anywhere in the document." },
      { id: "l8",  action: "Extract",  detail: "Currency → USD",                          reasoning: "Currency symbol present." },
      { id: "l9",  action: "Validate", detail: "New vendor policy check",                 reasoning: "Vendor 'Acme Software Ltd.' returned zero matches in Tipalti. Payer policy: new vendors require human approval before first payment." },
      { id: "l10", action: "Validate", detail: "PO check: PO number field empty",         reasoning: "No PO number in the invoice. Cannot match to an approved purchase order. Standard AP policy requires PO or manual override." },
      { id: "l11", action: "Flag",     detail: "2 checks failed: new vendor + missing PO", reasoning: "New vendor not in Tipalti AND PO number absent. Cannot auto-process. Human verification required." },
      { id: "l12", action: "Decide",   detail: "Decided: flagged for review",              reasoning: "Two validation checks failed. Human verification required before processing." },
    ],
  },
  {
    id: "task-003",
    status: "approved",
    type: "routing",
    vendor: "Figma",
    invoiceNumber: "FIG-2024-4421",
    amount: 3200,
    currency: "USD",
    date: "2026-06-27",
    processedAt: "2026-07-10T09:15:00",
    processingDuration: "1m 12s",
    humanReviewReason: ["Conflict"],
    outcomeReasons: [
      { reason: "Conflict", explanation: "Two routing instructions both matched this invoice — 'Design tools → VP Design' (confidence 0.82) and 'Software > $3,000 → VP Engineering' (confidence 0.79). The gap was too close to auto-resolve, so I asked for clarification." },
    ],
    credits: 8,
    actionLabel: "Routed to VP Design",
    fieldStats: { total: 10, confident: 10, escalated: 0 },
    userOverride: "none",
    summary: "Routing conflict resolved — routed to VP Design after human clarification",
    aiSummary: "I read the Figma annual subscription invoice for $3,200. All fields coded cleanly from vendor history. I hit a routing conflict — two instructions both matched (design tools rule vs. software over $3,000 rule) and the confidence scores were too close to auto-resolve. I asked for clarification and routed to Sarah Chen after you confirmed the design rule takes priority.",
    log: [
      { id: "l1",   action: "Fetch",    detail: "Payer profile",                            reasoning: "Tipalti Inc. — AP contact Noga Yankobar." },
      { id: "l2",   action: "Fetch",    detail: "Vendor profile: Figma",                    reasoning: "Established vendor since 2023. 8 prior invoices. Design tool, annual subscription. All prior invoices routed to VP Design." },
      { id: "l3",   action: "Fetch",    detail: "Invoice history: Figma (last 12 months)",   reasoning: "Jul 2023: $3,200 / Jan 2024: $3,200 — consistent annual billing. Amount unchanged." },
      { id: "l4",   action: "Extract",  detail: "Invoice number → FIG-2024-4421",            reasoning: "Found in document header." },
      { id: "l5",   action: "Extract",  detail: "Vendor → Figma",                            reasoning: "Matched to Tipalti vendor 'Figma Inc.' (similarity 100%)." },
      { id: "l6",   action: "Extract",  detail: "Amount → $3,200.00",                        reasoning: "Found in 'Total Due' field. Matches prior annual invoices exactly." },
      { id: "l7",   action: "Extract",  detail: "Category → Design software / SaaS",         reasoning: "Derived from vendor profile and line item description 'Annual Design Subscription'." },
      { id: "l8",   action: "Extract",  detail: "Date → Jul 30, 2024",                       reasoning: "Extracted from document header." },
      { id: "l9",   action: "Classify",     detail: "Expense account → Expenses_Design_6088",    reasoning: "Vendor category 'Design software' maps to design expense account per vendor memory. Consistent with all 8 prior invoices." },
      { id: "l10",  action: "Classify",     detail: "AP account → AP_Design_2001",               reasoning: "Design payables account per company chart of accounts." },
      { id: "l10b", action: "Classify",     detail: "Department → Design",                       reasoning: "Based on vendor category (design tool)." },
      { id: "l10c", action: "Classify",     detail: "Location → San Mateo HQ",                   reasoning: "Design team based at HQ." },
      { id: "l11",  action: "Match",    detail: "Routing rules: 2 instructions matched",     reasoning: "Instruction 1: 'Design tools → VP Design (Sarah Chen)' — confidence 0.82. Instruction 2: 'Software > $3,000 → VP Engineering (David Kim)' — confidence 0.79." },
      { id: "l12",  action: "Flag",     detail: "Routing conflict — 2 instructions match",   reasoning: "Both instructions apply. Confidence scores are close (0.82 vs 0.79). Prior history favors VP Design but gap is insufficient to auto-resolve." },
      { id: "l13",  action: "Ask",      detail: "Routing conflict: which instruction takes priority for Figma ($3,200)?",  reasoning: "Confidence gap between matched instructions is too small to auto-resolve (0.82 vs 0.79). Asking AP contact to confirm routing." },
      { id: "l14",  action: "Human",    detail: "Design tools always take priority over the software threshold rule.",      reasoning: "" },
      { id: "l15",  action: "Decide",   detail: "Routed to Sarah Chen (VP Design)",          reasoning: "Human confirmed design tool rule takes priority. Routing updated. Instruction priority recorded for future Figma invoices." },
    ],
  },

  // ── PENDING REVIEW ────────────────────────────────────────────────────────────
  {
    id: "task-007",
    status: "pending_review",
    type: "routing",
    vendor: "Figma (Annual)",
    invoiceNumber: "FIG-2024-3310",
    amount: 3200,
    currency: "USD",
    date: "2026-06-26",
    processedAt: "2026-07-09T16:02:00",
    processingDuration: "45s",
    humanReviewReason: ["By policy"],
    outcomeReasons: [
      { reason: "By policy", explanation: "Your instructions route all Figma invoices to VP Design (Sarah Chen) for approval. I've sent it her way and I'm waiting on her sign-off." },
    ],
    credits: 4,
    actionLabel: "Pending review",
    fieldStats: { total: 10, confident: 10, escalated: 0 },
    userOverride: "pending",
    summary: "Routed to VP Design per instruction — awaiting approval",
    codedTo: "Expenses_Design_6088 / Design",
    assignedTo: "Sarah Chen (VP Design)",
    aiSummary: "I read the Figma annual subscription invoice for $3,200. Amount matches last year exactly and all fields coded from vendor history with full confidence. I matched the routing instruction and sent it to Sarah Chen (VP Design) for approval. Waiting on her sign-off.",
    log: [
      { id: "l1",  action: "Fetch",    detail: "Payer profile",                          reasoning: "Tipalti Inc. — AP contact Noga Yankobar." },
      { id: "l2",  action: "Fetch",    detail: "Vendor profile: Figma",                  reasoning: "Established vendor since 2023. 7 prior invoices. Annual design tool subscription. All prior invoices approved." },
      { id: "l3",  action: "Fetch",    detail: "Invoice history: Figma (last year)",      reasoning: "Jul 2023: $3,200. Same amount, same vendor, annual billing cycle confirmed." },
      { id: "l4",  action: "Extract",  detail: "Invoice number → FIG-2024-3310",          reasoning: "Found in document header." },
      { id: "l5",  action: "Extract",  detail: "Vendor → Figma",                          reasoning: "Matched to Tipalti vendor 'Figma Inc.' (similarity 100%)." },
      { id: "l6",  action: "Extract",  detail: "Amount → $3,200.00",                      reasoning: "Found in 'Total Due' field. Matches prior year invoice exactly." },
      { id: "l7",  action: "Extract",  detail: "Date → Jul 27, 2024",                     reasoning: "Extracted from document header." },
      { id: "l8",  action: "Classify",     detail: "Expense account → Expenses_Design_6088",  reasoning: "Vendor 'Figma' maps to design expense account per vendor memory. Consistent with all prior invoices." },
      { id: "l8b", action: "Classify",     detail: "AP account → AP_Design_2001",             reasoning: "Design payables account per chart of accounts." },
      { id: "l9",  action: "Classify",     detail: "Department → Design",                     reasoning: "Based on vendor category (design tool)." },
      { id: "l9b", action: "Classify",     detail: "Location → San Mateo HQ",                 reasoning: "Design team based at HQ." },
      { id: "l10", action: "Match",    detail: "Routing instruction matched: VP Design",  reasoning: "Rule: 'Figma invoices → always route to VP Design (Sarah Chen)' — confidence 100%. No conflicting instructions." },
      { id: "l11", action: "Decide",   detail: "Decided: routed to Sarah Chen (VP Design)", reasoning: "Bill coding complete. Invoice routed per instruction. Awaiting Sarah Chen's approval." },
    ],
  },

  // ── AUTO-APPROVED ─────────────────────────────────────────────────────────────
  {
    id: "task-006",
    status: "auto_approved",
    type: "bookkeeping",
    vendor: "Google Cloud",
    invoiceNumber: "GCP-2024-07-4432",
    amount: 11200,
    currency: "USD",
    date: "2026-06-25",
    processedAt: "2026-07-08T10:33:00",
    processingDuration: "1m 55s",
    credits: 11,
    actionLabel: "Auto-approved",
    fieldStats: { total: 10, confident: 10, escalated: 0 },
    userOverride: "none",
    summary: "PO matched, within normal range — coded to Engineering Infrastructure",
    codedTo: "Expenses_Cloud_6040 / Engineering",
    aiSummary: "I read the Google Cloud invoice and extracted all three line items: Compute Engine, BigQuery, and Cloud Storage. Everything coded cleanly against vendor history. The total is up 1.8% from last month — well within the 20% threshold and below the $15,000 auto-approve limit. Auto-approved.",
    lineItems: [
      { description: "Compute Engine Instances",  amount: 6200 },
      { description: "BigQuery Data Analytics",   amount: 3100 },
      { description: "Cloud Storage & Egress",    amount: 1900 },
    ],
    log: [
      { id: "l1",  action: "Fetch",    detail: "Payer profile",                                  reasoning: "Tipalti Inc. — AP contact Noga Yankobar. Auto-approve limit: $15,000." },
      { id: "l2",  action: "Fetch",    detail: "Vendor profile: Google Cloud",                   reasoning: "Established vendor since 2022. 15 prior invoices, all approved. Net-30 payment terms. No flags." },
      { id: "l3",  action: "Fetch",    detail: "Invoice history: Google Cloud (last 3 months)",  reasoning: "May: $10,980 / Jun: $11,010 — trailing average $10,995. MoM trend: stable." },
      { id: "l4",  action: "Extract",  detail: "Invoice number → GCP-2024-07-4432",              reasoning: "Found in document header, labeled 'Invoice #'." },
      { id: "l5",  action: "Extract",  detail: "Vendor → Google Cloud",                          reasoning: "Matched to Tipalti vendor 'Google Cloud Platform Inc.' (similarity 97%)." },
      { id: "l6",  action: "Extract",  detail: "Invoice date → Jul 28, 2024",                    reasoning: "Extracted from document header." },
      { id: "l7",  action: "Extract",  detail: "Currency → USD",                                 reasoning: "Currency symbol and ISO code both present." },
      { id: "l8",  action: "Match",    detail: "PO match: GCP-PO-2024-03",                       reasoning: "Open PO found for Google Cloud. PO value $11,000. Invoice is 98.2% of PO — within 5% tolerance." },
      { id: "l9",  action: "Extract",  detail: "Line 1 — Compute Engine Instances → $6,200.00",  reasoning: "Line 1 of 3. Compute instances — mapped to Engineering team." },
      { id: "l10", action: "Classify",     detail: "[Compute] Expense account → Expenses_Cloud_6040", reasoning: "Compute maps to cloud infrastructure expense account per vendor memory." },
      { id: "l11", action: "Classify",     detail: "[Compute] Department → Engineering",              reasoning: "Compute instances are owned by Engineering per cost allocation policy." },
      { id: "l12", action: "Classify",     detail: "[Compute] Cost center → CC-1002",                reasoning: "Engineering cost center." },
      { id: "l13", action: "Classify",     detail: "[Compute] Project → Infra - FY2024",             reasoning: "Open project code for FY2024 infrastructure spend." },
      { id: "l14", action: "Extract",  detail: "Line 2 — BigQuery Data Analytics → $3,100.00",   reasoning: "Line 2 of 3. Analytics query and processing service." },
      { id: "l15", action: "Classify",     detail: "[BigQuery] Expense account → Expenses_Cloud_6040", reasoning: "BigQuery is a cloud service — same expense account as other GCP services." },
      { id: "l16", action: "Classify",     detail: "[BigQuery] Department → Analytics",              reasoning: "BigQuery is owned by the Analytics team per cost tagging." },
      { id: "l17", action: "Classify",     detail: "[BigQuery] Cost center → CC-1005",               reasoning: "Analytics cost center." },
      { id: "l18", action: "Extract",  detail: "Line 3 — Cloud Storage & Egress → $1,900.00",    reasoning: "Line 3 of 3. Storage and data transfer costs." },
      { id: "l19", action: "Classify",     detail: "[Storage] Expense account → Expenses_Cloud_6040", reasoning: "Storage maps to cloud infrastructure account." },
      { id: "l20", action: "Classify",     detail: "[Storage] Department → Engineering",             reasoning: "Storage is managed by Engineering infrastructure team." },
      { id: "l21", action: "Classify",     detail: "[Storage] Cost center → CC-1002",               reasoning: "Engineering cost center." },
      { id: "l22", action: "Classify",     detail: "AP account → AP_Engineering_2000",               reasoning: "Engineering payables account applies to the full invoice." },
      { id: "l23", action: "Validate", detail: "MoM threshold: +1.8% (within 20% limit)",        reasoning: "Invoice total $11,200 vs prior month $11,010 = +1.8%. Well within 20% threshold. Check passed." },
      { id: "l24", action: "Decide",   detail: "Decided: auto-approved",                         reasoning: "All 3 lines coded. PO matched at 98.2%, MoM within threshold, vendor established, amount below $15k limit." },
    ],
  },
  {
    id: "task-008",
    status: "auto_approved",
    type: "bookkeeping",
    vendor: "Zoom",
    invoiceNumber: "ZM-2024-07-1182",
    amount: 450,
    currency: "USD",
    date: "2026-06-25",
    processedAt: "2026-07-08T08:51:00",
    processingDuration: "22s",
    credits: 2,
    actionLabel: "Auto-approved",
    fieldStats: { total: 8, confident: 8, escalated: 0 },
    userOverride: "none",
    summary: "Recurring subscription, amount unchanged — auto-approved",
    codedTo: "Expenses_Comms_6330 / G&A",
    aiSummary: "I read the Zoom monthly subscription invoice for $450. Amount matches all 12 prior months exactly — confirmed recurring fixed-price subscription. Vendor established, amount well below the auto-approve limit. Coded to G&A communications account per vendor memory. Auto-approved.",
    log: [
      { id: "l1",  action: "Fetch",    detail: "Payer profile",                               reasoning: "Tipalti Inc. — AP contact Noga Yankobar." },
      { id: "l2",  action: "Fetch",    detail: "Vendor profile: Zoom",                        reasoning: "Established vendor since 2022. 12 prior monthly invoices, all approved. Monthly communications subscription. Net-0 (auto-pay)." },
      { id: "l3",  action: "Fetch",    detail: "Invoice history: Zoom (last 12 months)",       reasoning: "$450.00 every month without variation. Confirmed recurring subscription at fixed price." },
      { id: "l4",  action: "Extract",  detail: "Invoice number → ZM-2024-07-1182",             reasoning: "Found in document header." },
      { id: "l5",  action: "Extract",  detail: "Vendor → Zoom",                                reasoning: "Matched to Tipalti vendor 'Zoom Video Communications Inc.' (similarity 99%)." },
      { id: "l6",  action: "Extract",  detail: "Amount → $450.00",                             reasoning: "Found in 'Total Due' field. Matches all 12 prior months exactly — no change." },
      { id: "l7",  action: "Extract",  detail: "Date → Jul 26, 2024",                          reasoning: "Extracted from document header." },
      { id: "l8",  action: "Classify",     detail: "Expense account → Expenses_Comms_6330",        reasoning: "Zoom maps to communications expense account per vendor memory. Consistent with all prior invoices." },
      { id: "l8b", action: "Classify",     detail: "AP account → AP_GA_3000",                      reasoning: "G&A payables account per chart of accounts." },
      { id: "l9",  action: "Classify",     detail: "Department → G&A",                             reasoning: "Based on vendor category (communications / SaaS)." },
      { id: "l9b", action: "Classify",     detail: "Location → All Offices",                        reasoning: "Communications tools allocated across all office locations." },
      { id: "l10", action: "Validate", detail: "Recurring subscription check: amount unchanged", reasoning: "$450.00 exactly — matches all 12 prior months. Recurring subscription confirmed at fixed price. MoM delta: 0%." },
      { id: "l11", action: "Decide",   detail: "Decided: auto-approved",                        reasoning: "Recurring subscription confirmed — $450/month, 12 consecutive months, amount unchanged. Vendor established. Auto-approved." },
    ],
  },
  {
    id: "task-009",
    status: "approved",
    type: "bookkeeping",
    vendor: "HubSpot",
    invoiceNumber: "HS-88201-2024",
    amount: 2100,
    currency: "USD",
    date: "2026-06-23",
    processedAt: "2026-07-07T13:20:00",
    processingDuration: "38s",
    humanReviewReason: ["Low confidence"],
    outcomeReasons: [
      { reason: "Low confidence", explanation: "I wasn't fully confident on the project code — there are multiple open Q3 projects and I don't have a clear rule for which one HubSpot fees belong to. I used Growth Q3 2024 as my best guess and flagged it for you to confirm." },
    ],
    credits: 3,
    actionLabel: "Auto-approved",
    fieldStats: { total: 9, confident: 9, escalated: 0 },
    userOverride: 1,
    summary: "Matched vendor memory, GL mapping — coded to Marketing",
    codedTo: "Expenses_Mktg_6200 / Marketing",
    aiSummary: "I read the HubSpot invoice and matched it to prior history. Amount is up 2.1% from last month — well within the 20% threshold. Most fields coded from memory with full confidence. I wasn't certain about the project code — there are multiple open Q3 projects and I don't have a clear rule for which one HubSpot fees belong to. I flagged that field for you.",
    feedbackFields: [
      { label: "Project", aiValue: "Growth Q3 2024", humanValue: "Brand Awareness FY2024" },
    ],
    log: [
      { id: "l1",  action: "Fetch",    detail: "Payer profile",                             reasoning: "Tipalti Inc. — AP contact Noga Yankobar." },
      { id: "l2",  action: "Fetch",    detail: "Vendor profile: HubSpot",                   reasoning: "Established vendor since 2023. 5 prior invoices. CRM/marketing platform. Net-30 payment terms. All approved." },
      { id: "l3",  action: "Fetch",    detail: "Invoice history: HubSpot (last 3 months)",  reasoning: "Apr: $2,060 / May: $2,080 / Jun: $2,100 — gradual increase, within normal range." },
      { id: "l4",  action: "Extract",  detail: "Invoice number → HS-88201-2024",             reasoning: "Found in document header." },
      { id: "l5",  action: "Extract",  detail: "Vendor → HubSpot",                           reasoning: "Matched to Tipalti vendor 'HubSpot Inc.' (similarity 100%)." },
      { id: "l6",  action: "Extract",  detail: "Amount → $2,100.00",                         reasoning: "Found in 'Total Due' field." },
      { id: "l7",  action: "Extract",  detail: "Date → Jul 25, 2024",                        reasoning: "Extracted from document header." },
      { id: "l8",  action: "Classify",     detail: "Expense account → Expenses_Mktg_6200",       reasoning: "HubSpot maps to marketing expense account per vendor memory. Consistent with all 5 prior invoices." },
      { id: "l8b", action: "Classify",     detail: "AP account → AP_Marketing_110358",           reasoning: "Marketing payables account per chart of accounts." },
      { id: "l9",  action: "Classify",     detail: "Department → Marketing",                     reasoning: "Based on vendor category (CRM/marketing platform)." },
      { id: "l9b", action: "Classify",     detail: "Project → Growth Q3 2024",                   reasoning: "Open Q3 project code for marketing tooling spend. Not fully confident — HubSpot spend could belong to more than one active project this cycle." },
      { id: "l9bf", action: "Flag",        detail: "Project raised for review",                   reasoning: "I used Growth Q3 2024 as the project code but I'm not certain — there are multiple open Q3 projects and I don't have a clear rule for which one HubSpot fees belong to. Please confirm before this posts." },
      { id: "l9c", action: "Classify",     detail: "Location → New York Office",                  reasoning: "Marketing team primarily based in New York office." },
      { id: "l10", action: "Validate", detail: "MoM threshold: +2.1% (within 20% limit)",    reasoning: "Current: $2,100 vs prior month $2,080 = +2.1%. Well within 20% threshold. Check passed." },
      { id: "l11", action: "Decide",   detail: "Decided: auto-approved",                     reasoning: "Vendor established. Amount +2.1% from last month — within threshold. Bill coding resolved via vendor memory." },
    ],
  },

  // ── APPROVED (human reviewed, no changes) ────────────────────────────────────
  {
    id: "task-010",
    status: "approved",
    type: "bookkeeping",
    vendor: "Salesforce",
    invoiceNumber: "SF-2024-07-00441",
    amount: 8750,
    currency: "USD",
    date: "2026-06-23",
    processedAt: "2026-07-07T15:44:00",
    processingDuration: "52s",
    humanReviewReason: ["By policy"],
    outcomeReasons: [
      { reason: "By policy", explanation: "Annual renewal invoices above $8,000 require human review per your policy. I routed it for sign-off — it was reviewed and approved with no changes." },
    ],
    credits: 5,
    actionLabel: "Approved",
    fieldStats: { total: 9, confident: 9, escalated: 0 },
    userOverride: "none",
    summary: "Annual license renewal — reviewed and approved with no changes",
    codedTo: "Expenses_Sales_6100 / Sales",
    aiSummary: "I read the Salesforce annual license renewal for $8,750. Amount is up 4.2% year-over-year, consistent with prior renewal increases. All nine fields coded from vendor history with full confidence. Reviewed and approved with no changes.",
    log: [
      { id: "l1",  action: "Fetch",    detail: "Payer profile",                                reasoning: "Tipalti Inc. — AP contact Noga Yankobar. Auto-approve limit: $15,000." },
      { id: "l2",  action: "Fetch",    detail: "Vendor profile: Salesforce",                   reasoning: "Established vendor since 2021. 8 prior invoices. Annual CRM license. All approved. Net-30 terms." },
      { id: "l3",  action: "Fetch",    detail: "Invoice history: Salesforce (last 12 months)", reasoning: "Jul 2023: $8,400. Current: $8,750 = +4.2% YoY. Within expected renewal increase range." },
      { id: "l4",  action: "Extract",  detail: "Invoice number → SF-2024-07-00441",             reasoning: "Found in document header. Salesforce format confirmed." },
      { id: "l5",  action: "Extract",  detail: "Vendor → Salesforce",                           reasoning: "Matched to Tipalti vendor 'Salesforce.com Inc.' (similarity 100%)." },
      { id: "l6",  action: "Extract",  detail: "Amount → $8,750.00",                            reasoning: "Found in 'Total Due' field. Annual license for 25 seats." },
      { id: "l7",  action: "Extract",  detail: "Date → Jul 24, 2024",                           reasoning: "Extracted from document header." },
      { id: "l8",  action: "Classify",     detail: "Expense account → Expenses_Sales_6100",         reasoning: "Salesforce maps to sales expense account per vendor memory. Consistent with all prior invoices." },
      { id: "l8b", action: "Classify",     detail: "AP account → AP_Sales_2002",                    reasoning: "Sales payables account per chart of accounts." },
      { id: "l9",  action: "Classify",     detail: "Department → Sales",                            reasoning: "Based on vendor category (CRM / sales platform)." },
      { id: "l9b", action: "Classify",     detail: "Cost center → CC-4100",                         reasoning: "Sales cost center per department mapping." },
      { id: "l9c", action: "Classify",     detail: "Location → New York Office",                    reasoning: "Sales team primarily based in New York office." },
      { id: "l10", action: "Validate", detail: "Annual renewal check: +4.2% YoY (within range)", reasoning: "$8,750 vs last year $8,400 = +4.2%. Consistent with typical SaaS renewal increases (3-5%). Check passed." },
      { id: "l11", action: "Decide",   detail: "Decided: routed for human review",              reasoning: "Annual renewal invoice above $8k review threshold. Routed to Noga Yankobar — approved with no changes." },
    ],
  },

  // ── APPROVED WITH MULTIPLE OVERRIDES ─────────────────────────────────────────
  {
    id: "task-012",
    status: "approved",
    type: "bookkeeping",
    vendor: "Notion",
    invoiceNumber: "NOT-2026-0882",
    amount: 960,
    currency: "USD",
    date: "2026-06-25",
    processedAt: "2026-07-08T11:05:00",
    processingDuration: "44s",
    humanReviewReason: ["Low confidence"],
    outcomeReasons: [
      { reason: "Low confidence", explanation: "I wasn't fully confident on department and cost center — Notion is a cross-team tool and the primary owner may have shifted since last year. I went with Engineering based on prior invoices, but both fields were corrected after review." },
    ],
    credits: 4,
    actionLabel: "Approved",
    fieldStats: { total: 7, confident: 5, escalated: 2 },
    userOverride: 2,
    summary: "Annual workspace renewal — 2 fields corrected by reviewer",
    aiSummary: "I read the Notion invoice and matched it to the vendor's prior history. Most fields coded the same as last year. I wasn't fully confident on the department and cost center — Notion is shared across teams and I went with Engineering based on the account owner, but it looks like that's changed. Two fields were corrected.",
    codedTo: "Expenses_SaaS_6090 / Product",
    feedbackFields: [
      { label: "Department",   aiValue: "Engineering",  humanValue: "Product" },
      { label: "Cost center",  aiValue: "CC-1002",      humanValue: "CC-2010" },
    ],
    log: [
      { id: "l1", action: "Fetch",    detail: "Payer profile",                   reasoning: "I pulled the payer profile. Noga Yankobar is the AP contact. Auto-approve limit is $15,000." },
      { id: "l2", action: "Fetch",    detail: "Vendor profile: Notion",          reasoning: "Notion has been with Tipalti since 2022 — 3 prior invoices. Annual workspace subscription. Previously coded to Engineering." },
      { id: "l3", action: "Extract",  detail: "Invoice number → NOT-2026-0882",  reasoning: "Found in the document header." },
      { id: "l4", action: "Extract",  detail: "Vendor → Notion",                 reasoning: "Matched to 'Notion Labs Inc.' in Tipalti — 100% similarity." },
      { id: "l5", action: "Extract",  detail: "Amount → $960.00",                reasoning: "Found in the 'Total Due' field. Annual workspace plan for 20 seats." },
      { id: "l6", action: "Classify", detail: "Expense account → Expenses_SaaS_6090", reasoning: "SaaS tool maps to the SaaS expense account. Consistent with prior invoices." },
      { id: "l7", action: "Classify", detail: "Department → Engineering",        reasoning: "I used Engineering based on prior invoice history. I wasn't fully confident — Notion is used across teams and the account owner may have changed." },
      { id: "l7f", action: "Flag",    detail: "Department raised for review",     reasoning: "I went with Engineering but I'm not confident. Notion is a cross-team tool and the primary owner could have shifted." },
      { id: "l8", action: "Classify", detail: "Cost center → CC-1002",           reasoning: "Engineering cost center, following prior invoices. Same uncertainty as department." },
      { id: "l8f", action: "Flag",    detail: "Cost center raised for review",    reasoning: "Cost center follows department — since I'm not sure about department, this one is uncertain too. Please verify both." },
      { id: "l9", action: "Validate", detail: "Amount check: within normal range", reasoning: "$960 matches last year's renewal price. No anomaly." },
      { id: "l10", action: "Decide",  detail: "Decided: routed for human review", reasoning: "I'm not confident on department and cost center. Routing for review before approving." },
    ],
  },
  {
    id: "task-013",
    status: "approved",
    type: "bookkeeping",
    vendor: "Stripe",
    invoiceNumber: "STR-2026-06-3341",
    amount: 4420,
    currency: "USD",
    date: "2026-06-26",
    processedAt: "2026-07-09T14:18:00",
    processingDuration: "1m 02s",
    humanReviewReason: ["Low confidence"],
    outcomeReasons: [
      { reason: "Low confidence", explanation: "I wasn't confident on project code, AP account, or location. Stripe fees are split across products and I don't have a clear rule for how to attribute them this cycle. Three fields were corrected after review." },
    ],
    credits: 7,
    actionLabel: "Approved",
    fieldStats: { total: 8, confident: 5, escalated: 3 },
    userOverride: 3,
    summary: "Payment processing fees — 3 fields corrected by reviewer",
    aiSummary: "I read the Stripe invoice and extracted the payment processing fees across three categories. Vendor history matched and the amount was within range. I wasn't confident on the project code, AP account, or location — Stripe fees are split across products and I wasn't sure which project this cycle maps to. Three fields were corrected after review.",
    codedTo: "Expenses_Payments_6070 / Finance",
    feedbackFields: [
      { label: "Project",    aiValue: "Platform Q2 2026",   humanValue: "Payments Infrastructure" },
      { label: "AP account", aiValue: "AP_Finance_2005",    humanValue: "AP_Payments_2008" },
      { label: "Location",   aiValue: "New York Office",    humanValue: "San Mateo HQ" },
    ],
    log: [
      { id: "l1", action: "Fetch",    detail: "Payer profile",                       reasoning: "Pulled the payer profile. Noga Yankobar is the AP contact. Auto-approve limit $15,000." },
      { id: "l2", action: "Fetch",    detail: "Vendor profile: Stripe",              reasoning: "Stripe has been with Tipalti since 2021. Monthly payment processing invoices. Net-30 terms. All prior invoices approved." },
      { id: "l3", action: "Fetch",    detail: "Invoice history: Stripe (last 3 months)", reasoning: "Apr: $4,100 / May: $4,280 / Jun: $4,420 — gradual increase, within expected range for growing transaction volume." },
      { id: "l4", action: "Extract",  detail: "Invoice number → STR-2026-06-3341",   reasoning: "Found in the document header." },
      { id: "l5", action: "Extract",  detail: "Amount → $4,420.00",                  reasoning: "Found in 'Total Due'. +3.3% from last month — within threshold." },
      { id: "l6", action: "Classify", detail: "Expense account → Expenses_Payments_6070", reasoning: "Payment processing maps to the Payments expense account. Consistent with all prior invoices." },
      { id: "l7", action: "Classify", detail: "Department → Finance",                reasoning: "Stripe fees are owned by Finance. Consistent with history." },
      { id: "l8",  action: "Classify", detail: "Project → Platform Q2 2026",      reasoning: "I wasn't fully confident here — I used the open platform project code but Stripe fees are sometimes split differently." },
      { id: "l8f", action: "Flag",    detail: "Project raised for review",         reasoning: "Stripe fees are split across products and I don't have a clear rule for which project this cycle belongs to. Please confirm." },
      { id: "l9",  action: "Classify", detail: "AP account → AP_Finance_2005",    reasoning: "Used the Finance payables account based on department, but I wasn't sure if Stripe has a dedicated AP account." },
      { id: "l9f", action: "Flag",    detail: "AP account raised for review",      reasoning: "I defaulted to the Finance AP account but Stripe may have its own. I'd rather you confirm than risk a mispost." },
      { id: "l10", action: "Classify", detail: "Location → New York Office",      reasoning: "Finance team is primarily in New York, but Stripe processing may be attributed to HQ. Not confident." },
      { id: "l10f", action: "Flag",   detail: "Location raised for review",        reasoning: "Finance sits in New York but Stripe's payment infrastructure is out of San Mateo. I flagged this one because it affects cost allocation." },
      { id: "l11", action: "Validate", detail: "MoM threshold: +3.3% (within 20%)", reasoning: "$4,420 vs $4,280 last month = +3.3%. Well within threshold." },
      { id: "l12", action: "Decide",   detail: "Decided: routed for human review",   reasoning: "I'm confident on expense account and department, but project, AP account, and location need confirmation." },
    ],
  },

  // ── FLAGGED (low-confidence GL coding) ────────────────────────────────────────
  {
    id: "task-011",
    status: "flagged",
    type: "bookkeeping",
    vendor: "Prime Ltd.",
    invoiceNumber: "PRM-2026-0441",
    amount: 2840,
    currency: "USD",
    date: "2026-06-24",
    processedAt: "2026-07-08T10:22:00",
    processingDuration: "1m 35s",
    humanReviewReason: ["Low confidence", "Conflict"],
    outcomeReasons: [
      { reason: "Low confidence", explanation: "I wasn't fully confident in the GL account for this invoice. Two of the three line items are conference and marketing spend, which pulled me away from the vendor's historical account. I made my best call but I want you to confirm." },
      { reason: "Conflict", explanation: "Prime Ltd.'s prior invoices all map to 110365 – Suppliers, but the line item content (Marketing Summit registration, conference booth materials) points to 110358 – Marketing. Both signals are valid and I couldn't auto-resolve them." },
    ],
    credits: 9,
    actionLabel: "Flagged for review",
    fieldStats: { total: 8, confident: 7, escalated: 1 },
    userOverride: "pending",
    summary: "Mixed-purchase invoice — GL account flagged for review",
    issue: "GL account changed from 110365 – Suppliers to 110358 – Marketing based on conference line items. Please verify the correct coding.",
    aiSummary: "I read the Prime Ltd. invoice and matched the vendor to prior history. Department, cost center, and location all lined up with past bills. The only thing I wasn't sure about was the expense account — two of the three line items look like conference spend, not standard supplies, so I coded it to Marketing instead of Suppliers. I flagged that one field for you to confirm.",
    lineItems: [
      { description: "Office supplies — Q2 restock",            amount: 890  },
      { description: "Marketing Summit 2026 — registration fees", amount: 1200 },
      { description: "Conference booth materials",               amount: 750  },
    ],
    log: [
      { id: "l1",  action: "Fetch",    detail: "Payer profile",                              reasoning: "I pulled the payer profile. Noga Yankobar is the AP contact. Auto-approve limit is $15,000." },
      { id: "l2",  action: "Fetch",    detail: "Vendor profile: Prime Ltd.",                  reasoning: "Prime Ltd. is an established vendor — 6 prior invoices, all coded to 110365 – Suppliers. General business services vendor on Net-30 terms." },
      { id: "l3",  action: "Fetch",    detail: "Invoice history: Prime Ltd. (last 6 months)", reasoning: "Consistent invoices ranging from $1,800 to $3,100. Always coded to 110365 – Suppliers. No prior flags." },
      { id: "l4",  action: "Extract",  detail: "Invoice number → PRM-2026-0441",              reasoning: "Found in the document header." },
      { id: "l5",  action: "Extract",  detail: "Vendor → Prime Ltd.",                         reasoning: "Matched to 'Prime Ltd.' in Tipalti — 100% similarity." },
      { id: "l6",  action: "Extract",  detail: "Amount → $2,840.00",                          reasoning: "Found in the 'Total Due' field. Three line items." },
      { id: "l7",  action: "Extract",  detail: "Date → Jun 24, 2026",                         reasoning: "Extracted from the document header." },
      { id: "l8",  action: "Extract",  detail: "Line 1 — Office supplies → $890.00",          reasoning: "Standard supplies line. This maps to Suppliers as expected." },
      { id: "l9",  action: "Extract",  detail: "Line 2 — Marketing Summit 2026 registration → $1,200.00", reasoning: "This line stood out — 'Marketing Summit 2026' is clearly an event registration, not a general supply purchase." },
      { id: "l10", action: "Extract",  detail: "Line 3 — Conference booth materials → $750.00", reasoning: "Another conference-related line. Between lines 2 and 3, over $1,900 of this invoice is marketing-event spend." },
      { id: "l11", action: "Classify",     detail: "Expense account → 110358 – Marketing",       reasoning: "All previous invoices from Prime Ltd. were coded to 110365 – Suppliers, but this invoice includes conference-related purchases so I coded it under 110358 – Marketing instead. I'm not fully confident this is right — the vendor history points one way, the line item content points another. Flagging for your review." },
      { id: "l12", action: "Classify",     detail: "Department → Marketing",                      reasoning: "If the Marketing account is correct, the department should follow. I've coded it to Marketing but I'm holding for confirmation." },
      { id: "l13", action: "Flag",     detail: "GL coding uncertain — vendor history conflicts with line item content", reasoning: "Prime Ltd. has always been a Suppliers vendor, but $1,950 of this invoice is clearly event/conference spend. I made my best call, but I want a human to confirm before this goes through." },
      { id: "l14", action: "Decide",   detail: "Decided: flagged for review",                  reasoning: "The bill is coded and ready to go — I just need confirmation on the GL account before I can approve it." },
    ],
  },

  // ── IN PROGRESS ───────────────────────────────────────────────────────────────
  {
    id: "task-014",
    status: "in_progress",
    type: "bookkeeping",
    vendor: "Microsoft Azure",
    invoiceNumber: "AZ-2026-07-8821",
    amount: 9340,
    currency: "USD",
    date: "2026-07-11",
    processedAt: "2026-07-11T15:45:00",
    processingDuration: "-",
    actionLabel: "In progress",
    fieldStats: { total: 0, confident: 0, escalated: 0 },
    userOverride: "pending",
    summary: "Processing in progress",
    credits: 0,
    log: [],
  },

  // ── ERROR ─────────────────────────────────────────────────────────────────────
  {
    id: "task-015",
    status: "error",
    type: "bookkeeping",
    vendor: "Slack",
    invoiceNumber: "SLK-2026-07-0041",
    amount: 1250,
    currency: "USD",
    date: "2026-07-10",
    processedAt: "2026-07-10T09:30:00",
    processingDuration: "12s",
    actionLabel: "Error",
    fieldStats: { total: 0, confident: 0, escalated: 0 },
    userOverride: "pending",
    summary: "Processing failed - vendor API timeout",
    credits: 1,
    log: [
      { id: "l1", action: "Fetch",    detail: "Payer profile",                  reasoning: "Pulled payer profile. AP contact Noga Yankobar." },
      { id: "l2", action: "Fetch",    detail: "Vendor profile: Slack",           reasoning: "Attempting to fetch vendor history — request timed out after 10s." },
      { id: "l3", action: "Escalate", detail: "Vendor API timeout — processing halted", reasoning: "Could not retrieve vendor history. Retried twice. Halting to avoid processing without context." },
    ],
  },

  // ── ABANDONED ─────────────────────────────────────────────────────────────────
  {
    id: "task-016",
    status: "abandoned",
    type: "bookkeeping",
    vendor: "Workday",
    invoiceNumber: "WD-2026-Q3-0019",
    amount: 18500,
    currency: "USD",
    date: "2026-07-09",
    processedAt: "2026-07-09T11:10:00",
    processingDuration: "3m 02s",
    actionLabel: "Abandoned",
    fieldStats: { total: 12, confident: 3, escalated: 9 },
    userOverride: "pending",
    summary: "Too many low-confidence fields — abandoned",
    credits: 8,
    log: [
      { id: "l1", action: "Fetch",    detail: "Payer profile",                               reasoning: "Pulled payer profile." },
      { id: "l2", action: "Fetch",    detail: "Vendor profile: Workday",                     reasoning: "Workday has 2 prior invoices — limited history. Unusual invoice structure compared to prior bills." },
      { id: "l3", action: "Extract",  detail: "Invoice number → WD-2026-Q3-0019",            reasoning: "Found in document header." },
      { id: "l4", action: "Extract",  detail: "Amount → $18,500.00",                         reasoning: "Found in total field." },
      { id: "l5", action: "Classify", detail: "Expense account → uncertain",                 reasoning: "Workday invoice includes implementation services, training, and licensing — three different cost categories. Cannot reliably split." },
      { id: "l6", action: "Flag",     detail: "Expense account — cannot determine split",    reasoning: "Cannot split $18,500 across 3 cost categories without more context." },
      { id: "l7", action: "Classify", detail: "Department → uncertain",                      reasoning: "Implementation services could be HR, IT, or cross-functional. Not enough context to decide." },
      { id: "l8", action: "Flag",     detail: "Department — insufficient context",           reasoning: "Multiple departments could claim this spend. Risk of misallocation is high." },
      { id: "l9", action: "Decide",   detail: "Abandoned — confidence too low to proceed",   reasoning: "9 of 12 fields are low-confidence or unresolvable. Abandoning and surfacing for manual processing." },
    ],
  },
];
