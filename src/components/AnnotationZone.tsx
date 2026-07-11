"use client";

import { useState } from "react";
import { useAnnotation } from "@/contexts/AnnotationContext";

interface AnnotationZoneProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  rounded?: string;
  labelPosition?: "center" | "top";
}

export function AnnotationZone({
  label,
  description,
  children,
  className = "",
  rounded = "rounded",
  labelPosition = "center",
}: AnnotationZoneProps) {
  const { annotationMode } = useAnnotation();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={(e) => {
        if (!annotationMode) return;
        e.stopPropagation();
        setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      {annotationMode && hovered && (
        <div
          className={`absolute inset-0 z-30 flex flex-col items-center gap-1
            bg-white/90 border-2 border-dashed border-gray-400 pointer-events-none ${rounded}
            ${labelPosition === "top" ? "justify-start pt-5" : "justify-center"}`}
        >
          <span className="text-black text-[13px] font-bold tracking-wide">{label}</span>
          {description && (
            <span className="text-gray-600 text-[11px] text-center leading-tight px-3">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
