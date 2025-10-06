"use client";

import { useEffect, useState } from "react";
import { Image as Img, FileText, Waves } from "lucide-react";
import { useAppStore } from "@/lib/store";

const ACCEPTED = ["Files"]; // dataTransfer.types includes "Files" for file drags

export default function DropOverlay() {
  const { addDraftFiles, draftFiles } = useAppStore();
  const [show, setShow] = useState(false);
  const [dragDepth, setDragDepth] = useState(0);

  useEffect(() => {
    const onDragEnter = (e: DragEvent) => {
      if (!e.dataTransfer?.types?.some((t) => ACCEPTED.includes(t))) return;
      e.preventDefault();
      setDragDepth((d) => d + 1);
      setShow(true);
    };

    const onDragOver = (e: DragEvent) => {
      if (!e.dataTransfer?.types?.some((t) => ACCEPTED.includes(t))) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    };

    const onDragLeave = (e: DragEvent) => {
      if (!e.dataTransfer?.types?.some((t) => ACCEPTED.includes(t))) return;
      e.preventDefault();
      setDragDepth((d) => Math.max(0, d - 1));
    };

    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      const fl = e.dataTransfer?.files;
      if (fl && fl.length) {
        const max = Math.max(0, 10 - draftFiles.length);
        const files = Array.from(fl).slice(0, max).map((f) => ({
          id: `${Date.now()}_${f.name}_${Math.random().toString(36).slice(2, 6)}`,
          name: f.name,
          mime: f.type || "application/octet-stream",
          size: f.size,
        }));
        if (files.length) addDraftFiles(files);
      }
      setDragDepth(0);
      setShow(false);
    };

    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);

    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, [addDraftFiles, draftFiles.length]);

  useEffect(() => {
    if (dragDepth === 0) setShow(false);
  }, [dragDepth]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm ring-2 ring-dashed ring-white/20
                 animate-in fade-in-0 duration-150"
      aria-hidden="true"
    >
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="relative mx-auto mb-3">
            <div className="grid place-items-center h-16 w-16 rounded-full bg-black/50 border shadow-lg">
              <Img className="h-7 w-7" />
            </div>
            <FileText className="h-5 w-5 absolute -left-4 top-1/2 -translate-y-1/2 opacity-80" />
            <Waves className="h-5 w-5 absolute -right-4 top-1/2 -translate-y-1/2 opacity-80" />
          </div>
          <div className="text-[22px] font-semibold">Add anything</div>
          <div className="mt-1 text-sm opacity-80">
            Drop files anywhere to attach them to the conversation
          </div>
        </div>
      </div>
    </div>
  );
}
