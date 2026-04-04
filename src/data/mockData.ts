export type TaskStatus = "needs_attention" | "in_progress" | "completed";
export type TaskType =
  | "bookkeeping"
  | "validation"
  | "approval"
  | "routing"
  | "anomaly"
  | "extraction";

export type ActionType = "approve" | "reject" | "ask" | "fix" | "correct" | "stop";

export interface DecisionStep {
  id: string;
  timestamp: string;
  action: string;
  detail: string;
  tool?: string;
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
  dueDate?: string;
  summary: string;
  issue?: string;
  suggestedAction?: string;
  reasoning?: string;
  contextUsed?: string[];
  codedTo?: string;
  assignedTo?: string;
  steps?: DecisionStep[];
  availableActions: ActionType[];
  confidence?: number;
  policyTriggered?: string;
}

export const tasks: Task[] = [
  // ── NEEDS ATTENTION ──────────────────────────────────────────────
  {
    id: "task-001",
    status: "needs_attention",
    type: "anomaly",
    vendor: "AWS",
    invoiceNumber: "AWS-2024-08-9871",
    amount: 24850,
    currency: "USD",
    date: "2024-07-30",
    dueDate: "2024-08-14",
    summary: "Invoice amount 38% higher than last month — escalation required",
    issue:
      "This AWS invoice is $24,850 — up 38% from last month's $17,980. This exceeds the 20% month-over-month anomaly threshold defined in your policies. Human review required before coding.",
    suggestedAction:
      "Review with the Engineering team to confirm whether this increase is expected (e.g., new infrastructure or spike). Once confirmed, approve to proceed with coding.",
    reasoning:
      "I compared this invoice to the trailing 3-month average ($16,400) and last month's charge ($17,980). The 38% increase exceeds the configured 20% MoM anomaly threshold. Per policy, invoices above this threshold require human escalation.",
    contextUsed: [
      "Anomaly policy: escalate if >20% MoM increase",
      "AWS trailing 3-month average: $16,400",
      "Last month AWS invoice: $17,980",
      "Vendor memory: AWS — recurring infrastructure vendor",
    ],
    steps: [
      {
        id: "s1",
        timestamp: "2024-07-30T09:12:00Z",
        action: "Invoice received",
        detail: "AWS invoice AWS-2024-08-9871 ingested from email.",
      },
      {
        id: "s2",
        timestamp: "2024-07-30T09:12:03Z",
        action: "Extraction complete",
        detail: "Extracted: vendor=AWS, amount=$24,850, invoice date=Jul 30.",
        tool: "OCR + LLM extraction",
      },
      {
        id: "s3",
        timestamp: "2024-07-30T09:12:05Z",
        action: "Anomaly detected",
        detail:
          "Amount $24,850 is 38% above last month ($17,980). Threshold is 20%. Flagging for escalation.",
        tool: "Anomaly detection policy",
      },
      {
        id: "s4",
        timestamp: "2024-07-30T09:12:06Z",
        action: "Escalated to human",
        detail:
          "Task escalated to AP team for review. Awaiting approval to proceed.",
      },
    ],
    availableActions: ["approve", "reject", "ask"],
    confidence: 92,
    policyTriggered: "Escalate if >20% MoM increase",
  },
  {
    id: "task-002",
    status: "needs_attention",
    type: "validation",
    vendor: "Acme Software Ltd.",
    invoiceNumber: "ACME-33291",
    amount: 5400,
    currency: "USD",
    date: "2024-07-29",
    dueDate: "2024-08-12",
    summary: "Unknown vendor — no record in system, PO number missing",
    issue:
      "This invoice is from 'Acme Software Ltd.' — no matching vendor record was found in Tipalti. The PO number field is also blank. Cannot auto-approve or code without confirmation.",
    suggestedAction:
      "Confirm whether this is a new vendor to onboard, or a duplicate/fraudulent invoice. If legitimate, add the vendor in Tipalti and resubmit.",
    reasoning:
      "Vendor lookup returned no match for 'Acme Software Ltd.' in the payee database. PO matching also failed due to missing PO number. These two conditions together prevent automated processing.",
    contextUsed: [
      "Vendor lookup: no match found",
      "PO matching: failed — PO number blank",
      "Policy: new vendors require human approval",
    ],
    steps: [
      {
        id: "s1",
        timestamp: "2024-07-29T14:20:00Z",
        action: "Invoice received",
        detail: "Invoice ACME-33291 received via Tipalti upload portal.",
      },
      {
        id: "s2",
        timestamp: "2024-07-29T14:20:04Z",
        action: "Vendor lookup failed",
        detail: "No vendor record found for 'Acme Software Ltd.'",
        tool: "Vendor database lookup",
      },
      {
        id: "s3",
        timestamp: "2024-07-29T14:20:05Z",
        action: "PO matching failed",
        detail: "PO number field is blank — cannot match to purchase order.",
        tool: "PO matching engine",
      },
      {
        id: "s4",
        timestamp: "2024-07-29T14:20:06Z",
        action: "Escalated to human",
        detail: "Both checks failed. Task escalated for human verification.",
      },
    ],
    availableActions: ["approve", "reject", "ask", "fix"],
    confidence: 78,
  },
  {
    id: "task-003",
    status: "needs_attention",
    type: "routing",
    vendor: "Figma",
    invoiceNumber: "FIG-2024-4421",
    amount: 3200,
    currency: "USD",
    date: "2024-07-30",
    summary: "Routing conflict — policy ambiguity between two rules",
    issue:
      "Two routing policies apply to this Figma invoice and they conflict: (1) 'Software > $3,000 → VP Engineering' and (2) 'Design tools → VP Design'. Requesting clarification on which rule takes priority.",
    suggestedAction:
      "Approve routing to VP Design (more specific rule), or update the policy to resolve the conflict permanently.",
    reasoning:
      "Policy engine matched two rules simultaneously. Rule specificity scoring favors the 'Design tools' rule, but confidence is below the auto-apply threshold. Escalating to confirm intent.",
    contextUsed: [
      "Policy: Design tools → VP Design (Sarah Chen)",
      "Policy: Software > $3,000 → VP Engineering (David Kim)",
      "Vendor memory: Figma — design tool, recurring annual subscription",
      "Previous Figma invoices: routed to VP Design",
    ],
    steps: [
      {
        id: "s1",
        timestamp: "2024-07-30T11:05:00Z",
        action: "Invoice received",
        detail: "Figma annual subscription invoice ingested.",
      },
      {
        id: "s2",
        timestamp: "2024-07-30T11:05:03Z",
        action: "Routing policy matched — conflict",
        detail: "Two conflicting rules matched. Specificity score: Design tools (0.82) vs Software >$3k (0.79).",
        tool: "Policy routing engine",
      },
      {
        id: "s3",
        timestamp: "2024-07-30T11:05:04Z",
        action: "Escalated for clarification",
        detail: "Confidence below threshold. Escalated to human to resolve routing conflict.",
      },
    ],
    availableActions: ["approve", "reject", "ask", "fix"],
    confidence: 68,
    policyTriggered: "Conflict: Design tools vs Software >$3k",
  },

  // ── IN PROGRESS ──────────────────────────────────────────────────
  {
    id: "task-004",
    status: "in_progress",
    type: "extraction",
    vendor: "Shopify",
    invoiceNumber: "SHP-INV-7821",
    amount: 1290,
    currency: "USD",
    date: "2024-07-30",
    summary: "Extracting line items and matching to cost centers",
    reasoning:
      "Currently extracting 12 line items from the Shopify invoice and matching each to the appropriate cost center based on the product category coding rules.",
    contextUsed: [
      "Vendor memory: Shopify — SaaS, Commerce team",
      "Cost center mapping: Commerce Platform → CC-4421",
    ],
    steps: [
      {
        id: "s1",
        timestamp: "2024-07-30T13:00:00Z",
        action: "Invoice received",
        detail: "Shopify invoice SHP-INV-7821 received.",
      },
      {
        id: "s2",
        timestamp: "2024-07-30T13:00:05Z",
        action: "Extracting line items",
        detail: "Parsing 12 line items from invoice PDF...",
        tool: "LLM extraction",
      },
    ],
    availableActions: ["stop", "ask"],
    confidence: 95,
  },
  {
    id: "task-005",
    status: "in_progress",
    type: "validation",
    vendor: "Stripe",
    invoiceNumber: "IN-20240730-001",
    amount: 847.5,
    currency: "USD",
    date: "2024-07-30",
    summary: "Validating recurring charge against subscription agreement",
    reasoning:
      "Comparing this month's Stripe processing fee against the subscription agreement and prior month actuals to confirm it is within expected range.",
    contextUsed: [
      "Vendor memory: Stripe — payment processor, monthly variable fee",
      "Last 3 months: $801, $823, $839",
      "Contract: variable fee, no fixed cap",
    ],
    steps: [
      {
        id: "s1",
        timestamp: "2024-07-30T12:30:00Z",
        action: "Invoice received",
        detail: "Stripe monthly statement received.",
      },
      {
        id: "s2",
        timestamp: "2024-07-30T12:30:04Z",
        action: "Recurring validation in progress",
        detail: "Comparing to prior 3-month average ($821). Current: $847.50 (+3.2%).",
        tool: "Recurring charge validator",
      },
    ],
    availableActions: ["stop", "ask"],
    confidence: 97,
  },

  // ── COMPLETED ─────────────────────────────────────────────────────
  {
    id: "task-006",
    status: "completed",
    type: "bookkeeping",
    vendor: "Google Cloud",
    invoiceNumber: "GCP-2024-07-4432",
    amount: 11200,
    currency: "USD",
    date: "2024-07-28",
    summary: "Auto-approved and coded — matched PO, within normal range",
    reasoning:
      "Invoice matched open PO #GCP-PO-2024-03. Amount $11,200 is within 2% of the PO value ($11,000). Within the 15% MoM threshold. Auto-approved per policy and coded to Engineering Infrastructure (CC-1002).",
    contextUsed: [
      "PO match: GCP-PO-2024-03 ($11,000 — 98% match)",
      "Anomaly check: +1.8% from last month — within 15% threshold",
      "Auto-approval rule: PO-matched invoices <$15,000",
      "Cost center: Engineering Infrastructure (CC-1002)",
    ],
    codedTo: "Engineering Infrastructure (CC-1002)",
    steps: [
      {
        id: "s1",
        timestamp: "2024-07-28T09:00:00Z",
        action: "Invoice received",
        detail: "GCP invoice ingested.",
      },
      {
        id: "s2",
        timestamp: "2024-07-28T09:00:04Z",
        action: "PO matched",
        detail: "Matched to PO #GCP-PO-2024-03. 98.2% value match.",
        tool: "PO matching engine",
      },
      {
        id: "s3",
        timestamp: "2024-07-28T09:00:05Z",
        action: "Anomaly check passed",
        detail: "Amount within 15% MoM threshold (+1.8%).",
        tool: "Anomaly detection",
      },
      {
        id: "s4",
        timestamp: "2024-07-28T09:00:06Z",
        action: "Auto-approved",
        detail: "All checks passed. Auto-approval rule applied.",
        tool: "Approval engine",
      },
      {
        id: "s5",
        timestamp: "2024-07-28T09:00:07Z",
        action: "Coded and submitted",
        detail: "Coded to Engineering Infrastructure (CC-1002). Ready for payment.",
      },
    ],
    availableActions: ["ask", "correct"],
    confidence: 99,
    policyTriggered: "Auto-approve: PO-matched invoices <$15k",
  },
  {
    id: "task-007",
    status: "completed",
    type: "routing",
    vendor: "Figma (Annual)",
    invoiceNumber: "FIG-2024-3310",
    amount: 3200,
    currency: "USD",
    date: "2024-07-27",
    summary: "Routed to VP Design per 'Design tools' policy",
    reasoning:
      "Figma invoice matched the 'Design tools → VP Design' routing rule. Routed to Sarah Chen (VP Design) for approval. No conflicts detected.",
    contextUsed: [
      "Policy: Design tools → VP Design (Sarah Chen)",
      "Vendor memory: Figma — design tool, annual subscription",
    ],
    codedTo: "Design & Brand (CC-2201)",
    assignedTo: "Sarah Chen (VP Design)",
    steps: [
      {
        id: "s1",
        timestamp: "2024-07-27T10:00:00Z",
        action: "Invoice received",
        detail: "Figma annual invoice ingested.",
      },
      {
        id: "s2",
        timestamp: "2024-07-27T10:00:03Z",
        action: "Routing policy matched",
        detail: "Rule: 'Design tools → VP Design'. Confidence: 98%.",
        tool: "Policy routing engine",
      },
      {
        id: "s3",
        timestamp: "2024-07-27T10:00:04Z",
        action: "Routed to approver",
        detail: "Sent to Sarah Chen (VP Design) for approval.",
      },
    ],
    availableActions: ["ask", "correct"],
    confidence: 98,
    policyTriggered: "Design tools → VP Design",
  },
  {
    id: "task-008",
    status: "completed",
    type: "bookkeeping",
    vendor: "Zoom",
    invoiceNumber: "ZM-2024-07-1182",
    amount: 450,
    currency: "USD",
    date: "2024-07-26",
    summary: "Auto-approved — recurring subscription, amount unchanged",
    reasoning:
      "Zoom monthly subscription $450 — identical to all prior months. Recurring vendor with stable charges. Auto-approved per recurring auto-approval rule.",
    contextUsed: [
      "Vendor memory: Zoom — video conferencing, monthly $450 (12 months consistent)",
      "Auto-approval rule: recurring subscriptions with no amount change",
    ],
    codedTo: "G&A / Communications (CC-3301)",
    steps: [
      {
        id: "s1",
        timestamp: "2024-07-26T08:15:00Z",
        action: "Invoice received",
        detail: "Zoom monthly invoice ingested.",
      },
      {
        id: "s2",
        timestamp: "2024-07-26T08:15:03Z",
        action: "Recurring check passed",
        detail: "Amount $450 matches all prior 12 months exactly. No change.",
        tool: "Recurring charge validator",
      },
      {
        id: "s3",
        timestamp: "2024-07-26T08:15:04Z",
        action: "Auto-approved and coded",
        detail: "Applied recurring auto-approval. Coded to G&A (CC-3301).",
      },
    ],
    availableActions: ["ask", "correct"],
    confidence: 100,
    policyTriggered: "Auto-approve: recurring, no amount change",
  },
  {
    id: "task-009",
    status: "completed",
    type: "bookkeeping",
    vendor: "HubSpot",
    invoiceNumber: "HS-88201-2024",
    amount: 2100,
    currency: "USD",
    date: "2024-07-25",
    summary: "Coded to Marketing — matched vendor policy and GL code",
    reasoning:
      "HubSpot invoice identified as CRM/marketing platform. Vendor memory indicates this always maps to Marketing budget (GL 6200). Coded accordingly.",
    contextUsed: [
      "Vendor memory: HubSpot — CRM / Marketing tool",
      "GL code mapping: HubSpot → 6200 (Marketing Software)",
      "No anomaly detected: +2.1% from last month",
    ],
    codedTo: "Marketing / CRM (GL-6200)",
    steps: [
      {
        id: "s1",
        timestamp: "2024-07-25T11:30:00Z",
        action: "Invoice received",
        detail: "HubSpot invoice ingested.",
      },
      {
        id: "s2",
        timestamp: "2024-07-25T11:30:04Z",
        action: "Vendor matched",
        detail: "HubSpot identified. Memory: CRM/Marketing tool → GL-6200.",
        tool: "Vendor memory lookup",
      },
      {
        id: "s3",
        timestamp: "2024-07-25T11:30:05Z",
        action: "Coded and submitted",
        detail: "Coded to Marketing / CRM (GL-6200). Amount within normal range.",
      },
    ],
    availableActions: ["ask", "correct"],
    confidence: 97,
  },
];

export const teammate = {
  id: "ap-specialist-01",
  name: "AP Specialist",
  avatar: "AP",
  status: "active" as const,
  model: "Claude Opus 4",
  automationRate: 78,
  accuracy: 96.4,
  timeSaved: "14.2 hrs",
  costSaved: "$2,840",
  tasksToday: 12,
  tokensUsed: 124000,
  tokenLimit: 500000,
};
