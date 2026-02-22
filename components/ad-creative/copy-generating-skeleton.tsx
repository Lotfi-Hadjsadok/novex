"use client";

import "./ad-creative.css";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function CopyGeneratingSkeleton() {
  const t = useTranslations("adCreative.generating");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
            <Sparkles className="size-4 text-primary animate-pulse" />
          </div>
          <div className="space-y-0.5 pt-0.5">
            <CardTitle className="text-base">{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          {(
            [
              { label: t("analyzingImages"), delay: "0s", pct: 85 },
              { label: t("writingCopy"), delay: "0.45s", pct: 52 },
              { label: t("craftingFeatures"), delay: "0.9s", pct: 25 },
            ] as const
          ).map(({ label, delay, pct }, i) => (
            <div
              key={i}
              className="ac-task-item flex items-center gap-2"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0 bg-primary animate-bounce"
                style={{ animationDelay: delay }}
              />
              <span className="text-xs text-foreground/90 flex-1">{label}</span>
              <div
                className="w-10 h-1.5 rounded-full bg-muted overflow-hidden shrink-0"
                style={{ "--fill-pct": `${pct}%` } as React.CSSProperties}
              >
                <div
                  className="ac-fill-bar h-full rounded-full block"
                  style={{ animationDelay: `${i * 0.35}s` } as React.CSSProperties}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            {t("copyPreview")}
          </p>
          <div className="space-y-2 animate-pulse">
            <div className="h-3.5 rounded-md bg-primary/10 w-4/5" />
            <div className="h-3.5 rounded-md bg-primary/10 w-[55%]" />
            <div className="h-2.5 rounded bg-muted w-2/3 mt-1" />
          </div>
          <div className="border-t border-border/40 pt-3 flex gap-2 flex-wrap">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-6 w-16 rounded-full bg-primary/12 animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
