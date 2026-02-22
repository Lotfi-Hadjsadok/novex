"use client";

import "./ad-copies.css";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AnglesGeneratingSkeleton() {
  const t = useTranslations("adCopies.generating");

  return (
    <div className="space-y-4">
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
          {(
            [
              { label: t("studyingImages"),      pct: 90 },
              { label: t("identifyingAudience"), pct: 70 },
              { label: t("craftingAngles"),       pct: 45 },
            ] as const
          ).map(({ label, pct }, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full animate-bounce shrink-0"
                    style={{ background: "hsl(var(--primary))", animationDelay: `${i * 0.25}s` }}
                  />
                  <span className="text-sm text-muted-foreground">{label}</span>
                </div>
                <span className="acf-pct text-[10px] tabular-nums text-muted-foreground/50">{pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                className="acf-fill-bar h-full rounded-full"
                style={{ '--fill-pct': `${pct}%`, animationDelay: `${i * 0.4}s` } as React.CSSProperties}
                />
              </div>
            </div>
          ))}

          <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">{t("anglePreview")}</p>
            <div className="space-y-3 animate-pulse">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-lg border bg-card/50 p-3 space-y-1.5">
                  <div className="h-3 rounded-md bg-primary/10 w-1/3" />
                  <div className="h-2.5 rounded bg-muted w-4/5" />
                  <div className="h-2.5 rounded bg-muted w-2/3" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
