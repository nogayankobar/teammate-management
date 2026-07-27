// Prototype-only persistence for the AP onboarding demo.
//
// Non-destructive by design: the "Configured" AP state (v3 instructions + full
// feed) lives as static mock data and is never touched here. Everything the
// onboarding flow produces is written to a separate localStorage slot, so the
// demo can switch between a clean first-run and the configured agent freely.

export type DemoState = "configured" | "fresh";

export interface OnboardingResult {
  content: string; // markdown, same format as instructionVersions
  version: number;
  method: "onboarding";
  publishedAt: string;
  publishedBy: string;
}

const KEY_DEMO_STATE = "ap_demo_state";
const KEY_HISTORY = "ap_onboarding_history";
const KEY_ACTIVE = "ap_onboarding_active";
const EVENT = "ap-onboarding-change";

const isBrowser = () => typeof window !== "undefined";

// ─── Demo state ────────────────────────────────────────────────────────────────

export function getDemoState(): DemoState {
  if (!isBrowser()) return "configured";
  return (localStorage.getItem(KEY_DEMO_STATE) as DemoState) || "configured";
}

export function setDemoState(state: DemoState) {
  if (!isBrowser()) return;
  localStorage.setItem(KEY_DEMO_STATE, state);
  window.dispatchEvent(new Event(EVENT));
}

// ─── Onboarding versions (the docs the AI + user build) ─────────────────────────

export function getOnboardingHistory(): OnboardingResult[] {
  if (!isBrowser()) return [];
  const raw = localStorage.getItem(KEY_HISTORY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as OnboardingResult[];
  } catch {
    return [];
  }
}

function getActiveVersionNumber(): number | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(KEY_ACTIVE);
  return raw ? Number(raw) : null;
}

// The active onboarding version (defaults to the newest). Returns null if none.
export function getOnboardingResult(): OnboardingResult | null {
  const history = getOnboardingHistory();
  if (!history.length) return null;
  const active = getActiveVersionNumber();
  return history.find((h) => h.version === active) ?? history[history.length - 1];
}

// Append a new version and make it active.
export function saveOnboardingResult(content: string): OnboardingResult {
  const history = getOnboardingHistory();
  const nextVersion = history.length ? history[history.length - 1].version + 1 : 1;
  const result: OnboardingResult = {
    content,
    version: nextVersion,
    method: "onboarding",
    publishedAt: new Date().toISOString(),
    publishedBy: "Noga Yankobar",
  };
  if (isBrowser()) {
    localStorage.setItem(KEY_HISTORY, JSON.stringify([...history, result]));
    localStorage.setItem(KEY_ACTIVE, String(nextVersion));
    window.dispatchEvent(new Event(EVENT));
  }
  return result;
}

// Make a previous version active again.
export function revertOnboarding(version: number) {
  if (!isBrowser()) return;
  const exists = getOnboardingHistory().some((h) => h.version === version);
  if (!exists) return;
  localStorage.setItem(KEY_ACTIVE, String(version));
  window.dispatchEvent(new Event(EVENT));
}

export function clearOnboardingResult() {
  if (!isBrowser()) return;
  localStorage.removeItem(KEY_HISTORY);
  localStorage.removeItem(KEY_ACTIVE);
  window.dispatchEvent(new Event(EVENT));
}

// Reset the whole demo back to a clean first-run.
export function resetOnboardingDemo() {
  if (!isBrowser()) return;
  localStorage.removeItem(KEY_HISTORY);
  localStorage.removeItem(KEY_ACTIVE);
  localStorage.setItem(KEY_DEMO_STATE, "fresh");
  window.dispatchEvent(new Event(EVENT));
}

// Subscribe to any onboarding/demo-state change (same tab + across tabs).
export function onOnboardingChange(cb: () => void): () => void {
  if (!isBrowser()) return () => {};
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
