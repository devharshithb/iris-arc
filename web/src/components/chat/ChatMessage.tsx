"use client";

import type { Message } from "@/lib/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import { useMemo, useRef, useState, useLayoutEffect } from "react";
import CodeBlock from "@/components/chat/CodeBlock";
import MessageToolbar from "@/components/chat/MessageToolbar";
import { useAppStore } from "@/lib/store";

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
  const { editMessage, stream } = useAppStore();

  // Flatten to plain text for editing/copy
  const plain = useMemo(
    () =>
      parts
        .map((p) => (p.kind === "text" ? p.text : p.kind === "code" ? p.code : ""))
        .join("\n\n"),
    [parts]
  );

  // ---- inline edit state (user only)
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(plain);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    if (!editing) return;
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "0px";
    ta.style.height = Math.max(38, ta.scrollHeight) + "px";
  }, [editing, draft]);

  const onSave = () => {
    if (stream.isStreaming || !isUser) return;
    const text = draft.trim();
    editMessage(msg.id, text); // triggers a fresh assistant reply (no variants)
    setEditing(false);
  };

  const onCancel = () => {
    setDraft(plain);
    setEditing(false);
  };

  return (
    <div className="w-full">
      <div
        className={[
          "mx-auto group relative",
          isUser ? "rounded-2xl px-4 py-3 border" : "",
        ].join(" ")}
        style={{
          maxWidth,
          width: "100%",
          overflowWrap: "anywhere",
          wordBreak: "break-word",
          backgroundColor: isUser ? "var(--bubble-user-bg)" : undefined,
          borderColor: isUser ? "var(--border-weak)" : undefined,
        }}
      >
        <MessageToolbar
          messageId={msg.id}
          role={msg.role}
          textContent={plain}
          onEditStart={
            isUser
              ? () => {
                  setDraft(plain);
                  setEditing(true);
                }
              : undefined
          }
        />

        {/* ---- EDIT MODE (user only) ---- */}
        {editing && isUser ? (
          <div>
            <textarea
              ref={taRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  onSave();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  onCancel();
                }
              }}
              className="w-full bg-transparent outline-none resize-none text-[15px] leading-7 border rounded-md px-2 py-2"
              style={{ borderColor: "var(--border-weak)" }}
              rows={3}
            />
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={onSave}
                disabled={stream.isStreaming}
                className="rounded-md border px-2 py-1 text-xs hover:bg-white/10 disabled:opacity-50"
                style={{ borderColor: "var(--border-weak)" }}
                title={
                  stream.isStreaming
                    ? "Wait for generation to finish"
                    : "Save (Cmd/Ctrl+Enter)"
                }
              >
                Save
              </button>
              <button
                onClick={onCancel}
                className="rounded-md border px-2 py-1 text-xs hover:bg-white/10"
                style={{ borderColor: "var(--border-weak)" }}
              >
                Cancel
              </button>
              <div className="text-[11px] opacity-70 ml-auto">
                Cmd/Ctrl+Enter to save · Esc to cancel
              </div>
            </div>
          </div>
        ) : (
          // ---- VIEW MODE ----
          <>
            {parts.map((p, i) => {
              if (p.kind === "text") {
                if (isUser) {
                  return (
                    <div
                      key={i}
                      className="whitespace-pre-wrap leading-7 text-[15px]"
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
                    style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw, rehypeHighlight]}
                      components={{
                        code({ className, children, ...props }: any) {
                          const raw = Array.isArray(children)
                            ? children.join("")
                            : String(children ?? "");
                          const hasLang = /\blanguage-/.test(className || "");
                          const isMultiline = raw.includes("\n");
                          const isBlock = hasLang || isMultiline;

                          if (!isBlock) {
                            return (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          }
                          return <CodeBlock className={className}>{raw}</CodeBlock>;
                        },
                        a: ({ node, ...props }) => (
                          <a {...props} target="_blank" rel="noopener noreferrer" />
                        ),
                      }}
                    >
                      {p.text}
                    </ReactMarkdown>

                    {/* Scoped rules: justify prose paragraphs; keep patterns/design left-aligned */}
                    <style jsx global>{`
                      .md-justify p { text-align: justify; }
                      .md-justify h1, .md-justify h2, .md-justify h3, .md-justify h4,
                      .md-justify h5, .md-justify h6, .md-justify ul, .md-justify ol,
                      .md-justify li, .md-justify pre, .md-justify code,
                      .md-justify table, .md-justify blockquote, .md-justify hr {
                        text-align: initial;
                      }
                      .md-justify li > p { text-align: initial; }
                      .md-justify table th, .md-justify table td {
                        text-align: left; vertical-align: top;
                      }
                    `}</style>
                  </div>
                );
              }

              if (p.kind === "code") {
                return (
                  <CodeBlock key={i} className={`language-${p.lang || "text"}`}>
                    {p.code}
                  </CodeBlock>
                );
              }

              return null;
            })}
          </>
        )}
      </div>
    </div>
  );
}
