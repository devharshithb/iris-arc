"use client";

const tiles = [
  "Summarize this PDF I’ll upload",
  "Create a study plan for NLP midterm",
  "Write a FastAPI endpoint with JWT",
  "Explain this error log in plain English",
  "Draft an outreach email for sponsors",
];

export default function EmptyState({ onPick }: { onPick?: (text: string) => void }) {
  return (
    <div className="h-[60vh] grid place-items-center opacity-90">
      <div className="text-center">
        <div className="text-lg font-semibold mb-3">How can I help you today?</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-[720px]">
          {tiles.map((t) => (
            <button
              key={t}
              onClick={() => onPick?.(t)}
              className="rounded-xl border bg-black/10 px-3 py-2 text-sm text-left hover:bg-white/10 transition"
              title={t}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
