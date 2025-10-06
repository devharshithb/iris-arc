"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import {
  Plus, Mic, AudioLines, Square, FileText,
  Image as Img, FileJson, FileSpreadsheet, X, Paperclip,
} from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Auto-expanding Composer
 * - Baseline min-height: 127px; grows with text (caps and scrolls).
 * - Width: 50.26% of screen.
 * - Sits 30px above browser bottom.
 * - While streaming: textarea remains editable (you can type a follow-up),
 *   but Enter-to-send and Send/+ are disabled. Only Stop is active.
 */

const ACCEPT = [
  "application/pdf", "text/plain", "text/markdown", "text/csv",
  "image/png", "image/jpeg", "application/json",
];

type DraftAttachment = { id: string; name: string; mime: string; size: number };

function fileKind(mime: string, name: string) {
  const lower = name.toLowerCase();
  if (mime === "application/pdf" || lower.endsWith(".pdf"))
    return { label: "PDF", color: "bg-red-500", chip: "bg-red-500/20 text-red-300", icon: FileText };
  if (mime.startsWith("image/") || /\.(png|jpg|jpeg|gif|webp|svg)$/.test(lower))
    return { label: "IMG", color: "bg-blue-500", chip: "bg-blue-500/20 text-blue-300", icon: Img };
  if (mime === "application/json" || lower.endsWith(".json"))
    return { label: "JSON", color: "bg-emerald-500", chip: "bg-emerald-500/20 text-emerald-300", icon: FileJson };
  if (mime === "text/markdown" || lower.endsWith(".md"))
    return { label: "MD", color: "bg-violet-500", chip: "bg-violet-500/20 text-violet-300", icon: FileText };
  if (mime === "text/plain" || lower.endsWith(".txt"))
    return { label: "TXT", color: "bg-zinc-500", chip: "bg-zinc-500/20 text-zinc-200", icon: FileText };
  if (mime === "text/csv" || lower.endsWith(".csv"))
    return { label: "CSV", color: "bg-lime-500", chip: "bg-lime-500/20 text-lime-300", icon: FileSpreadsheet };
  return { label: "FILE", color: "bg-zinc-600", chip: "bg-zinc-500/20 text-zinc-200", icon: FileText };
}

const trim = (n: string, max = 28) => (n.length > max ? n.slice(0, max - 6) + "…" + n.slice(-5) : n);

/* Sizing */
const WIDTH_RATIO = 0.5026;
const MIN_COMPOSER_HEIGHT = 127;
const MAX_COMPOSER_HEIGHT = 240;
const GAP_TO_BOTTOM = 30;
const SECOND_ROW_PX = 44;
const ROW_GAP_PX = 8;
const OUTER_Y_PADDING = 24;
const TEXTAREA_LINE_H = 24;
const TA_MAX_LINES = 8;

