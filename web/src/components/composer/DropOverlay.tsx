"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAppStore } from "@/lib/store";

const ACCEPTED = ["Files"];

export default function DropOverlay({
  heroSrc = "/drop-hero.png", // transparent PNG in /public
  heroAlt = "Drop files",
}: {
  heroSrc?: string;
  heroAlt?: string;
}) {
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
      className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-in fade-in-0 duration-150"
      aria-hidden="true"
    >
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center flex flex-col items-center">
          {/* Hero image (no background circle) */}
          <Image
            src={heroSrc}
            alt={heroAlt}
            width={120}
            height={120}
            priority
            draggable={false}
            className="mb-3 select-none"
            style={{ objectFit: "contain" }}
          />
          <div className="text-[22px] font-semibold">Add anything</div>
          <div className="mt-1 text-sm opacity-80 max-w-[300px]">
            Drop files anywhere to attach them to the conversation
          </div>
        </div>
      </div>
    </div>
  );
}
