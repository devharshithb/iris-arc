"use client";

import { Check, Copy } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function CodeBlock({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  // Normalize code safely (preserve whitespace/newlines)
  const code = useMemo(() => {
    if (Array.isArray(children)) {
      return children
        .map((child) =>
          typeof child === "string"
            ? child
            : typeof child === "number"
              ? String(child)
              : ""
        )
        .join("")
        .trimEnd();
    }
    if (typeof children === "string" || typeof children === "number") {
      return String(children).trimEnd();
    }
    return "";
  }, [children]);

  const [copied, setCopied] = useState(false);

  const lang =
    (className || "")
      .split(" ")
      .find((c) => c.startsWith("language-"))
      ?.replace("language-", "") || "text";

  const onCopy = async () => {
    if (!code) {
      toast.error("Nothing to copy");
      return;
    }
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied");
      setTimeout(() => setCopied(false), 1100);
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div className="relative group my-4">
      <pre
        className="rounded-md overflow-auto border transition-colors duration-150"
        style={{
          background: "var(--cb-bg)",
          borderColor: "var(--cb-border)",
        }}
      >
        <code
          className={`language-${lang} block p-3 md:p-4 whitespace-pre`}
          style={{
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            fontSize: "0.92rem",
            lineHeight: 1.6,
          }}
        >
          {code}
        </code>
      </pre>

      <button
        onClick={onCopy}
        className="absolute top-2 right-2 hidden group-hover:flex items-center gap-1 rounded-sm px-2 py-1 text-xs transition"
        style={{
          background: "var(--cb-btn-bg)",
          border: "1px solid var(--cb-btn-border)",
          backdropFilter: "blur(6px)",
        }}
        title="Copy code"
        aria-label="Copy code"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>

      {/* Theme variables inheriting from your global.css */}
      <style jsx>{`
        :global(:root) {
          /* Light theme (default in your global.css) */
          --cb-bg: color-mix(in oklch, var(--surface-composer), #000 3%);
          --cb-border: var(--border-weak);
          --cb-btn-bg: color-mix(in oklch, var(--surface-composer), #000 5%);
          --cb-btn-border: var(--border-weak);
        }

        :global(.dark) {
          /* Dark theme (when .dark is active) */
          --cb-bg: color-mix(in oklch, var(--surface-composer), #fff 4%);
          --cb-border: var(--border-weak);
          --cb-btn-bg: color-mix(in oklch, var(--surface-composer), #fff 6%);
          --cb-btn-border: var(--border-weak);
        }
      `}</style>
    </div>
  );
}
