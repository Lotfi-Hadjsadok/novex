"use client";

import "./ad-creative.css";
import { useTranslations } from "next-intl";
import { Sparkles, ImageIcon, Type, Tag } from "lucide-react";
import type { AdAspectRatio } from "@/types/ad-creative";
import { getRatioCssAspect } from "@/types/ad-creative";

const STEP_ICONS = { 1: ImageIcon, 2: Type, 3: Tag } as const;
const GENERATING_TASKS = [
  { delay: "0s", pct: 75 },
  { delay: "0.45s", pct: 50 },
  { delay: "0.9s", pct: 28 },
] as const;

export function StepPreview({
  step,
  generating,
  aspectRatio,
}: {
  step: 1 | 2 | 3;
  generating: boolean;
  aspectRatio: AdAspectRatio;
}) {
  const tc = useTranslations("common");
  const ts = useTranslations("adCreative.steps");
  const Icon = STEP_ICONS[step];
  const label = ts(`step${step}Label`);
  const description = ts(`step${step}Desc`);

  return (
    <div
      className="mx-auto w-full max-w-full rounded-xl overflow-hidden border border-primary/15 bg-muted/20 flex items-center justify-center flex-1 min-h-[320px]"
      style={{ aspectRatio: getRatioCssAspect(aspectRatio), maxHeight: "420px" }}
    >
      {generating ? (
        <div className="sp-instruction rounded-2xl border border-primary/20 bg-background/85 backdrop-blur-sm px-5 py-5 shadow-md mx-3 w-full max-w-[300px]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12 text-primary shrink-0">
                <Sparkles className="size-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{tc("generatingCopy")}</p>
                <p className="text-[10px] text-muted-foreground">{tc("stepOfThree", { step: 3 })}</p>
              </div>
            </div>
            <div className="space-y-2">
              {GENERATING_TASKS.map((task, i) => (
                <div
                  key={i}
                  className="sp-task-item flex items-center gap-2"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0 bg-primary animate-bounce"
                    style={{ animationDelay: task.delay }}
                  />
                  <span className="text-xs text-foreground/90 flex-1">{ts(`generatingTask${i + 1}`)}</span>
                  <div
                    className="w-10 h-1.5 rounded-full bg-muted overflow-hidden shrink-0"
                    style={{ '--fill-pct': `${task.pct}%` } as React.CSSProperties}
                  >
                    <div
                      className="sp-fill-bar h-full rounded-full block"
                      style={{ animationDelay: `${i * 0.35}s` } as React.CSSProperties}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="sp-instruction rounded-2xl border border-primary/20 bg-background/80 backdrop-blur-sm px-5 py-6 shadow-md mx-3 w-full max-w-[280px] text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/20">
              <Icon className="size-6" />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/80">
                {tc("stepN", { step })}
              </p>
              <h3 className="text-sm font-semibold text-foreground leading-tight">{label}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
