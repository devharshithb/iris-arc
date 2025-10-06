"use client";

import { Shield, Swords, Scale } from "lucide-react";

export default function RightRail() {
  return (
    <aside className="h-dvh w-[320px] border-l flex-col bg-[#212121]">
      <div className="p-3 border-b">
        <div className="text-sm font-semibold">Agents</div>
        <div className="text-xs opacity-70">Attacker · Defender · Decider</div>
      </div>
      <div className="p-3 space-y-3">
        <div className="rounded-xl border p-3 shadow-sm bg-black/10">
          <div className="flex items-center gap-2 font-medium"><Swords className="h-4 w-4" /> Attacker</div>
          <p className="text-sm opacity-80 mt-2">Proposes offensive steps…</p>
        </div>
        <div className="rounded-xl border p-3 shadow-sm bg-black/10">
          <div className="flex items-center gap-2 font-medium"><Shield className="h-4 w-4" /> Defender</div>
          <p className="text-sm opacity-80 mt-2">Validates / mitigates…</p>
        </div>
        <div className="rounded-xl border p-3 shadow-sm bg-black/10">
          <div className="flex items-center gap-2 font-medium"><Scale className="h-4 w-4" /> Decider</div>
          <p className="text-sm opacity-80 mt-2">Merges to final action…</p>
        </div>
      </div>
    </aside>
  );
}
