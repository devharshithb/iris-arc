"use client";

import type { Message } from "@/lib/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import { useMemo } from "react";

/**
 * Single chat message
 * - maxWidth is passed from ChatList to match the Composer INNER width.
 * - User: rounded box with #303030, right aligned feel.
 * - Assistant: rich Markdown; paragraphs justified, “pattern/design” blocks left.
 */

export default function ChatMessage({
  msg,
  maxWidth,
}: {
  msg: Message;
  maxWidth: number;
}) {
  const isUser = msg.role === "user";
  const parts = useMemo(() => msg.parts || [], [msg.parts]);

  return (
    <div className="w-full">
      <div
        className={[
          "mx-auto",
          isUser
            ? "rounded-2xl bg-[#303030] px-4 py-3 border border-white/10"
            : "",
        ].join(" ")}
        style={{
          maxWidth,
          width: "100%",
          overflowWrap: "anywhere",
          wordBreak: "break-word",
        }}
      >
        {parts.map((p, i) => {
          if (p.kind === "text") {
            if (isUser) {
              return (
                <div
                  key={i}
                  className="whitespace-pre-wrap leading-7 text-[15px] text-white"
                  style={{ textAlign: "left" }}
                >
                  {p.text}
                </div>
              );
            }
            return (
              <div
                key={i}
                className="md-justify prose prose-invert max-w-none prose-pre:my-4 prose-code:before:content-[''] prose-code:after:content-['']"
                style={{
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeHighlight]}
                  components={{
                    a: ({ node, ...props }) => (
                      <a {...props} target="_blank" rel="noopener noreferrer" />
                    ),
                  }}
                >
                  {p.text}
                </ReactMarkdown>

                {/* Scoped rules: justify prose paragraphs; keep patterns/design left-aligned */}
                <style jsx global>{`
                  /* Justify only normal paragraph prose inside assistant messages */
                  .md-justify p {
                    text-align: justify;
                  }

                  /* Do NOT justify headings, lists, list items, code blocks, tables, blockquotes */
                  .md-justify h1,
                  .md-justify h2,
                  .md-justify h3,
                  .md-justify h4,
                  .md-justify h5,
                  .md-justify h6,
                  .md-justify ul,
                  .md-justify ol,
                  .md-justify li,
                  .md-justify pre,
                  .md-justify code,
                  .md-justify table,
                  .md-justify blockquote,
                  .md-justify hr {
                    text-align: initial;
                  }

                  /* Paragraphs that appear *inside* list items should stay left-aligned */
                  .md-justify li > p {
                    text-align: initial;
                  }

                  /* Keep table cells readable */
                  .md-justify table th,
                  .md-justify table td {
                    text-align: left;
                    vertical-align: top;
                  }
                `}</style>
              </div>
            );
          }
          if (p.kind === "code") {
            return (
              <pre key={i} className="rounded-xl border overflow-auto my-4">
                <code className={`language-${p.lang || "text"} block p-4`}>
                  {p.code}
                </code>
              </pre>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
