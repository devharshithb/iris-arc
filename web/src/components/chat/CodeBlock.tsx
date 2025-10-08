"use client";

import { useState, useMemo } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

export default function CodeBlock({
  className,
  children,
}: {
  className?: string;
  children: string | string[];
}) {
  // ReactMarkdown may pass an array; normalize to a single string
  const code = useMemo(
    () => (Array.isArray(children) ? children.join("") : (children ?? "")),
    [children]
  );

  const [copied, setCopied] = useState(false);
  const lang =
    (className || "")
      .split(" ")
      .find((c) => c.startsWith("language-"))
      ?.replace("language-", "") || "text";

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied");
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div className="relative group">
      <pre className="rounded-xl border overflow-auto my-4">
        <code className={`language-${lang} block p-4`}>{code}</code>
      </pre>

      <button
        onClick={onCopy}
        className="absolute top-2 right-2 hidden group-hover:flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-white/10"
        style={{ backgroundColor: "var(--surface-chat)", borderColor: "var(--border-weak)" }}
        title="Copy code"
        aria-label="Copy code"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
