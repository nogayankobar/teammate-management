// Prototype-only: whether the credits widget shows the overage example.
// Shared across pages through localStorage, same pattern as onboardingStore.

import { useEffect, useState } from "react";

const KEY = "credits_demo_overage";
const EVENT = "credits-demo-change";

const isBrowser = () => typeof window !== "undefined";

function getShowOverage(): boolean {
  if (!isBrowser()) return false;
  return localStorage.getItem(KEY) === "1";
}

export function setShowOverage(value: boolean) {
  if (!isBrowser()) return;
  localStorage.setItem(KEY, value ? "1" : "0");
  window.dispatchEvent(new Event(EVENT));
}

export function useShowOverage(): boolean {
  const [value, setValue] = useState(false);
  useEffect(() => {
    const refresh = () => setValue(getShowOverage());
    refresh();
    window.addEventListener(EVENT, refresh);
    return () => window.removeEventListener(EVENT, refresh);
  }, []);
  return value;
}
