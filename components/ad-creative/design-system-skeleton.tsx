"use client";

import "./ad-creative.css";
import { useTranslations } from "next-intl";
import { Layers } from "lucide-react";
import type { AdAspectRatio } from "@/types/ad-creative";
import { getRatioCssAspect } from "@/types/ad-creative";

const PALETTE_TASKS = [
  { delay: "0s", pct: 85 },
  { delay: "0.45s", pct: 52 },
  { delay: "0.9s", pct: 25 },
] as const;

export function DesignSystemSkeleton({ aspectRatio }: { aspectRatio: AdAspectRatio }) {
  const tc = useTranslations("common");
  const tds = useTranslations("adCreative.designSkeleton");

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-card border border-border">
      <div className="p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-0.5">
          {tc("pickingDesignSystem")}
        </p>
        <div
          className="mx-auto ac-block rounded-xl overflow-hidden border border-primary/15 bg-muted/20 flex items-center justify-center"
          style={{ aspectRatio: getRatioCssAspect(aspectRatio), maxHeight: "340px" }}
        >
          <div className="rounded-2xl border border-primary/20 bg-background/85 backdrop-blur-sm px-4 py-4 shadow-md mx-3 w-full max-w-[220px]">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12 text-primary shrink-0">
                  <Layers className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{tc("pickingDesignSystem")}</p>
                  <p className="text-[10px] text-muted-foreground">{tc("colorTypographyAesthetic")}</p>
                </div>
              </div>
              <div className="space-y-2">
                {PALETTE_TASKS.map((task, i) => (
                  <div
                    key={i}
                    className="ac-task-item flex items-center gap-2"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0 bg-primary animate-bounce"
                      style={{ animationDelay: task.delay }}
                    />
                    <span className="text-xs text-foreground/90 flex-1">{tds(`task${i + 1}`)}</span>
                    <div
                      className="w-10 h-1.5 rounded-full bg-muted overflow-hidden shrink-0"
                      style={{ '--fill-pct': `${task.pct}%` } as React.CSSProperties}
                    >
                      <div
                        className="ac-fill-bar h-full rounded-full block"
                        style={{ animationDelay: `${i * 0.35}s` } as React.CSSProperties}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-primary/10 flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="ac-color-cycle flex-1 h-6 rounded-md border border-white/20"
                    style={{
                      background: `linear-gradient(145deg, hsl(${50 + i * 55}, 70%, 50%) 0%, hsl(${20 + i * 50}, 80%, 35%) 100%)`,
                      animationDelay: `${i * 0.1}s`,
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
