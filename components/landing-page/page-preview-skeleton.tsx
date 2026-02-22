"use client";

import "./landing-page.css";
import { useTranslations } from "next-intl";
import { Sparkles, ImageIcon, Type, Tag } from "lucide-react";

const STEP_ICONS = { 1: ImageIcon, 2: Type, 3: Tag } as const;
const GENERATING_TASK_DELAYS = [
  { delay: "0s", pct: 75 },
  { delay: "0.45s", pct: 50 },
  { delay: "0.9s", pct: 28 },
] as const;

export function PagePreviewSkeleton({
  step,
  generating,
}: {
  step: 1 | 2 | 3;
  generating: boolean;
}) {
  const tc = useTranslations("common");
  const ts = useTranslations("landingPage.steps");
  const Icon = STEP_ICONS[step];
  const label = ts(`step${step}Label`);
  const description = ts(`step${step}Desc`);

  return (
    <div className="relative p-4">
      {generating ? (
        <div className="pp-instruction rounded-2xl border border-primary/20 bg-background/85 backdrop-blur-sm px-5 py-5 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <Sparkles className="size-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{tc("generatingCopy")}</p>
                <p className="text-[10px] text-muted-foreground">{tc("stepOfThree", { step: 3 })}</p>
              </div>
            </div>
            <div className="space-y-2">
              {GENERATING_TASK_DELAYS.map((task, i) => (
                <div
                  key={i}
                  className="pp-task-item flex items-center gap-2"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="sc-dot w-1.5 h-1.5 rounded-full shrink-0 bg-primary" style={{ animationDelay: task.delay }} />
                  <span className="text-xs text-foreground/90 flex-1">{ts(`generatingTask${i + 1}`)}</span>
                  <div
                    className="w-14 h-1.5 rounded-full bg-muted overflow-hidden shrink-0"
                    style={{ '--fill-pct': `${task.pct}%` } as React.CSSProperties}
                  >
                    <div
                      className="pp-fill-bar h-full rounded-full block"
                      style={{ animationDelay: `${i * 0.35}s` } as React.CSSProperties}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="pp-instruction rounded-2xl border border-primary/20 bg-background/80 backdrop-blur-sm px-5 py-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/20">
              <Icon className="size-5" />
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/80">
                {tc("stepN", { step })}
              </p>
              <h3 className="text-sm font-semibold text-foreground leading-tight">
                {label}
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground max-w-[200px] mx-auto">
                {description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
