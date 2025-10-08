"use client";

import type { Message } from "@/lib/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import { useMemo } from "react";
import CodeBlock from "@/components/chat/CodeBlock";
import MessageToolbar from "@/components/chat/MessageToolbar";

export default function ChatMessage({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  const parts = useMemo(() => msg.parts || [], [msg.parts]);

  const plain = useMemo(
    () =>
      parts
        .map((p) =>
          p.kind === "text" ? p.text : p.kind === "code" ? p.code : ""
        )
        .join("\n\n"),
    [parts]
  );

  return (
    <div className="w-full">
      <div
        className={[
          "mx-auto group relative",
          isUser ? "rounded-2xl px-4 py-3 border" : "",
        ].join(" ")}
        style={{
          maxWidth: "var(--message-max)",
          width: "100%",
          overflowWrap: "anywhere",
          wordBreak: "break-word",
          backgroundColor: isUser ? "var(--bubble-user-bg)" : undefined,
          borderColor: isUser ? "var(--border-weak)" : undefined,
        }}
      >
        <MessageToolbar messageId={msg.id} role={msg.role} textContent={plain} />

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
      </div>
    </div>
  );
}
