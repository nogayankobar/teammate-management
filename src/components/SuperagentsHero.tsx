"use client";

import { useRouter } from "next/navigation";

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 2C10.8 5.5 10.8 5.5 14.5 6.5C10.8 7.5 10.8 7.5 10 11C9.2 7.5 9.2 7.5 5.5 6.5C9.2 5.5 9.2 5.5 10 2Z" />
    </svg>
  );
}

export default function SuperagentsHero() {
  const router = useRouter();

  return (
    <div
      className="relative overflow-hidden rounded-2xl shadow-panel mb-6 px-8 py-10 sm:px-12 sm:py-12"
      style={{
        backgroundImage:
          "linear-gradient(135deg, #1A1A2E 0%, #2E2A5E 45%, #5243AA 100%)",
      }}
    >
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Glow blobs */}
      <div className="absolute -top-16 -right-10 w-72 h-72 rounded-full bg-tipalti-orange/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 left-10 w-64 h-64 rounded-full bg-tipalti-blue/20 blur-3xl pointer-events-none" />

      {/* Scattered sparkles */}
      <SparkleIcon className="absolute top-8 right-[18%] w-4 h-4 text-white/40 pointer-events-none" />
      <SparkleIcon className="absolute bottom-10 right-[8%] w-3 h-3 text-tipalti-orange/70 pointer-events-none" />
      <SparkleIcon className="absolute top-1/2 left-[6%] w-2.5 h-2.5 text-white/30 pointer-events-none" />

      <div className="relative max-w-[640px]">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-tipalti-orange">
          <SparkleIcon className="w-3.5 h-3.5" />
          AI Agents
        </span>

        <h2 className="text-[30px] sm:text-[34px] font-extrabold text-white mt-3 leading-[1.15] tracking-tight">
          Meet the AI Agents running your finance operations
        </h2>

        <p className="text-[14px] text-white/75 mt-3 leading-relaxed max-w-[540px]">
          AI Agents work your invoices, payments, and more end to end - full automation without losing visibility or control.
          AP Specialist is live today, and every agent that follows will be managed right here.
        </p>

        <div className="flex flex-wrap items-center gap-5 mt-6">
          <button
            onClick={() => router.push("/agents/ap")}
            className="text-[13px] font-semibold text-tipalti-navy bg-tipalti-orange hover:bg-tipalti-orange-hover px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap"
          >
            View AP Specialist
          </button>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-[13px] font-semibold text-white/85 hover:text-white transition-colors whitespace-nowrap underline underline-offset-4 decoration-white/30"
          >
            How AI Agents work
          </a>
        </div>
      </div>
    </div>
  );
}
