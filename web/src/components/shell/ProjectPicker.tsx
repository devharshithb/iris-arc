"use client";

import { useAppStore } from "@/lib/store";

export default function ProjectPicker({
  threadId,
}: {
  threadId: string;
}) {
  const { projects, assignThreadToProject } = useAppStore();

  return (
    <select
      onChange={(e) =>
        assignThreadToProject(threadId, e.target.value || undefined)
      }
      className="rounded-md border bg-transparent text-xs px-1.5 py-1"
      defaultValue=""
      title="Move to project"
      style={{ borderColor: "var(--border-weak)" }}
    >
      <option value="">Unsorted</option>
      {projects.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}
