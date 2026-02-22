"use client";

import { AD_ASPECT_RATIOS, getRatioCssAspect, type AdAspectRatio } from "@/types/ad-creative";
import { cn } from "@/lib/utils";

export function AspectRatioPicker({
  value,
  onChange,
}: {
  value: AdAspectRatio;
  onChange: (ratio: AdAspectRatio) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {AD_ASPECT_RATIOS.map((ratio) => (
        <button
          key={ratio.value}
          type="button"
          onClick={() => onChange(ratio.value)}
          className={cn(
            "flex flex-col items-center gap-2 rounded-xl border-2 p-2.5 transition-all duration-150",
            value === ratio.value
              ? "border-primary bg-primary/5 shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]"
              : "border-border bg-muted/20 hover:border-primary/40 hover:bg-muted/40"
          )}
        >
          <div className="flex items-center justify-center w-full h-9">
            <div
              className={cn(
                "rounded border-2 transition-colors",
                value === ratio.value ? "border-primary bg-primary/20" : "border-muted-foreground/40 bg-muted/50"
              )}
              style={{
                aspectRatio: getRatioCssAspect(ratio.value),
                maxWidth: "100%",
                maxHeight: "100%",
                width: ratio.value === "16:9" ? "100%" : undefined,
                height: ratio.value === "16:9" ? undefined : "100%",
              }}
            />
          </div>
          <div className="text-center">
            <p className={cn("text-[11px] font-semibold leading-none", value === ratio.value ? "text-primary" : "text-foreground")}>
              {ratio.label}
            </p>
            <p className="text-[9px] text-muted-foreground mt-0.5 leading-none">{ratio.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
