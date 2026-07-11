"use client";

import { createContext, useContext, useState, ReactNode } from "react";

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
  return (
    <AnnotationContext.Provider value={{ annotationMode, toggle }}>
      {children}
    </AnnotationContext.Provider>
  );
}

export function useAnnotation() {
  return useContext(AnnotationContext);
}
