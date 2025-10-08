"use client";

import { useAppStore } from "@/lib/store";
import {
  ShieldAlert,
  Search,
  Bug,
  FileText,
  Network,
  Inbox,
} from "lucide-react";

/**
 * Empty-state tiles for Security Analysts
 * - Respect the same max width as messages via CSS var `--message-max`
 * - No props needed; no SSR/CSR width mismatch
 */
export default function LandingTiles() {
  const { sendUserMessage } = useAppStore();

  const tiles = [
    {
      title: "Start Incident Triage",
      desc: "Summarize alerts, scope impact, propose next steps.",
      icon: ShieldAlert,
      prompt:
        "You are my incident triage copilot. Given a set of alerts, produce: 1) concise summary, 2) likely root cause, 3) immediate actions, 4) artifacts to collect, 5) risk rating. Ask me for missing context.",
    },
    {
      title: "IOC Hunting",
      desc: "Search logs/endpoints for hashes, IPs, domains.",
      icon: Search,
      prompt:
        "I want to hunt for IOCs. Generate a step-by-step plan and sample queries for SIEM/EDR to find suspicious hashes, IPs, and domains. Include guidance for false-positive reduction.",
    },
    {
      title: "Malware Pivoting",
      desc: "Analyze artifacts and pivot to infrastructure.",
      icon: Bug,
      prompt:
        "Given a suspicious binary or script, outline how to triage quickly: strings, VT, sandbox heuristics, network indicators, and infrastructure pivoting. Include commands and tools.",
    },
    {
      title: "Phishing Analysis",
      desc: "Headers, URLs, attachments, and user impact.",
      icon: Inbox,
      prompt:
        "Help me analyze a suspected phishing email. Provide a checklist for headers, URLs, attachments, user activity, and containment guidance. Include quick scripts for URL decoding.",
    },
    {
      title: "Network Forensics",
      desc: "PCAP/flow review and lateral movement clues.",
      icon: Network,
      prompt:
        "Guide me through network forensics on a PCAP/flow set: identify C2 beacons, exfil patterns, and lateral movement. Provide filters and commands for tshark/Zeek.",
    },
    {
      title: "IR Report Draft",
      desc: "Executive summary + technical appendix.",
      icon: FileText,
      prompt:
        "Draft an incident report template: Executive Summary, Timeline, Affected Assets, Root Cause, Impact, Immediate Actions, Lessons Learned, Appendix (IOCs, queries, scripts).",
    },
  ];

  return (
    <div
      className="mx-auto"
      style={{ maxWidth: "var(--message-max)", width: "100%" }}
      aria-label="Security analyst quick-start tiles"
    >
      <div className="mb-3 text-sm opacity-70">
        Quick start for security analysis
      </div>

      <div
        className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3"
        style={{ alignItems: "stretch" }}
      >
        {tiles.map(({ title, desc, icon: Icon, prompt }) => (
          <button
            key={title}
            onClick={() => sendUserMessage(prompt)}
            className="group text-left rounded-xl border p-3 hover:bg-white/5 transition-colors"
            style={{ borderColor: "var(--border-weak)", background: "transparent" }}
          >
            <div className="flex items-center gap-2">
              <div
                className="grid place-items-center rounded-md size-8"
                style={{
                  backgroundColor:
                    "color-mix(in oklch, var(--surface-composer), #000 12%)",
                  border: "1px solid var(--border-weak)",
                }}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="font-medium">{title}</div>
            </div>
            <div className="mt-1.5 text-xs opacity-75 leading-5">{desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
