"use client";

import { Scale, Shield, Swords } from "lucide-react";

export default function RightRail() {
  return (
    <aside
      className="h-dvh w-[320px] border-l flex flex-col transition-colors duration-200"
      style={{
        backgroundColor: "var(--surface-sidebar-open)",
        borderColor: "var(--border-weak)",
      }}
    >
      <div
        className="p-3 border-b"
        style={{ borderColor: "var(--border-weak)" }}
      >
        <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Agents
        </div>
        <div className="text-xs opacity-70" style={{ color: "var(--text-primary)" }}>
          Attacker · Defender · Decider
        </div>
      </div>

      <div className="p-3 space-y-3">
        <div
          className="rounded-xl border p-3 shadow-sm transition-colors duration-200"
          style={{
            backgroundColor: "color-mix(in oklch, var(--surface-composer), transparent 10%)",
            borderColor: "var(--border-weak)",
          }}
        >
          <div className="flex items-center gap-2 font-medium" style={{ color: "var(--text-primary)" }}>
            <Swords className="h-4 w-4" /> Attacker
          </div>
          <p className="text-sm opacity-80 mt-2" style={{ color: "var(--text-primary)" }}>
            Proposes offensive steps…
          </p>
        </div>

        <div
          className="rounded-xl border p-3 shadow-sm transition-colors duration-200"
          style={{
            backgroundColor: "color-mix(in oklch, var(--surface-composer), transparent 10%)",
            borderColor: "var(--border-weak)",
          }}
        >
          <div className="flex items-center gap-2 font-medium" style={{ color: "var(--text-primary)" }}>
            <Shield className="h-4 w-4" /> Defender
          </div>
          <p className="text-sm opacity-80 mt-2" style={{ color: "var(--text-primary)" }}>
            Validates / mitigates…
          </p>
        </div>

        <div
          className="rounded-xl border p-3 shadow-sm transition-colors duration-200"
          style={{
            backgroundColor: "color-mix(in oklch, var(--surface-composer), transparent 10%)",
            borderColor: "var(--border-weak)",
          }}
        >
          <div className="flex items-center gap-2 font-medium" style={{ color: "var(--text-primary)" }}>
            <Scale className="h-4 w-4" /> Decider
          </div>
          <p className="text-sm opacity-80 mt-2" style={{ color: "var(--text-primary)" }}>
            Merges to final action…
          </p>
        </div>
      </div>
    </aside>
  );
}
