"use client";

import { useTranslations } from "next-intl";
import { Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function CopiesGeneratingSkeleton({ count }: { count: number }) {
  const t = useTranslations("adCopies.copiesGenerating");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
            <Zap className="size-4 text-primary animate-pulse" />
          </div>
          <div className="space-y-0.5 pt-0.5">
            <CardTitle className="text-base">{t("title", { count })}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-muted/20 p-4 space-y-2 animate-pulse" style={{ animationDelay: `${i * 0.12}s` }}>
              <div className="h-3.5 rounded-md bg-primary/10 w-3/4" />
              <div className="space-y-1.5 pt-1">
                <div className="h-2.5 rounded bg-muted w-full" />
                <div className="h-2.5 rounded bg-muted w-[85%]" />
                <div className="h-2.5 rounded bg-muted w-[60%]" />
              </div>
              <div className="pt-1 flex gap-1.5 flex-wrap">
                <div className="h-5 w-16 rounded-full bg-primary/10" />
                <div className="h-5 w-12 rounded-full bg-primary/10" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
