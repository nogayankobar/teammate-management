export type TaskStatus = "needs_attention" | "in_progress" | "completed";
export type TaskType =
  | "bookkeeping"
  | "validation"
  | "approval"
  | "routing"
  | "anomaly"
  | "extraction"
  | "duplicate"
  | "policy_violation"
  | "fraud_signal"
  | "receipt_audit"
  | "spend_pattern";

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
  teammateId: string;
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
  submittedBy?: string;
  category?: string;
  steps?: DecisionStep[];
  availableActions: ActionType[];
  confidence?: number;
  policyTriggered?: string;
}

export const tasks: Task[] = [
  // ══════════════════════════════════════════════════════════════════
  // AP SPECIALIST TASKS
  // ══════════════════════════════════════════════════════════════════

  // ── NEEDS ATTENTION ──────────────────────────────────────────────
  {
    id: "task-001",
    teammateId: "ap-specialist-01",
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
    teammateId: "ap-specialist-01",
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
    teammateId: "ap-specialist-01",
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
    teammateId: "ap-specialist-01",
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
    teammateId: "ap-specialist-01",
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
    teammateId: "ap-specialist-01",
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
    teammateId: "ap-specialist-01",
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
    teammateId: "ap-specialist-01",
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
    teammateId: "ap-specialist-01",
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

  // ══════════════════════════════════════════════════════════════════
  // EXPENSE AUDITOR TASKS
  // ══════════════════════════════════════════════════════════════════

  // ── NEEDS ATTENTION ──────────────────────────────────────────────
  {
    id: "ea-001",
    teammateId: "expense-auditor-01",
    status: "needs_attention",
    type: "duplicate",
    vendor: "Uber",
    invoiceNumber: "EXP-2024-4812",
    amount: 47.5,
    currency: "USD",
    date: "2024-07-30",
    summary: "Duplicate Uber receipt — same trip submitted twice by John M.",
    submittedBy: "John Martinez (Sales)",
    category: "Travel & Transportation",
    issue:
      "Two expense claims contain the same Uber receipt ($47.50 on Jul 28, JFK → Manhattan). The receipt hash matches exactly. One was submitted on Jul 28, the other on Jul 30. This appears to be a duplicate submission.",
    suggestedAction:
      "Reject the duplicate claim (EXP-2024-4812) and keep the original (EXP-2024-4790). Notify the employee.",
    reasoning:
      "Receipt image hash comparison returned a 100% match between EXP-2024-4812 and EXP-2024-4790. Same merchant, amount, date, and pickup/dropoff locations. The second submission was made 2 days after the first — likely accidental resubmission.",
    contextUsed: [
      "Receipt hash matching: 100% match with EXP-2024-4790",
      "Same merchant: Uber, same amount: $47.50, same date: Jul 28",
      "Employee history: John Martinez — no prior duplicates",
      "Policy: duplicate receipts require finance review",
    ],
    steps: [
      {
        id: "s1",
        timestamp: "2024-07-30T10:15:00Z",
        action: "Expense submitted",
        detail: "John Martinez submitted expense EXP-2024-4812 ($47.50 Uber).",
      },
      {
        id: "s2",
        timestamp: "2024-07-30T10:15:02Z",
        action: "Receipt scanned",
        detail: "Extracted: Uber, $47.50, Jul 28, JFK → Manhattan.",
        tool: "Receipt OCR",
      },
      {
        id: "s3",
        timestamp: "2024-07-30T10:15:04Z",
        action: "Duplicate detected",
        detail: "Receipt hash 100% match with EXP-2024-4790 (submitted Jul 28). Flagging as duplicate.",
        tool: "Duplicate detection engine",
      },
      {
        id: "s4",
        timestamp: "2024-07-30T10:15:05Z",
        action: "Escalated to finance",
        detail: "Duplicate claim flagged for review. Recommended action: reject.",
      },
    ],
    availableActions: ["reject", "approve", "ask"],
    confidence: 99,
    policyTriggered: "Duplicate receipt detection",
  },

  // ── IN PROGRESS ──────────────────────────────────────────────────
  {
    id: "ea-002",
    teammateId: "expense-auditor-01",
    status: "in_progress",
    type: "receipt_audit",
    vendor: "Various",
    invoiceNumber: "RPT-2024-0891",
    amount: 1842.3,
    currency: "USD",
    date: "2024-07-30",
    summary: "Auditing expense report with 14 line items — Lisa Park (Marketing)",
    submittedBy: "Lisa Park (Marketing)",
    category: "Client Entertainment & Travel",
    reasoning:
      "Currently reviewing 14 line items in this expense report. Cross-checking each receipt against the T&E policy, verifying amounts, dates, and merchant categories. 9 of 14 items reviewed so far — no issues found yet.",
    contextUsed: [
      "Employee: Lisa Park — Marketing Manager, no prior violations",
      "T&E policy: client entertainment limit $150/person, hotel limit $250/night",
      "Report covers: Jul 22-26 client visit to NYC",
    ],
    steps: [
      {
        id: "s1",
        timestamp: "2024-07-30T11:00:00Z",
        action: "Report submitted",
        detail: "Lisa Park submitted RPT-2024-0891 with 14 line items totaling $1,842.30.",
      },
      {
        id: "s2",
        timestamp: "2024-07-30T11:00:05Z",
        action: "Audit in progress",
        detail: "Reviewing each receipt against T&E policy. 9/14 items checked — all compliant so far.",
        tool: "Policy compliance checker",
      },
    ],
    availableActions: ["stop", "ask"],
    confidence: 94,
  },
  {
    id: "ea-003",
    teammateId: "expense-auditor-01",
    status: "in_progress",
    type: "spend_pattern",
    vendor: "Multiple vendors",
    invoiceNumber: "BATCH-2024-W31",
    amount: 12450,
    currency: "USD",
    date: "2024-07-30",
    summary: "Running weekly spend pattern analysis across all departments",
    submittedBy: "System (automated)",
    category: "Spend Analysis",
    reasoning:
      "Analyzing week 31 expense submissions ($12,450 across 47 claims). Looking for anomalies: unusual spending spikes, category outliers, new merchant patterns, and weekend transactions.",
    contextUsed: [
      "Week 31 total: $12,450 across 47 claims (23 employees)",
      "Prior 4-week average: $11,200/week",
      "Focus areas: weekend spend, split transactions, high-frequency merchants",
    ],
    steps: [
      {
        id: "s1",
        timestamp: "2024-07-30T06:00:00Z",
        action: "Weekly analysis triggered",
        detail: "Automated weekly spend pattern analysis started for W31.",
      },
      {
        id: "s2",
        timestamp: "2024-07-30T06:00:15Z",
        action: "Data aggregation complete",
        detail: "47 claims, 23 employees, $12,450 total. Running anomaly models...",
        tool: "Spend pattern analyzer",
      },
    ],
    availableActions: ["stop", "ask"],
    confidence: 88,
  },

  // ── COMPLETED ─────────────────────────────────────────────────────
  {
    id: "ea-004",
    teammateId: "expense-auditor-01",
    status: "completed",
    type: "policy_violation",
    vendor: "The Capital Grille",
    invoiceNumber: "EXP-2024-4801",
    amount: 485,
    currency: "USD",
    date: "2024-07-29",
    summary: "Policy violation — client dinner exceeded per-person limit",
    submittedBy: "Mike Chen (Sales)",
    category: "Client Entertainment",
    reasoning:
      "Mike Chen submitted a client dinner at The Capital Grille for $485. The receipt shows 2 guests, making the per-person cost $242.50. This exceeds the $150/person client entertainment limit. Flagged and sent back to employee with explanation.",
    contextUsed: [
      "T&E policy: client entertainment limit $150/person",
      "Receipt: The Capital Grille, $485, 2 guests",
      "Per-person cost: $242.50 (62% above limit)",
      "Employee history: Mike Chen — 1 prior violation (Q1 2024)",
    ],
    codedTo: "Returned to employee",
    steps: [
      {
        id: "s1",
        timestamp: "2024-07-29T15:30:00Z",
        action: "Expense submitted",
        detail: "Mike Chen submitted EXP-2024-4801 ($485 The Capital Grille).",
      },
      {
        id: "s2",
        timestamp: "2024-07-29T15:30:03Z",
        action: "Receipt analyzed",
        detail: "Extracted: The Capital Grille, $485, 2 guests. Per-person: $242.50.",
        tool: "Receipt OCR + guest detection",
      },
      {
        id: "s3",
        timestamp: "2024-07-29T15:30:05Z",
        action: "Policy violation detected",
        detail: "$242.50/person exceeds $150 limit by 62%. Prior violation on record.",
        tool: "Policy compliance checker",
      },
      {
        id: "s4",
        timestamp: "2024-07-29T15:30:06Z",
        action: "Returned to employee",
        detail: "Expense returned with explanation: 'Per-person cost ($242.50) exceeds $150 limit. Please split or obtain manager approval.'",
      },
    ],
    availableActions: ["ask", "correct"],
    confidence: 97,
    policyTriggered: "Client entertainment: $150/person limit",
  },
  {
    id: "ea-005",
    teammateId: "expense-auditor-01",
    status: "completed",
    type: "fraud_signal",
    vendor: "Amazon",
    invoiceNumber: "EXP-2024-4795",
    amount: 289,
    currency: "USD",
    date: "2024-07-29",
    summary: "Weekend purchase flagged — personal item suspected, cleared after review",
    submittedBy: "Sarah Kim (Engineering)",
    category: "Office Supplies",
    reasoning:
      "Sarah Kim submitted a $289 Amazon purchase made on Saturday (Jul 27). Items: 2x monitor stands + USB hub. Weekend purchase triggered a fraud signal. However, employee provided a note: 'Setting up home office per remote work policy.' Verified against remote work equipment policy — items qualify. Auto-cleared.",
    contextUsed: [
      "Fraud signal: weekend purchase on personal Amazon account",
      "Items: 2x monitor stands ($119 ea), 1x USB hub ($51)",
      "Remote work policy: up to $500 for home office equipment",
      "Employee note: 'Setting up home office per remote work policy'",
      "Employee history: Sarah Kim — no prior flags",
    ],
    codedTo: "Remote Work Equipment (GL-5510)",
    steps: [
      {
        id: "s1",
        timestamp: "2024-07-29T09:00:00Z",
        action: "Expense submitted",
        detail: "Sarah Kim submitted EXP-2024-4795 ($289 Amazon).",
      },
      {
        id: "s2",
        timestamp: "2024-07-29T09:00:03Z",
        action: "Weekend purchase flagged",
        detail: "Purchase made on Saturday Jul 27. Triggering fraud signal review.",
        tool: "Fraud signal detector",
      },
      {
        id: "s3",
        timestamp: "2024-07-29T09:00:05Z",
        action: "Employee note reviewed",
        detail: "Note: 'Setting up home office per remote work policy.' Checking policy...",
        tool: "Policy matcher",
      },
      {
        id: "s4",
        timestamp: "2024-07-29T09:00:07Z",
        action: "Auto-cleared",
        detail: "Items qualify under remote work equipment policy (up to $500). No further action needed.",
      },
    ],
    availableActions: ["ask", "correct"],
    confidence: 93,
    policyTriggered: "Weekend purchase review → cleared via remote work policy",
  },
  {
    id: "ea-006",
    teammateId: "expense-auditor-01",
    status: "completed",
    type: "receipt_audit",
    vendor: "Delta Airlines",
    invoiceNumber: "EXP-2024-4788",
    amount: 624,
    currency: "USD",
    date: "2024-07-28",
    summary: "Flight expense approved — within policy, receipt verified",
    submittedBy: "David Park (Product)",
    category: "Travel — Airfare",
    reasoning:
      "David Park submitted a Delta Airlines round-trip SFO→JFK ($624). Economy class, booked 3 weeks in advance. Within the airfare policy ($800 max domestic round-trip). Receipt verified, booking confirmation matches. Auto-approved.",
    contextUsed: [
      "T&E policy: domestic round-trip airfare limit $800 (economy)",
      "Booking: Delta, SFO→JFK, economy, booked Jul 7 for Jul 22",
      "Receipt verified: booking confirmation matches claim",
      "Employee: David Park — no violations",
    ],
    codedTo: "Travel — Airfare (GL-6100)",
    steps: [
      {
        id: "s1",
        timestamp: "2024-07-28T14:00:00Z",
        action: "Expense submitted",
        detail: "David Park submitted EXP-2024-4788 ($624 Delta Airlines).",
      },
      {
        id: "s2",
        timestamp: "2024-07-28T14:00:03Z",
        action: "Receipt verified",
        detail: "Booking confirmation matches: Delta, SFO→JFK, economy, $624.",
        tool: "Receipt OCR + booking matcher",
      },
      {
        id: "s3",
        timestamp: "2024-07-28T14:00:05Z",
        action: "Policy check passed",
        detail: "$624 is within $800 domestic round-trip limit. Economy class confirmed.",
        tool: "Policy compliance checker",
      },
      {
        id: "s4",
        timestamp: "2024-07-28T14:00:06Z",
        action: "Auto-approved",
        detail: "All checks passed. Coded to Travel — Airfare (GL-6100).",
      },
    ],
    availableActions: ["ask", "correct"],
    confidence: 99,
    policyTriggered: "Auto-approve: airfare within policy, receipt verified",
  },
  {
    id: "ea-007",
    teammateId: "expense-auditor-01",
    status: "completed",
    type: "receipt_audit",
    vendor: "Hilton Hotels",
    invoiceNumber: "EXP-2024-4785",
    amount: 738,
    currency: "USD",
    date: "2024-07-28",
    summary: "Hotel stay approved — 3 nights within nightly limit",
    submittedBy: "David Park (Product)",
    category: "Travel — Lodging",
    reasoning:
      "David Park submitted 3 nights at Hilton NYC ($246/night = $738 total). The nightly rate is within the $250/night policy for NYC. Linked to the same trip as flight EXP-2024-4788. Auto-approved.",
    contextUsed: [
      "T&E policy: hotel limit $250/night for NYC metro area",
      "Stay: Hilton NYC, Jul 22-25, 3 nights @ $246/night",
      "Linked trip: same dates as flight EXP-2024-4788 (SFO→JFK)",
    ],
    codedTo: "Travel — Lodging (GL-6110)",
    steps: [
      {
        id: "s1",
        timestamp: "2024-07-28T14:05:00Z",
        action: "Expense submitted",
        detail: "David Park submitted EXP-2024-4785 ($738 Hilton Hotels).",
      },
      {
        id: "s2",
        timestamp: "2024-07-28T14:05:03Z",
        action: "Receipt verified",
        detail: "Hilton NYC, 3 nights, $246/night. Confirmation number verified.",
        tool: "Receipt OCR",
      },
      {
        id: "s3",
        timestamp: "2024-07-28T14:05:05Z",
        action: "Policy check passed",
        detail: "$246/night within $250 NYC nightly limit. Trip linked to EXP-2024-4788.",
        tool: "Policy compliance checker",
      },
      {
        id: "s4",
        timestamp: "2024-07-28T14:05:06Z",
        action: "Auto-approved",
        detail: "All checks passed. Coded to Travel — Lodging (GL-6110).",
      },
    ],
    availableActions: ["ask", "correct"],
    confidence: 98,
    policyTriggered: "Auto-approve: hotel within nightly limit",
  },
  {
    id: "ea-008",
    teammateId: "expense-auditor-01",
    status: "completed",
    type: "validation",
    vendor: "Starbucks",
    invoiceNumber: "EXP-2024-4779",
    amount: 12.4,
    currency: "USD",
    date: "2024-07-27",
    summary: "Missing receipt — auto-approved under $25 threshold",
    submittedBy: "Amy Wong (Design)",
    category: "Meals",
    reasoning:
      "Amy Wong submitted $12.40 for Starbucks with no receipt attached. Per policy, expenses under $25 do not require a receipt. Auto-approved.",
    contextUsed: [
      "T&E policy: receipt not required for expenses under $25",
      "Amount: $12.40 — below $25 threshold",
      "Employee: Amy Wong — no violations",
    ],
    codedTo: "Meals & Snacks (GL-6300)",
    steps: [
      {
        id: "s1",
        timestamp: "2024-07-27T16:00:00Z",
        action: "Expense submitted",
        detail: "Amy Wong submitted EXP-2024-4779 ($12.40 Starbucks, no receipt).",
      },
      {
        id: "s2",
        timestamp: "2024-07-27T16:00:02Z",
        action: "Missing receipt detected",
        detail: "No receipt attached. Checking receipt-required threshold...",
        tool: "Receipt validator",
      },
      {
        id: "s3",
        timestamp: "2024-07-27T16:00:03Z",
        action: "Auto-approved",
        detail: "$12.40 is below $25 no-receipt threshold. Auto-approved.",
      },
    ],
    availableActions: ["ask", "correct"],
    confidence: 100,
    policyTriggered: "Auto-approve: no receipt required under $25",
  },
];

export type TeammateStatus = "active" | "paused" | "dry_run" | "setup" | "inactive";

export interface Teammate {
  id: string;
  name: string;
  domain: string;
  avatar: string;
  avatarColor: string;
  status: TeammateStatus;
  model: string;
  description: string;
  automationRate: number;
  accuracy: number;
  timeSaved: string;
  costSaved: string;
  tasksToday: number;
  tasksTotal: number;
  alertCount: number;
  tokensUsed: number;
  tokenLimit: number;
  lastActive: string;
  capabilities: string[];
  projectedImpact?: {
    timeSaved: string;
    costSaved: string;
    highlight: string;
    adoptionRate: string;
  };
}

export const teammates: Teammate[] = [
  {
    id: "ap-specialist-01",
    name: "AP Specialist",
    domain: "Accounts Payable",
    avatar: "AP",
    avatarColor: "#0052CC",
    status: "active",
    model: "Claude Opus 4",
    description:
      "Extracts, codes, validates, and prepares invoices for payment. Matches invoices to POs and contracts.",
    automationRate: 78,
    accuracy: 96.4,
    timeSaved: "14.2 hrs",
    costSaved: "$2,840",
    tasksToday: 12,
    tasksTotal: 342,
    alertCount: 3,
    tokensUsed: 124000,
    tokenLimit: 500000,
    lastActive: "2 min ago",
    capabilities: [
      "Invoice extraction",
      "GL coding",
      "PO matching",
      "Anomaly detection",
      "Approval routing",
    ],
  },
  {
    id: "expense-auditor-01",
    name: "Expense Auditor",
    domain: "Expenses",
    avatar: "EA",
    avatarColor: "#00875A",
    status: "active",
    model: "Claude Opus 4",
    description:
      "Reviews submitted expenses for anomalies, fraud signals, duplicate claims, and policy violations. Surfaces only exceptions.",
    automationRate: 91,
    accuracy: 98.1,
    timeSaved: "8.5 hrs",
    costSaved: "$1,650",
    tasksToday: 27,
    tasksTotal: 1204,
    alertCount: 1,
    tokensUsed: 89000,
    tokenLimit: 300000,
    lastActive: "5 min ago",
    capabilities: [
      "Duplicate detection",
      "Receipt matching",
      "Policy compliance",
      "Fraud signal detection",
      "Spend pattern analysis",
    ],
  },
  {
    id: "approval-coordinator-01",
    name: "Approval Coordinator",
    domain: "Accounts Payable",
    avatar: "AC",
    avatarColor: "#0065FF",
    status: "paused",
    model: "Claude Opus 4",
    description:
      "Routes invoices and payment requests through multi-level approval chains. Identifies bottlenecks, sends reminders, and escalates overdue approvals.",
    automationRate: 82,
    accuracy: 95.7,
    timeSaved: "9.3 hrs",
    costSaved: "$1,420",
    tasksToday: 0,
    tasksTotal: 256,
    alertCount: 0,
    tokensUsed: 67000,
    tokenLimit: 250000,
    lastActive: "2 days ago",
    capabilities: [
      "Multi-level routing",
      "Approval chain optimization",
      "Bottleneck detection",
      "Escalation management",
      "SLA monitoring",
    ],
  },
  {
    id: "invoice-collector-01",
    name: "Invoice Collector",
    domain: "Accounts Payable",
    avatar: "IC",
    avatarColor: "#5243AA",
    status: "inactive",
    model: "Claude Opus 4",
    description:
      "Collects invoices from email, vendor portals, and employees. Chases missing invoices and detects document types.",
    automationRate: 85,
    accuracy: 94.2,
    timeSaved: "6.1 hrs",
    costSaved: "$980",
    tasksToday: 0,
    tasksTotal: 178,
    alertCount: 0,
    tokensUsed: 42000,
    tokenLimit: 200000,
    lastActive: "3 hrs ago",
    capabilities: [
      "Email ingestion",
      "Portal scraping",
      "Document classification",
      "Missing invoice detection",
      "Multi-invoice splitting",
    ],
    projectedImpact: {
      timeSaved: "~6 hrs/week",
      costSaved: "~$980/month",
      highlight: "Your team spends ~6 hours/week chasing invoices across email and vendor portals. Invoice Collector eliminates this entirely.",
      adoptionRate: "Activated by 78% of companies like yours",
    },
  },
];

// Legacy single teammate reference (for backward compat)
export const teammate = teammates[0];
