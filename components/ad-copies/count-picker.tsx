"use client";

import { AD_COPY_COUNTS, type AdCopyCount } from "@/types/ad-copies";
import { cn } from "@/lib/utils";

export function CountPicker({
  value,
  onChange,
}: {
  value: AdCopyCount;
  onChange: (count: AdCopyCount) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {AD_COPY_COUNTS.map((count) => (
        <button
          key={count}
          type="button"
          onClick={() => onChange(count)}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl border-2 text-sm font-semibold transition-all duration-150",
            value === count
              ? "border-primary bg-primary/5 text-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]"
              : "border-border bg-muted/20 text-foreground hover:border-primary/40 hover:bg-muted/40"
          )}
        >
          {count}
        </button>
      ))}
    </div>
  );
}
