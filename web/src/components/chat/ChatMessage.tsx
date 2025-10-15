"use client";

import CodeBlock from "@/components/chat/CodeBlock";
import MessageToolbar from "@/components/chat/MessageToolbar";
import { useAppStore } from "@/lib/store";
import type { Message } from "@/lib/types";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

/**
 * ChatMessage
 * - User messages: simple text bubbles.
 * - Assistant messages: clean, well-spaced Markdown with code blocks.
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

  // Flatten for editing/copy
  const plain = useMemo(() => {
    return parts
      .map((p) => {
        if (p.kind === "text" && typeof p.text === "string") return p.text;
        if (p.kind === "text" && typeof p.text === "object")
          return JSON.stringify(p.text);
        if (p.kind === "code" && typeof p.code === "string") return p.code;
        return "";
      })
      .join("\n\n")
      .trim();
  }, [parts]);

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
    editMessage(msg.id, text);
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
          "mx-auto group relative transition-all",
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

        {/* ---- EDIT MODE ---- */}
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
          <div>
            {parts.map((p, i) => {
              if (p.kind === "text") {
                if (isUser) {
                  return (
                    <div
                      key={i}
                      className="whitespace-pre-wrap leading-[1.75] text-[15px]"
                      style={{ textAlign: "left", marginBottom: "0.5rem" }}
                    >
                      {p.text}
                    </div>
                  );
                }
                return (
                  <div
                    key={i}
                    className="prose prose-invert max-w-none prose-pre:my-4 prose-code:before:content-[''] prose-code:after:content-[''] md-justify"
                    style={{
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                      lineHeight: 1.75,
                    }}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        code({ inline, className, children, ...props }: any) {
                          const raw =
                            Array.isArray(children) && children.length
                              ? children.join("")
                              : String(children ?? "");
                          const isBlock =
                            !inline &&
                            (/\blanguage-/.test(className || "") || raw.includes("\n"));
                          if (!isBlock) {
                            return (
                              <code
                                className={className}
                                style={{
                                  background: "rgba(255,255,255,0.1)",
                                  borderRadius: "4px",
                                  padding: "0.2em 0.4em",
                                }}
                                {...props}
                              >
                                {raw}
                              </code>
                            );
                          }
                          return (
                            <CodeBlock className={className || "language-text"}>
                              {raw}
                            </CodeBlock>
                          );
                        },
                        a: ({ node, ...props }) => (
                          <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline"
                          />
                        ),
                      }}
                    >
                      {p.text}
                    </ReactMarkdown>

                    {/* Markdown spacing rules */}
                    <style jsx global>{`
                      .md-justify p {
                        text-align: justify;
                        line-height: 1.75;
                        margin-top: 0.8em;
                        margin-bottom: 0.8em;
                      }
                      .md-justify h1,
                      .md-justify h2,
                      .md-justify h3,
                      .md-justify h4,
                      .md-justify h5,
                      .md-justify h6 {
                        text-align: left;
                        margin-top: 1.2em;
                        margin-bottom: 0.6em;
                        line-height: 1.4;
                      }
                      .md-justify ul,
                      .md-justify ol {
                        text-align: left;
                        margin-left: 1.25em;
                        margin-top: 0.8em;
                        margin-bottom: 0.8em;
                        line-height: 1.7;
                      }
                      .md-justify code {
                        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
                        font-size: 0.9em;
                      }
                      .md-justify pre {
                        border-radius: 10px;
                        background: rgba(255, 255, 255, 0.05);
                        line-height: 1.6;
                      }
                      .md-justify blockquote {
  border-left: 3px solid var(--blockquote-border);
  padding-left: 1em;
  color: var(--blockquote-text);
  font-style: italic;
  margin: 1em 0;
  background: var(--blockquote-bg);
  border-radius: 6px;
  padding: 0.75em 1em;
}

                      .md-justify hr {
                        border-color: rgba(255, 255, 255, 0.2);
                        margin: 1.5em 0;
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
          </div>
        )}
      </div>
    </div>
  );
}
