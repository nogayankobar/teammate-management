"use client";

import { useState } from "react";
import { useAnnotation } from "@/contexts/AnnotationContext";

interface AnnotationZoneProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  rounded?: string;
}

export function AnnotationZone({
  label,
  description,
  children,
  className = "",
  rounded = "rounded",
}: AnnotationZoneProps) {
  const { annotationMode } = useAnnotation();
  const [hovered, setHovered] = useState(false);

  if (!annotationMode) return <>{children}</>;

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      {hovered && (
        <div
          className={`absolute inset-0 z-30 flex flex-col items-center justify-center gap-1
            bg-gray-700/70 border-2 border-dashed border-gray-400 pointer-events-none ${rounded}`}
        >
          <span className="text-white text-[13px] font-semibold tracking-wide">{label}</span>
          {description && (
            <span className="text-white/75 text-[11px] text-center leading-tight px-3">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
