"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { AdCreativePhase } from "@/store/ad-creative-store";

const PHASE_KEYS = ["product", "pricing", "review", "design"] as const;
const PHASE_MAP: Record<AdCreativePhase, (typeof PHASE_KEYS)[number]> = {
  Product: "product",
  Language: "product",
  Pricing: "pricing",
  Review: "review",
  Design: "design",
};

export function AdCreativeStepIndicator({ phase }: { phase: AdCreativePhase }) {
  const t = useTranslations("phases");
  const activeIndex = PHASE_KEYS.indexOf(PHASE_MAP[phase]);

  return (
    <div className="flex items-center justify-center">
      {PHASE_KEYS.map((phaseKey, phaseIndex) => (
        <div key={phaseKey} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold border-2 transition-all duration-300",
                phaseIndex < activeIndex
                  ? "bg-primary border-primary text-primary-foreground"
                  : phaseIndex === activeIndex
                    ? "bg-primary border-primary text-primary-foreground shadow-[0_0_0_4px_hsl(var(--primary)/0.12)]"
                    : "bg-background border-border text-muted-foreground"
              )}
            >
              {phaseIndex < activeIndex ? "✓" : phaseIndex + 1}
            </div>
            <span
              className={cn(
                "text-[10px] font-medium hidden sm:block",
                phaseIndex <= activeIndex ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {t(phaseKey)}
            </span>
          </div>
          {phaseIndex < PHASE_KEYS.length - 1 && (
            <div
              className={cn(
                "mx-2 mb-4 h-px w-8 sm:w-12 transition-colors duration-300",
                phaseIndex < activeIndex ? "bg-primary/60" : "bg-border"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
