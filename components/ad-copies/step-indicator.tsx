"use client";

import { useTranslations } from "next-intl";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdCopiesStepIndicator({ step, phase }: { step: number; phase: string }) {
  const t = useTranslations("adCopies.steps");

  const steps = [
    { label: t("product"),  desc: t("productDesc") },
    { label: t("settings"), desc: t("settingsDesc") },
    { label: t("pricing"),  desc: t("pricingDesc") },
  ];

  return (
    <div className="flex items-center gap-1">
      {steps.map((s, i) => {
        const idx       = i + 1;
        const isDone    = idx < step;
        const isCurrent = idx === step;
        return (
          <div key={i} className="flex items-center gap-1">
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-colors",
                  isDone    ? "bg-primary text-primary-foreground" :
                  isCurrent ? "bg-primary/15 text-primary ring-2 ring-primary/30" :
                              "bg-muted text-muted-foreground"
                )}
              >
                {isDone ? <Check className="size-3" /> : idx}
              </div>
              <div className="hidden sm:block">
                <p className={cn("text-xs font-medium leading-none", isCurrent ? "text-foreground" : "text-muted-foreground")}>
                  {s.label}
                </p>
                <p className="text-[10px] text-muted-foreground/70 leading-none mt-0.5">{s.desc}</p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={cn("mx-1 h-px w-6 sm:w-10", isDone ? "bg-primary/40" : "bg-border")} />
            )}
          </div>
        );
      })}
      <div className="ms-2 flex items-center gap-1.5">
        <div className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-colors",
          phase === "Angles" || phase === "Copies"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}>
          <Sparkles className="size-3" />
        </div>
        <p className={cn(
          "hidden sm:block text-xs font-medium leading-none",
          phase === "Angles" || phase === "Copies" ? "text-foreground" : "text-muted-foreground"
        )}>
          {phase === "Copies" ? t("copies") : t("generate")}
        </p>
      </div>
    </div>
  );
}
