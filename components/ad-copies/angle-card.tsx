"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const ANGLE_ICONS: Record<string, string> = {
  "benefit":      "✦",
  "pain-point":   "⚡",
  "lifestyle":    "◈",
  "urgency":      "◉",
  "social-proof": "★",
  "curiosity":    "◎",
};

export function AngleCard({
  angle,
  selected,
  onSelect,
}: {
  angle: { id: string; name: string; description: string; headline_preview: string; hook: string };
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative w-full rounded-xl border-2 p-4 text-left transition-all duration-150",
        selected
          ? "border-primary bg-primary/5 shadow-[0_0_0_4px_hsl(var(--primary)/0.10)]"
          : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-base transition-colors",
            selected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
          )}>
            {ANGLE_ICONS[angle.id] ?? "◆"}
          </span>
          <div>
            <p className={cn("text-[13px] font-semibold leading-none", selected ? "text-primary" : "text-foreground")}>
              {angle.name}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{angle.description}</p>
          </div>
        </div>
        {selected && (
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary">
            <Check className="size-3 text-primary-foreground" />
          </div>
        )}
      </div>

      <div className="mt-3 rounded-lg bg-muted/40 px-3 py-2.5 space-y-1">
        <p className={cn("text-[13px] font-semibold leading-snug", selected ? "text-foreground" : "text-foreground/80")}>
          &ldquo;{angle.headline_preview}&rdquo;
        </p>
        <p className="text-[11px] text-muted-foreground italic leading-snug">
          {angle.hook}
        </p>
      </div>
    </button>
  );
}
