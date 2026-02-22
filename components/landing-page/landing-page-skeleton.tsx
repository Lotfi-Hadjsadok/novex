"use client";

import "./landing-page.css";
import { useTranslations } from "next-intl";
import { Layers } from "lucide-react";

const PALETTE_TASK_DELAYS = [
  { delay: "0s", pct: 85 },
  { delay: "0.45s", pct: 52 },
  { delay: "0.9s", pct: 25 },
] as const;

export function LandingPageSkeleton() {
  const tc = useTranslations("common");
  const tds = useTranslations("landingPage.designSkeleton");
  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-card border border-border">
      <div className="relative p-4">
        <div className="rounded-2xl border border-primary/20 bg-background/85 backdrop-blur-sm px-5 py-5 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <Layers className="size-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{tc("pickingDesignSystem")}</p>
                <p className="text-[10px] text-muted-foreground">{tc("colorTypographyAesthetic")}</p>
              </div>
            </div>
            <div className="space-y-2">
              {PALETTE_TASK_DELAYS.map((task, i) => (
                <div
                  key={i}
                  className="lp-task-item flex items-center gap-2"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0 bg-primary animate-bounce"
                    style={{ animationDelay: task.delay }}
                  />
                  <span className="text-xs text-foreground/90 flex-1">{tds(`task${i + 1}`)}</span>
                  <div
                    className="w-14 h-1.5 rounded-full bg-muted overflow-hidden shrink-0"
                    style={{ '--fill-pct': `${task.pct}%` } as React.CSSProperties}
                  >
                    <div
                      className="lp-fill-bar h-full rounded-full block"
                      style={{ animationDelay: `${i * 0.35}s` } as React.CSSProperties}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-primary/10 flex flex-col gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {tc("choosingColors")}
              </p>
              <div className="flex gap-1.5">
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="lp-color-cycle flex-1 h-10 rounded-lg border border-white/20 overflow-hidden shrink-0"
                    style={{
                      background: `linear-gradient(145deg, hsl(${50 + i * 45}, 70%, 50%) 0%, hsl(${20 + i * 50}, 80%, 35%) 100%)`,
                      animationDelay: `${i * 0.08}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