export default function Composer() {
  const [text, setText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const {
    sendUserMessage, stream, stopStream,
    addDraftFiles, removeDraftFile, draftFiles,
    setComposerHeight,
  } = useAppStore();

  const isSendingLocked = stream.isStreaming; // lock sending, not typing

  // width from screen
  const [screenW, setScreenW] = useState<number>(0);
  useEffect(() => {
    const calc = () => setScreenW(window.innerWidth);
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  const composerWidth = useMemo(
    () => (screenW > 0 ? Math.floor(screenW * WIDTH_RATIO) : undefined),
    [screenW]
  );

  // Refs to measure dynamic heights
  const taRef = useRef<HTMLTextAreaElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);

  const applyComposerHeight = (h: number) => {
    const clamped = Math.max(MIN_COMPOSER_HEIGHT, Math.min(h, MAX_COMPOSER_HEIGHT));
    setComposerHeight(clamped);
    return clamped;
  };

  const recalcComposerHeight = () => {
    const chipsH = chipsRef.current ? chipsRef.current.offsetHeight : 0;
    const ta = taRef.current;
    let taH = TEXTAREA_LINE_H; // one-line baseline

    if (ta) {
      ta.style.height = "auto";
      const maxTaPx = TEXTAREA_LINE_H * TA_MAX_LINES;
      taH = Math.min(ta.scrollHeight, maxTaPx);
      ta.style.height = `${taH}px`;
      ta.style.overflowY = ta.scrollHeight > maxTaPx ? "auto" : "hidden";
    }

    const row1Content = chipsH + taH;
    const total = OUTER_Y_PADDING + row1Content + ROW_GAP_PX + SECOND_ROW_PX + OUTER_Y_PADDING;
    applyComposerHeight(total);
    return total;
  };

  useEffect(() => {
    setComposerHeight(MIN_COMPOSER_HEIGHT);
    requestAnimationFrame(recalcComposerHeight);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    requestAnimationFrame(recalcComposerHeight);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftFiles, composerWidth, text]);

  // files
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chooseFiles = () => fileInputRef.current?.click();

  const onFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const take = Array.from(files).slice(0, 10 - draftFiles.length);
    const mapped = take.map((f) => ({
      id: `${Date.now()}_${f.name}_${Math.random().toString(36).slice(2, 6)}`,
      name: f.name,
      mime: f.type || "application/octet-stream",
      size: f.size,
    }));
    if (!mapped.length) return toast.error("Unsupported file type.");
    addDraftFiles(mapped as any);
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    if (!isSendingLocked) onFiles(e.dataTransfer.files);
  };
  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => e.preventDefault();
  const onDragEnter: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    dragCounter.current += 1;
    setIsDragging(true);
  };
  const onDragLeave: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) setIsDragging(false);
  };

  const send = () => {
    if (isSendingLocked) return; // block send while streaming
    const t = text.trim();
    if (!t && draftFiles.length === 0) return;
    sendUserMessage(t || "(sent with attachments)");
    setText("");
    if (taRef.current) {
      taRef.current.value = "";
      taRef.current.style.height = "auto";
      taRef.current.style.overflowY = "hidden";
    }
    requestAnimationFrame(recalcComposerHeight);
  };

  const onType = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    requestAnimationFrame(recalcComposerHeight);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && stream.isStreaming) stopStream();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stream.isStreaming, stopStream]);

  const visible = draftFiles.slice(0, 3);
  const overflow = draftFiles.length - visible.length;

  return (
    <>
      {/* Composer wrapper: 30px from bottom */}
      <div className="pointer-events-none absolute inset-x-0" style={{ bottom: GAP_TO_BOTTOM, zIndex: 30 }}>
        <TooltipProvider delayDuration={80}>
          <div
            className={[
              "pointer-events-auto relative rounded-[22px] border shadow-lg",
              "px-4 py-2.5 md:px-5 md:py-3",
              "bg-[#303030]",
              "transition-all duration-150 ease-out",
              isDragging ? "ring-2 ring-white/20" : "",
            ].join(" ")}
            style={{
              width: composerWidth ? `${composerWidth}px` : undefined,
              maxWidth: composerWidth,
              marginInline: "auto",
              willChange: "height,width",
            }}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
          >
            {/* ROW 1 — files + textarea (auto-grow) */}
            <div className="flex flex-col gap-2">
              <div ref={chipsRef}>
                {draftFiles.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap overflow-visible">
                    {visible.map((f: any) => {
                      const k = fileKind(f.mime, f.name);
                      const Icon = k.icon;
                      return (
                        <div
                          key={f.id}
                          className="group relative rounded-2xl border border-white/10 bg-[#2b2b2b] px-3 py-1.5 text-xs flex items-center gap-2"
                        >
                          <div className={`grid place-items-center size-6 rounded-md ${k.color} text-white`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="max-w-[220px] truncate">{trim(f.name, 26)}</span>
                          <button
                            onClick={() => removeDraftFile(f.id)}
                            className="ml-1 rounded-full border border-white/20 w-5 h-5 grid place-items-center hover:bg-white/10"
                            title="Remove"
                            aria-label="Remove"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}

                    {overflow > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="shrink-0 rounded-full border border-white/15 w-8 h-8 grid place-items-center text-sm hover:bg-white/10 cursor-default">
                            +{overflow}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[320px] text-xs">
                          <div className="space-y-1">
                            {draftFiles.slice(3).map((f: any) => {
                              const k = fileKind(f.mime, f.name); const Icon = k.icon;
                              return (
                                <div key={f.id} className="flex items-center gap-2">
                                  <div className={`grid place-items-center size-5 rounded ${k.color} text-white`}>
                                    <Icon className="h-3.5 w-3.5" />
                                  </div>
                                  <span className="truncate">{f.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                )}
              </div>

              {/* Textarea (editable while streaming, but cannot send) */}
              <div>
                <textarea
                  ref={taRef}
                  value={text}
                  onChange={onType}
                  onKeyDown={(e) => {
                    if (isSendingLocked) {
                      if (e.key === "Enter") e.preventDefault(); // don't send during stream
                      return;
                    }
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder={isSendingLocked ? "Type a follow-up… (generation in progress)" : "Ask anything"}
                  className="w-full bg-transparent outline-none resize-none text-[16px] leading-6 placeholder:opacity-60 py-1"
                  rows={1}
                  style={{ overflowY: "hidden" }}
                />
              </div>
            </div>

            {/* ROW 2 — helper + icons */}
            <div className="mt-1 flex items-center justify-between text-xs opacity-85" style={{ height: SECOND_ROW_PX }}>
              <div className="flex items-center gap-2">
                <Paperclip className="h-3.5 w-3.5" />
                <span>Drag & drop files · Enter to send</span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Add files */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={!isSendingLocked ? chooseFiles : undefined}
                      disabled={isSendingLocked}
                      className="grid size-8 place-items-center rounded-full border border-white/15 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Add files and more"
                      title={isSendingLocked ? "Disabled while generating" : "Add files and more"}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  {!isSendingLocked && <TooltipContent className="text-xs">Add files and more</TooltipContent>}
                </Tooltip>

                {/* Voice (placeholder) */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="grid size-8 place-items-center rounded-full border border-white/15 hover:bg-white/10"
                      title="Voice (soon)"
                      aria-label="Voice"
                      disabled
                    >
                      <Mic className="h-4 w-4 opacity-80" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">Voice (soon)</TooltipContent>
                </Tooltip>

                {/* Send / Stop */}
                {isSendingLocked ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => stopStream()}
                        className="grid size-9 place-items-center rounded-full border border-white/15 hover:bg-white/10 transition-colors"
                        title="Stop"
                        aria-label="Stop"
                      >
                        <Square className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">Stop</TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={send}
                        className="grid size-9 place-items-center rounded-full border border-white/15 hover:bg-white/10 transition-colors"
                        title="Send"
                        aria-label="Send"
                      >
                        <AudioLines className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">Send</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => onFiles(e.target.files)}
              className="hidden"
              accept={ACCEPT.join(",")}
            />
          </div>
        </TooltipProvider>
      </div>

      {/* Footer line (visual only; scrolling space handled in ChatList) */}
      <div
        className="pointer-events-none absolute inset-x-0 text-center text-[12px] opacity-70"
        style={{ bottom: GAP_TO_BOTTOM - 20 }}
      >
        IrisArc can make mistakes. Check important info.
      </div>
    </>
  );
}
