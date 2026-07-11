"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AnnotationContextValue {
  annotationMode: boolean;
  toggle: () => void;
}

const AnnotationContext = createContext<AnnotationContextValue>({
  annotationMode: false,
  toggle: () => {},
});

export function AnnotationProvider({ children }: { children: ReactNode }) {
  const [annotationMode, setAnnotationMode] = useState(false);
  const toggle = () => setAnnotationMode((prev) => !prev);

  useEffect(() => {
    if (!annotationMode) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAnnotationMode(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [annotationMode]);

  return (
    <AnnotationContext.Provider value={{ annotationMode, toggle }}>
      {children}
    </AnnotationContext.Provider>
  );
}

export function useAnnotation() {
  return useContext(AnnotationContext);
}
