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
            bg-white/85 border-2 border-dashed border-gray-400 pointer-events-none ${rounded}`}
        >
          <span className="text-gray-900 text-[13px] font-semibold tracking-wide">{label}</span>
          {description && (
            <span className="text-gray-500 text-[11px] text-center leading-tight px-3">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
